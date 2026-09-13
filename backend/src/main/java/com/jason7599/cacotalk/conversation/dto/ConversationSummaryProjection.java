package com.jason7599.cacotalk.conversation.dto;

import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public interface ConversationSummaryProjection {
    UUID getConversationId();
    String getConversationType();

    String[] getMembersPreview();
    int getMemberCount();

    String getBlockStatus();

    Long getGroupCreatorId();
    boolean getIsClosed();

    Long getLastReadMessageId();

    Instant getConversationCreatedAt();

    Long getLastMessageId();
    Long getLastMessageSenderId();
    String getLastMessageType();
    String getLastMessageEventType();
    JsonNode getLastMessageEventData();
    String getLastMessageContent();
    Instant getLastMessageCreatedAt();
}
