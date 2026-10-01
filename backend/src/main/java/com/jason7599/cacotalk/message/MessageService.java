package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.conversation.ConversationService;
import com.jason7599.cacotalk.conversation.MembershipLookupService;
import com.jason7599.cacotalk.exceptions.ApiErrorCodes;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.message.dto.MessagePage;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.user.UserService;
import com.jason7599.cacotalk.websocket.RealtimeEvent;
import com.jason7599.cacotalk.websocket.RealtimeEventPublisher;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private final MessageRepository messageRepository;

    private final MessageEncryptionService messageEncryptionService;
    private final ConversationService conversationService;
    private final MembershipLookupService membershipLookupService;

    private final EventMessageService eventMessageService;
    private final UserService userService;

    private final RealtimeEventPublisher realtimeEventPublisher;

    private MessageResponse fromProjection(MessageResponse.Projection p) {
        return new MessageResponse(
                p.getConversationId(),
                p.getSeq(),
                p.getSenderId(),
                p.getSenderName(),
                p.getType(),
                eventMessageService.decode(p.getEvent()),
                p.getContent() != null
                        ? messageEncryptionService.decrypt(p.getContent())
                        : null,
                p.getCreatedAt()
        );
    }

    public MessagePage loadInitial(UUID conversationId, long userId) {
        // Membership assertion is done here
        long lastReadSeq = membershipLookupService
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
        membershipLookupService.requireMembership(conversationId, userId);

        List<MessageResponse> messages = messageRepository.fetchOlderMessages(conversationId, beforeSeq, PAGE_SIZE)
                .stream()
                .map(this::fromProjection)
                .toList();

        boolean hasOlder = !messages.isEmpty() && messages.getFirst().seq() != 1L;

        return new MessagePage(messages, hasOlder);
    }

    @Transactional
    public MessageResponse sendUserMessage(
            long userId,
            UUID conversationId,
            String content,
            UUID clientId
    ) {
        // This also includes the membership check
        if (!conversationService.canSendMessage(conversationId, userId)) {
            throw new ApiException(ApiErrorCodes.CANNOT_SEND_MESSAGE);
        }

        // TODO: Consider including username in AuthUser Principal and also caching it in Redis session
        @SuppressWarnings("OptionalGetWithoutIsPresent")
        // SAFE: given userId passed not only AuthenticationFilter, but also requireMembership, which is FK-backed.
        String username = userService.findById(userId).get().username();

        // Idempotent, found existing by clientId
        MessageEntity existing = messageRepository.findByClientId(clientId).orElse(null);
        if (existing != null) {
            // This would actually be a concerning scenario.
            // clientId collision, but the request not matching the existing message.
            // Either it's an actual, one in a GAZILLION uuid collision, or
            // it means a malicious actor is probing for existing clientIds.
            // Either way, an error is thrown so no big damage will be done
            if (!existing.getSenderId().equals(userId) || !existing.getId().conversationId().equals(conversationId)) {
                log.warn("clientId collision: user {} submitted clientId {} already owned by sender {} in conversation {}",
                        userId, clientId, existing.getSenderId(), existing.getId().conversationId());

                throw new ApiException(ApiErrorCodes.CANNOT_SEND_MESSAGE);
            }

            // If the request matches with the existing value
            return new MessageResponse(
                    conversationId,
                    existing.getId().seq(),
                    userId,
                    username,
                    MessageType.USER,
                    null,
                    messageEncryptionService.decrypt(existing.getContent()),
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
                messageEncryptionService.encrypt(content),
                clientId
        );

        // Explicit ack here.
        // This is done so that the user's own message never appears as unread.
        // This also triggers a MARK_AS_READ event to the sender's other sessions.
        conversationService.markAsRead(
                conversationId,
                userId,
                inserted.getId().seq()
        );

        MessageResponse message = new MessageResponse(
                conversationId,
                inserted.getId().seq(),
                userId,
                username,
                MessageType.USER,
                null,
                content,
                inserted.getCreatedAt()
        );

        realtimeEventPublisher.broadcast(
                conversationId,
                new RealtimeEvent.NewMessage(message, clientId)
        );

        return message;
    }
}
