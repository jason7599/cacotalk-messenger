package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventData;
import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID conversationId,
        long seq,
        Long senderId,
        String senderName,
        MessageType type,
        EventMessageType eventType,
        EventData eventData,
        String content,
        Instant createdAt
) {
    public interface Projection {
        UUID getConversationId();
        long getSeq();
        Long getSenderId();
        String getSenderName();
        MessageType getType();
        EventMessageType getEventType();
        String getEventData(); // raw json string
        String getContent();
        Instant getCreatedAt();
    }
}
