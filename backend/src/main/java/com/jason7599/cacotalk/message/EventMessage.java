package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.user.dto.UserResponse;

import java.util.List;

// BEAUTY
public sealed interface EventMessage {

    EventMessageType type();

    static Class<? extends EventMessage> getClass(EventMessageType type) {
        return switch (type) {
            case GROUP_CREATED -> EventMessage.GroupCreated.class;
            case USER_INVITED -> EventMessage.UserInvited.class;
            case USER_LEFT -> EventMessage.UserLeft.class;
            case USER_REMOVED -> EventMessage.UserRemoved.class;
            case GROUP_CLOSED -> EventMessage.GroupClosed.class;
        };
    };

    record GroupCreated(List<UserResponse> initMembers) implements EventMessage {
        @Override
        public EventMessageType type() { return EventMessageType.GROUP_CREATED; }
    }

    record UserInvited(UserResponse subject) implements EventMessage {
        @Override
        public EventMessageType type() { return EventMessageType.USER_INVITED; }
    }

    record UserLeft(UserResponse subject) implements EventMessage {
        @Override
        public EventMessageType type() { return EventMessageType.USER_LEFT; }
    }

    record UserRemoved(UserResponse subject) implements EventMessage {
        @Override
        public EventMessageType type() { return EventMessageType.USER_REMOVED; }
    }

    record GroupClosed() implements EventMessage {
        @Override
        public EventMessageType type() { return EventMessageType.GROUP_CLOSED; }
    }
}