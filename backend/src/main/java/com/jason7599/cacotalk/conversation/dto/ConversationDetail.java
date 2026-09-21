package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.user.dto.UserResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ConversationDetail(
        UUID id,
        ConversationType type,

        List<UserResponse> otherMembers, // entire list excluding the user

        boolean blockedMe, // DIRECT only
        boolean blockedByMe, // DIRECT only

        Long groupCreatorId, // GROUP only
        boolean isClosed, // GROUP only, defaults to false for DIRECT

        long lastSeq,
        long prevLastReadSeq,

        Instant createdAt
) {
    // members fetch is done separately
    // prevLastReadSeq can be done along the membership check
    public interface Projection {
        UUID getId();
        ConversationType getType();
        boolean getBlockedMe();
        boolean getBlockedByMe();
        Long getGroupCreatorId();
        boolean getIsClosed();
        long getLastSeq();
        Instant getCreatedAt();
    }
}
