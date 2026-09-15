package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.conversation.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    // Page size for when scrolling up
    private static final int PAGE_SIZE = 50;

    // How many older messages to fetch before the unread boundary
    private static final int INITIAL_CONTEXT_SIZE = 30;

    // Hard cap for initial load
    private static final int INITIAL_LOAD_LIMIT = 500;

    private final MessageRepository messageRepository;
    private final ConversationService conversationService;

}
