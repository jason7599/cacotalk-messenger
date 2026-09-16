package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.message.dto.MessageResponse;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record ConversationSummary(
        UUID id,
        ConversationType type,

        List<String> membersPreview,// list of usernames of other users. excludes requesting user. Should be size 1 for DIRECT
        int memberCount, // exclude user

        Long groupCreatorId, // GROUP type only

        long lastSeq,
        long lastReadSeq,

        Instant createdAt,

        MessageResponse lastMessage
) {
    public static ConversationSummary fromProjection(ConversationSummaryProjection proj) {
        return new ConversationSummary(
                proj.getConversationId(),
                proj.getConversationType(),
                Arrays.asList(proj.getMembersPreview()),
                proj.getMemberCount(),
                proj.getGroupCreatorId(),
                proj.getLastSeq(),
                proj.getLastReadSeq(),
                proj.getConversationCreatedAt(),
                proj.getLastSeq() != 0L
                        ? new MessageResponse(
                                proj.getConversationId(),
                                proj.getLastSeq(),
                                proj.getLastMessageSenderId(),
                                proj.getLastMessageSenderName(),
                                proj.getLastMessageType(),
                                proj.getLastMessageEventType(),
                                proj.getLastMessageEventData(),
                                proj.getLastMessageContent(),
                                proj.getLastMessageCreatedAt()
                        )
                        : null
        );
    }
}
