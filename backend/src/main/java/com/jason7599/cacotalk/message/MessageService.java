package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.conversation.ConversationService;
import com.jason7599.cacotalk.message.dto.MessagePage;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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

    private final MessageRepository messageRepository;
    private final ConversationService conversationService;

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
                .map(MessageResponse::fromProjection)
                .toList();

        boolean hasOlder = !messages.isEmpty() && messages.getFirst().seq() != 1L;

        return new MessagePage(messages, hasOlder);
    }

    public MessagePage loadOlder(UUID conversationId, long userId, long beforeSeq) {
        conversationService.requireMembership(conversationId, userId);

        List<MessageResponse> messages = messageRepository.fetchOlderMessages(conversationId, beforeSeq, PAGE_SIZE)
                .stream()
                .map(MessageResponse::fromProjection)
                .toList();

        boolean hasOlder = !messages.isEmpty() && messages.getFirst().seq() != 1L;

        return new MessagePage(messages, hasOlder);
    }
}
