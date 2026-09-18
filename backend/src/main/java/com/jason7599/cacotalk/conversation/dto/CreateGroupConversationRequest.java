package com.jason7599.cacotalk.conversation.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateGroupConversationRequest(
        @NotNull List<@NotNull Long> initMemberIds,
        @NotNull UUID clientId
) {
}
