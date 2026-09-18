package com.jason7599.cacotalk.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(long userId, Object payload) {
        messagingTemplate.convertAndSendToUser(
                Long.toString(userId),
                "/queue/events",
                payload
        );
    }
}
