package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import tools.jackson.databind.JsonNode;

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
    public interface Projection {
        UUID getConversationId();
        ConversationType getConversationType();
        String[] getMembersPreview();
        int getMemberCount();
        Long getGroupCreatorId();
        long getLastSeq();
        long getLastReadSeq();
        Instant getConversationCreatedAt();
        Long getLastMessageSenderId();
        String getLastMessageSenderName();
        MessageType getLastMessageType();
        EventMessageType getLastMessageEventType();
        JsonNode getLastMessageEventData();
        String getLastMessageContent();
        Instant getLastMessageCreatedAt();
    }

    public static ConversationSummary fromProjection(Projection p) {
        return new ConversationSummary(
                p.getConversationId(),
                p.getConversationType(),
                Arrays.asList(p.getMembersPreview()),
                p.getMemberCount(),
                p.getGroupCreatorId(),
                p.getLastSeq(),
                p.getLastReadSeq(),
                p.getConversationCreatedAt(),
                p.getLastSeq() != 0L
                        ? new MessageResponse(
                                p.getConversationId(),
                                p.getLastSeq(),
                                p.getLastMessageSenderId(),
                                p.getLastMessageSenderName(),
                                p.getLastMessageType(),
                                p.getLastMessageEventType(),
                                p.getLastMessageEventData(),
                                p.getLastMessageContent(),
                                p.getLastMessageCreatedAt()
                        )
                        : null
        );
    }
}
