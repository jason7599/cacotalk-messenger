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
        @JsonSubTypes.Type(value = EventMessage.MembersInvited.class, name = "MEMBERS_INVITED"),
        @JsonSubTypes.Type(value = EventMessage.MemberLeft.class, name = "MEMBER_LEFT"),
        @JsonSubTypes.Type(value = EventMessage.MemberRemoved.class, name = "MEMBER_REMOVED"),
        @JsonSubTypes.Type(value = EventMessage.GroupClosed.class, name = "GROUP_CLOSED"),
})
public sealed interface EventMessage {

    enum Type {
        GROUP_CREATED,
        MEMBERS_INVITED,
        MEMBER_LEFT,
        MEMBER_REMOVED,
        GROUP_CLOSED
    }

    @JsonProperty("type")
    Type type();

    record GroupCreated(List<UserResponse> initMembers) implements EventMessage {
        @Override
        public Type type() { return Type.GROUP_CREATED; }
    }

    record MembersInvited(List<UserResponse> members) implements EventMessage {
        @Override
        public Type type() { return Type.MEMBERS_INVITED; }
    }

    record MemberLeft(UserResponse subject) implements EventMessage {
        @Override
        public Type type() { return Type.MEMBER_LEFT; }
    }

    record MemberRemoved(UserResponse subject) implements EventMessage {
        @Override
        public Type type() { return Type.MEMBER_REMOVED; }
    }

    record GroupClosed() implements EventMessage {
        @Override
        public Type type() { return Type.GROUP_CLOSED; }
    }
}