package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.MessageReactionType;
import jakarta.validation.constraints.NotNull;

public record AddReactionRequest(
        @NotNull(message = "reaction cannot be null")
        MessageReactionType reactionType
) {
}
