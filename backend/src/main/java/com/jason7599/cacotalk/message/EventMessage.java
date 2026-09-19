package com.jason7599.cacotalk.message;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.jason7599.cacotalk.user.dto.UserResponse;

import java.util.List;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = EventMessage.GroupCreated.class, name = "GROUP_CREATED"),
        @JsonSubTypes.Type(value = EventMessage.UserInvited.class, name = "USER_INVITED"),
        @JsonSubTypes.Type(value = EventMessage.UserLeft.class, name = "USER_LEFT"),
        @JsonSubTypes.Type(value = EventMessage.UserRemoved.class, name = "USER_REMOVED"),
        @JsonSubTypes.Type(value = EventMessage.GroupClosed.class, name = "GROUP_CLOSED"),
})
public sealed interface EventMessage {

    enum Type {
        GROUP_CREATED,
        USER_INVITED,
        USER_LEFT,
        USER_REMOVED,
        GROUP_CLOSED
    }

    @JsonProperty("type")
    Type type();

    record GroupCreated(List<UserResponse> initMembers) implements EventMessage {
        @Override
        public Type type() { return Type.GROUP_CREATED; }
    }

    record UserInvited(UserResponse subject) implements EventMessage {
        @Override
        public Type type() { return Type.USER_INVITED; }
    }

    record UserLeft(UserResponse subject) implements EventMessage {
        @Override
        public Type type() { return Type.USER_LEFT; }
    }

    record UserRemoved(UserResponse subject) implements EventMessage {
        @Override
        public Type type() { return Type.USER_REMOVED; }
    }

    record GroupClosed() implements EventMessage {
        @Override
        public Type type() { return Type.GROUP_CLOSED; }
    }
}