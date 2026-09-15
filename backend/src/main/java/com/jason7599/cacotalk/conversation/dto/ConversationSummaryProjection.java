package com.jason7599.cacotalk.conversation.dto;

import com.jason7599.cacotalk.conversation.ConversationType;
import com.jason7599.cacotalk.conversation.DirectBlockStatus;
import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public interface ConversationSummaryProjection {
    UUID getConversationId();
    ConversationType getConversationType();

    String[] getMembersPreview();
    int getMemberCount();

    DirectBlockStatus getBlockStatus();

    Long getGroupCreatorId();
    boolean getIsClosed();

    long getLastSeq();
    long getMyLastReadSeq();

    Instant getConversationCreatedAt();

    Long getLastMessageSenderId();
    String getLastMessageSenderName();
    MessageType getLastMessageType();
    EventMessageType getLastMessageEventType();
    JsonNode getLastMessageEventData();
    String getLastMessageContent();
    Instant getLastMessageCreatedAt();
}
