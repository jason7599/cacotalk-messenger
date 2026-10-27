package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.message.EventMessage;
import com.jason7599.cacotalk.message.MessageType;
import com.jason7599.cacotalk.user.dto.UserResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ConversationSummary(
        UUID id,
        ConversationType type,
        List<UserResponse> membersPreview,  // preview list of members, excluding the requesting user. Should be size 1 for DIRECT
        int memberCount,                    // exclude user
        Long groupCreatorId,                // GROUP type only
        long lastReadSeq,
        LastMessage lastMessage,
        Instant createdAt
) {
    public record LastMessage(
            long seq,
            MessageType type,
            String senderName,
            String content,
            EventMessage event,
            Instant createdAt
    ) {}

    public interface Projection {
        UUID getConversationId();
        ConversationType getConversationType();
        String getMembersPreview(); // raw JSON blob of {userId, username} array.
        int getMemberCount();
        Long getGroupCreatorId();
        long getLastSeq();
        long getLastReadSeq();
        MessageType getLastMessageType();
        String getLastMessageSenderName();
        byte[] getLastMessageContent();
        String getLastMessageEvent();
        Instant getLastMessageCreatedAt();
        Instant getConversationCreatedAt();

    }
}
