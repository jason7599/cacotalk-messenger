package com.jason7599.cacotalk.websocket;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public sealed interface RealtimeEvent {

    enum Type {
        NEW_MESSAGE,
        CONTACT_CHANGED,
        BLOCK_CHANGED,
        REMOVED_FROM_GROUP,
        MEMBER_REMOVED,
        MEMBERS_ADDED,
    }

    Type type();

    // Gives Jackson a type property in the serialized JSON
    @JsonGetter("type")
    default Type jsonType() { return type(); }

    record NewMessage(MessageResponse message) implements RealtimeEvent {
        @Override public Type type() { return Type.NEW_MESSAGE; }
    }

    record ContactChanged(UserResponse subject, boolean added) implements RealtimeEvent {
        @Override public Type type() { return Type.CONTACT_CHANGED; }
    }

    record BlockChanged(UserResponse subject, boolean added) implements RealtimeEvent {
        @Override public Type type() { return Type.BLOCK_CHANGED; }
    }

    /*
    Not to be confused with the below MemberRemoved...
    This is for the leaving/removed user himself.
    More specifically, a self-sync purpose for multi session users.
     */
    record RemovedFromGroup(UUID conversationId) implements RealtimeEvent {
        @Override public Type type() { return Type.REMOVED_FROM_GROUP; }
    }

    /*
    This covers both EventMessage.MemberLeft and EventMessage.MemberRemoved.

    This event holds enough data for 2 UI updates:
        1. Update the members preview on the sidebar, if the removed member was an element of the preview.
        2. Remove the user from the actual members list if the authenticated user had this conversation open.

    previewPatch holds the first (MEMBERS_PREVIEW_COUNT + 1) members to be shown on the list.
    This is because members preview should exclude the viewing user, making it viewer specific.
    Instead of querying the new preview per remaining member, we fit in an extra member.
    So the client can either:
        1. If I'm not in the new patch, just take the first MEMBERS_PREVIEW_COUNT elements. i.e., ignore the last element.
        2. If I am in the new patch, omit myself.
     */
    record MemberRemoved(
            UUID conversationId,
            UserResponse subject,
            List<UserResponse> previewPatch,
            int memberCount
    ) implements RealtimeEvent {
        @Override public Type type() { return Type.MEMBER_REMOVED; }
    }
}
