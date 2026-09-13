package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageEntity;
import com.jason7599.cacotalk.message.MessageType;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        long id,
        UUID conversationId,
        Long senderId,
        MessageType type,
        EventMessageType eventType,
        JsonNode eventData,
        String content,
        Instant createdAt
) {
    public MessageResponse(MessageEntity e) {
        this(
                e.getId(),
                e.getConversationId(),
                e.getSenderId(),
                e.getType(),
                e.getEventType(),
                e.getEventData(),
                e.getContent(),
                e.getCreatedAt()
        );
    }
}
