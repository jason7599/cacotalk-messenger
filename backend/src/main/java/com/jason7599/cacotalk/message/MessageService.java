package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.conversation.ConversationMembershipService;
import com.jason7599.cacotalk.conversation.ConversationService;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.message.dto.MessagePage;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.user.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
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
    private final ConversationMembershipService conversationMembershipService;

    private final EventMessageService eventMessageService;
    private final UserService userService;

    private MessageResponse fromProjection(MessageResponse.Projection p) {
        return new MessageResponse(
                p.getConversationId(),
                p.getSeq(),
                p.getSenderId(),
                p.getSenderName(),
                p.getType(),
                eventMessageService.decode(p.getEvent()),
                p.getContent(),
                p.getCreatedAt()
        );
    }

    public MessagePage loadInitial(UUID conversationId, long userId) {
        // Membership assertion is done here
        long lastReadSeq = conversationMembershipService
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
        conversationMembershipService.requireMembership(conversationId, userId);

        List<MessageResponse> messages = messageRepository.fetchOlderMessages(conversationId, beforeSeq, PAGE_SIZE)
                .stream()
                .map(this::fromProjection)
                .toList();

        boolean hasOlder = !messages.isEmpty() && messages.getFirst().seq() != 1L;

        return new MessagePage(messages, hasOlder);
    }

    // TODO: publish websocket eventData
    @Transactional
    public MessageResponse sendUserMessage(
            long userId,
            UUID conversationId,
            String content,
            UUID clientId
    ) {
        // This also includes the membership check
        if (!conversationService.canSendMessage(userId, conversationId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot send a message in this conversation.");
        }

        content = content.trim();
        if (content.isEmpty() ||  content.length() > MESSAGE_MAX_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Content has to have between 1-%d characters.".formatted(MESSAGE_MAX_LENGTH));
        }

        // TODO: Consider including username in AuthUser Principal and also caching it in Redis session
        @SuppressWarnings("OptionalGetWithoutIsPresent")
        // SAFE: given userId passed not only AuthenticationFilter, but also requireMembership, which is FK-backed.
        String username = userService.findById(userId).get().username();

        // Idempotent
        MessageEntity existing = messageRepository.findByClientId(clientId).orElse(null);
        if (existing != null) {
            // This would actually be a concerning scenario.
            // clientId collision, but the request not matching the existing message.
            // Either it's an actual, one in a GAZILLION uuid collision, or
            // it means a malicious actor is probing for existing clientIds.
            // Either way, a 409 is raised so no big damage will be done
            if (!existing.getSenderId().equals(userId) || !existing.getId().conversationId().equals(conversationId)
            || !existing.getContent().equals(content)) {
                log.warn("clientId collision: user {} submitted clientId {} already owned by sender {} in conversation {}",
                        userId, clientId, existing.getSenderId(), existing.getId().conversationId());

                throw new ApiException(HttpStatus.CONFLICT, "This message cannot be sent.");
            }

            return new MessageResponse(
                    conversationId,
                    existing.getId().seq(),
                    userId,
                    username,
                    MessageType.USER,
                    null,
                    existing.getContent(),
                    existing.getCreatedAt()
            );
        }

        // Fails explicitly on clientId conflict.
        // Making it no-op on conflict would lead to an incremented seq without actual message insertion.
        // So the clientId exists check is done separately.
        MessageEntity inserted = messageRepository.insertMessage(
                conversationId,
                userId,
                MessageType.USER.name(),
                null,
                content,
                clientId
        );

        return new MessageResponse(
                conversationId,
                inserted.getId().seq(),
                userId,
                username,
                MessageType.USER,
                null,
                content,
                inserted.getCreatedAt()
        );
    }
}
