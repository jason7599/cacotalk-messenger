package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.user.dto.UserResponse;

import java.util.List;

// BEAUTY
public sealed interface EventData {

    EventMessageType type();

    static Class<? extends EventData> getClass(EventMessageType type) {
        return switch (type) {
            case GROUP_CREATED -> EventData.GroupCreated.class;
            case USER_INVITED -> EventData.UserInvited.class;
            case USER_LEFT -> EventData.UserLeft.class;
            case USER_REMOVED -> EventData.UserRemoved.class;
            case GROUP_CLOSED -> EventData.GroupClosed.class;
        };
    };

    record GroupCreated(List<UserResponse> initMembers) implements EventData {
        @Override
        public EventMessageType type() { return EventMessageType.GROUP_CREATED; }
    }

    record UserInvited(UserResponse subject) implements EventData {
        @Override
        public EventMessageType type() { return EventMessageType.USER_INVITED; }
    }

    record UserLeft(UserResponse subject) implements EventData {
        @Override
        public EventMessageType type() { return EventMessageType.USER_LEFT; }
    }

    record UserRemoved(UserResponse subject) implements EventData {
        @Override
        public EventMessageType type() { return EventMessageType.USER_REMOVED; }
    }

    record GroupClosed() implements EventData {
        @Override
        public EventMessageType type() { return EventMessageType.GROUP_CLOSED; }
    }
}