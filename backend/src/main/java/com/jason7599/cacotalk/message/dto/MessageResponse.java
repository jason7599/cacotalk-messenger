package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID conversationId,
        long seq,
        Long senderId,
        String senderName,
        MessageType type,
        EventMessageType eventType,
        JsonNode eventData,
        String content,
        Instant createdAt
) {

    public static MessageResponse fromProjection(MessageProjection proj) {
        return new MessageResponse(
                proj.getConversationId(),
                proj.getSeq(),
                proj.getSenderId(),
                proj.getSenderName(),
                proj.getType(),
                proj.getEventType(),
                proj.getEventData(),
                proj.getContent(),
                proj.getCreatedAt()
        );
    }
}
