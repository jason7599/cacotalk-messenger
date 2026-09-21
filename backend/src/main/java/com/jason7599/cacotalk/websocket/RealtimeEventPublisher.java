package com.jason7599.cacotalk.websocket;

import com.jason7599.cacotalk.conversation.ConversationMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationMembershipService conversationMembershipService;

    public void sendToUser(long userId, RealtimeEvent event) {
        messagingTemplate.convertAndSendToUser(
                Long.toString(userId),
                "/queue/events",
                event
        );
    }

    public void broadcast(UUID conversationId, RealtimeEvent event) {
        for (Long memberId : conversationMembershipService.getAllMemberIds(conversationId)) {
            sendToUser(memberId, event);
        }
    }
}
