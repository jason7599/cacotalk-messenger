package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;
import com.jason7599.cacotalk.message.dto.MessageResponse;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record ConversationSummary(
        UUID id,
        ConversationType type,

        List<String> membersPreview, // list of usernames of other users. excludes requesting user. Should be size 1 for DIRECT
        int memberCount, // exclude user

        BlockStatus blockStatus, // DIRECT type only

        Long groupCreatorId, // GROUP type only
        boolean isClosed, // GROUP type only, default false in DIRECT

        Long lastReadMessageId,

        Instant createdAt,

        MessageResponse lastMessage
) {
    public enum BlockStatus {
        NONE,
        BLOCKED_BY_ME,
        BLOCKED_ME
    }

    public static ConversationSummary fromProjection(ConversationSummaryProjection proj) {
        return new ConversationSummary(
                proj.getConversationId(),
                ConversationType.valueOf(proj.getConversationType()),
                Arrays.asList(proj.getMembersPreview()),
                proj.getMemberCount(),
                BlockStatus.valueOf(proj.getBlockStatus()),
                proj.getGroupCreatorId(),
                proj.getIsClosed(),
                proj.getLastReadMessageId(),
                proj.getConversationCreatedAt(),
                proj.getLastMessageId() != null
                        ? new MessageResponse(
                                proj.getLastMessageId(),
                                proj.getConversationId(),
                                proj.getLastMessageSenderId(),
                                MessageType.valueOf(proj.getLastMessageType()),
                                proj.getLastMessageEventType() != null ? EventMessageType.valueOf(proj.getLastMessageEventType()) : null,
                                proj.getLastMessageEventData(),
                                proj.getLastMessageContent(),
                                proj.getLastMessageCreatedAt(),
                                null // clientId doesn't matter in summaries
                        )
                        : null
        );
    }
}
