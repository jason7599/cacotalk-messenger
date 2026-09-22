package com.jason7599.cacotalk.websocket;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.jason7599.cacotalk.message.dto.MessageResponse;

import java.util.UUID;

public sealed interface RealtimeEvent {

    enum Type {
        NEW_MESSAGE,
        REMOVED_FROM_GROUP,
    }

    Type type();

    // Gives Jackson a type property in the serialized JSON
    @JsonGetter("type")
    default Type jsonType() { return type(); }

    record NewMessage(MessageResponse message) implements RealtimeEvent {
        @Override
        public Type type() { return Type.NEW_MESSAGE; }
    }

    /*
    This covers both EventMessage.UserLeft and EventMessage.MemberRemoved
     */
    record RemovedFromGroup(UUID conversationId) implements RealtimeEvent {
        @Override
        public Type type() { return Type.REMOVED_FROM_GROUP; }
    }
}
