package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventMessage;
import com.jason7599.cacotalk.message.MessageType;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID conversationId,
        long seq,
        Long senderId,
        String senderName,
        MessageType type,
        EventMessage event,
        String content,
        ReplyTo replyTo,
        Instant createdAt
) {
    public record ReplyTo(
            long seq,
            String senderName,
            String content
    ) {}

    public interface Projection {
        UUID getConversationId();
        long getSeq();
        Long getSenderId();
        String getSenderName();
        MessageType getType();
        String getEvent(); // raw json string
        byte[] getContent();
        Long getReplyToSeq();
        String getReplyToSenderName();
        byte[] getReplyToContent();
        Instant getCreatedAt();
    }
}
