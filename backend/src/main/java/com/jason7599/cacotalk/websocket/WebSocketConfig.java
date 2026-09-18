package com.jason7599.cacotalk.websocket;

import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // enables WebSocket + STOMP support
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.frontend-origin}")
    private String frontendOrigin;

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // this is only for establishing socket connections
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendOrigin);
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // these are routed to application controllers (@MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");

        // User-specific queues
        registry.setUserDestinationPrefix("/user");

        // In-memory message broker, maybe later replace with external broker like RabbitMQ
        // Broker is what keeps track of:
        // - Who subscribed to what
        // - Where messages should go
        // - Message fanout to subscribers
        registry.enableSimpleBroker("/queue");
    }
}
