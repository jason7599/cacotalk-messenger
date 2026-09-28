package com.jason7599.cacotalk.conversation.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record InviteMembersRequest(
        @NotEmpty (message = "List cannot be empty")
        List<@NotNull(message = "Member IDs cannot be null") Long> memberIds
) {
}
