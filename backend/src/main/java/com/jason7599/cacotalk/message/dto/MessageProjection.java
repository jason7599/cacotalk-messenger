package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.EventMessageType;
import com.jason7599.cacotalk.message.MessageType;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public interface MessageProjection {
    UUID getConversationId();
    long getSeq();
    Long getSenderId();
    String getSenderName();
    MessageType getType();
    EventMessageType getEventType();
    JsonNode getEventData();
    String getContent();
    Instant getCreatedAt();
}
