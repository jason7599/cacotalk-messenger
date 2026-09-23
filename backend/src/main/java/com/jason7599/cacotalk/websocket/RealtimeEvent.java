package com.jason7599.cacotalk.websocket;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.user.dto.UserResponse;

import java.util.UUID;

public sealed interface RealtimeEvent {

    enum Type {
        NEW_MESSAGE,

        // Unlike NEW_MESSAGE, below are "self-events"
        // To keep multi-session users' clients in sync.
        // Only to be sent per user, not broadcasted.
        // Let's call them, self-sync-events.
        CONTACT_CHANGED,
        BLOCK_CHANGED,
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

    record ContactChanged(UserResponse subject, boolean added) implements RealtimeEvent {
        @Override
        public Type type() { return Type.CONTACT_CHANGED; }
    }

    record BlockChanged(UserResponse subject, boolean added) implements RealtimeEvent {
        @Override
        public Type type() { return Type.BLOCK_CHANGED; }
    }

    /*
    This covers both EventMessage.UserLeft and EventMessage.MemberRemoved
     */
    record RemovedFromGroup(UUID conversationId) implements RealtimeEvent {
        @Override
        public Type type() { return Type.REMOVED_FROM_GROUP; }
    }
}
