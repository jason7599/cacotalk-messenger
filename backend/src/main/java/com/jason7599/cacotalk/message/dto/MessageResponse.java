package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventMessage;
import com.jason7599.cacotalk.message.MessageType;
import com.jason7599.cacotalk.message.MessageReactionType;

import java.time.Instant;
import java.util.List;
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
        List<Reaction> reactions,
        Instant createdAt
) {
    public record Reaction(
            long userId,
            String username,
            MessageReactionType type
    ) {
    }

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
        String getReactions(); // raw json array
        Instant getCreatedAt();
    }
}
