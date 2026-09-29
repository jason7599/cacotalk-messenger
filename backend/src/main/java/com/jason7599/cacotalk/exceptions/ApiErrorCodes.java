package com.jason7599.cacotalk.exceptions;

import com.jason7599.cacotalk.conversation.ConversationRules;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ApiErrorCodes {
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),

    // Thrown on bean validation error
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Invalid request"),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    USERNAME_TAKEN(HttpStatus.CONFLICT, "This username is already taken"),
    BAD_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Bad credentials"),

    // User relation
    CANNOT_CONTACT_SELF(HttpStatus.BAD_REQUEST, "Cannot add self as contact"),
    CANNOT_CONTACT_BLOCKED_USER(HttpStatus.FORBIDDEN, "Cannot add blocked user as contact"),
    CANNOT_BLOCK_SELF(HttpStatus.BAD_REQUEST, "Cannot block self"),

    // Conversation
    CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Conversation not found"),
    MEMBERSHIP_NOT_FOUND(HttpStatus.NOT_FOUND, "Not a member of this conversation"),
    NO_SELF_DIRECT_CONVERSATION(HttpStatus.BAD_REQUEST, "Cannot have a direct conversation with self"),
    GROUP_TOO_SMALL(HttpStatus.BAD_REQUEST, ConversationRules.GROUP_TOO_SMALL_MESSAGE),
    GROUP_TOO_BIG(HttpStatus.BAD_REQUEST, ConversationRules.GROUP_TOO_BIG_MESSAGE),
    MEMBERS_NOT_INVITABLE(HttpStatus.CONFLICT, "Some members cannot be invited"),
    CREATOR_CANNOT_LEAVE(HttpStatus.BAD_REQUEST, "Creator cannot leave the group"),
    NOT_GROUP_CREATOR(HttpStatus.FORBIDDEN, "Not the creator of this group"),
    CANNOT_REMOVE_SELF(HttpStatus.BAD_REQUEST, "Cannot remove self"),
    GROUP_CLOSED(HttpStatus.CONFLICT, "Group closed"),

    // Message
    // This includes both clientId collision/probe, and block status/closed
    CANNOT_SEND_MESSAGE(HttpStatus.CONFLICT, "Cannot send a message in this conversation"),

    ;

    private final HttpStatus status;
    private final String message;

    ApiErrorCodes(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
