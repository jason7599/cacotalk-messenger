package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        long id,
        UUID conversationId,
        Long senderId,
        String senderName,
        MessageType type,
        EventMessageType eventType,
        JsonNode eventData,
        String content,
        Instant createdAt,
        UUID clientId
) {
}
