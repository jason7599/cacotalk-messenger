package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.message.MessageType;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.user.dto.UserResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ConversationSummary(
        UUID id,
        ConversationType type,

        List<UserResponse> membersPreview,// preview list of other users. excludes requesting user. Should be size 1 for DIRECT
        int memberCount, // exclude user

        Long groupCreatorId, // GROUP type only

        long lastReadSeq,

        Instant createdAt,

        MessageResponse lastMessage
) {
    public interface Projection {
        UUID getConversationId();
        ConversationType getConversationType();
        String getMembersPreview(); // raw JSON blob of {userId, username} array.
        int getMemberCount();
        Long getGroupCreatorId();
        long getLastSeq();
        long getLastReadSeq();
        Instant getConversationCreatedAt();
        Long getLastMessageSenderId();
        String getLastMessageSenderName();
        MessageType getLastMessageType();
        String getLastMessageEvent();
        String getLastMessageContent();
        Instant getLastMessageCreatedAt();
    }
}
