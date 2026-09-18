package com.jason7599.cacotalk.message.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SendMessageRequest(
        @NotNull String content,
        @NotNull UUID clientId
) {
}
