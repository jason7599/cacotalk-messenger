package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.conversation.ConversationService;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.message.dto.MessagePage;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.message.dto.SendMessageResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    // Page size for when scrolling up
    private static final int PAGE_SIZE = 50;

    // How many older messages to fetch before the unread boundary
    private static final int CONTEXT_SIZE = 30;

    // Hard cap for initial load
    private static final int INITIAL_LOAD_LIMIT = 500;

    private static final int MESSAGE_MAX_LENGTH = 2000;

    private final MessageRepository messageRepository;

    private final ConversationService conversationService;
    private final EventMessageService eventMessageService;

    private MessageResponse fromProjection(MessageResponse.Projection p) {
        return new MessageResponse(
                p.getConversationId(),
                p.getSeq(),
                p.getSenderId(),
                p.getSenderName(),
                p.getType(),
                p.getEventType(),
                eventMessageService.decode(
                        p.getEventType(),
                        p.getEventData()
                ),
                p.getContent(),
                p.getCreatedAt()
        );
    }

    public MessagePage loadInitial(UUID conversationId, long userId) {
        // Membership assertion is done here
        long lastReadSeq = conversationService
                .requireMembership(conversationId, userId)
                .lastReadSeq();

        List<MessageResponse> messages = messageRepository.fetchInitialMessages(
                conversationId,
                lastReadSeq,
                CONTEXT_SIZE,
                INITIAL_LOAD_LIMIT
        )
                .stream()
                .map(this::fromProjection)
                .toList();

        boolean hasOlder = !messages.isEmpty() && messages.getFirst().seq() != 1L;

        return new MessagePage(messages, hasOlder);
    }

    public MessagePage loadOlder(UUID conversationId, long userId, long beforeSeq) {
        conversationService.requireMembership(conversationId, userId);

        List<MessageResponse> messages = messageRepository.fetchOlderMessages(conversationId, beforeSeq, PAGE_SIZE)
                .stream()
                .map(this::fromProjection)
                .toList();

        boolean hasOlder = !messages.isEmpty() && messages.getFirst().seq() != 1L;

        return new MessagePage(messages, hasOlder);
    }

    // TODO: publish websocket eventData
    @Transactional
    public SendMessageResponse sendUserMessage(
            long userId,
            UUID conversationId,
            String content,
            UUID clientId
    ) {
        conversationService.requireMembership(conversationId, userId);

        if (!conversationService.canSendMessage(userId, conversationId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot send a message in this conversation.");
        }

        Optional<Long> existingSeq = messageRepository.findSeqByClientId(clientId);
        if (existingSeq.isPresent()) {
            // Idempotent
            return new SendMessageResponse(clientId, existingSeq.get());
        }

        content = content.trim();
        if (content.isEmpty() ||  content.length() > MESSAGE_MAX_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Content has to have between 1-2000 characters.");
        }

        // Fails explicitly on clientId conflict.
        // Making it no-op on conflict would lead to an incremented seq without actual message insertion.
        // So the clientId exists check is done separately.
        MessageEntity inserted = messageRepository.insertMessage(
                conversationId,
                userId,
                MessageType.USER.name(),
                null,
                null,
                content,
                clientId
        );

        return new SendMessageResponse(inserted.getClientId(), inserted.getId().seq());
    }
}
