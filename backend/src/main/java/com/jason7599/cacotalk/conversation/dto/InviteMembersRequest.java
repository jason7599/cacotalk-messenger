package com.jason7599.cacotalk.conversation.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record InviteMembersRequest(
        @NotNull List<@NotNull Long> memberIds
) {
}
