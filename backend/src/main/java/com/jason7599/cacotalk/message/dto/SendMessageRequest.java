package com.jason7599.cacotalk.message.dto;

import com.jason7599.cacotalk.message.MessageRules;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SendMessageRequest(

        @NotNull(message = "Content cannot be null")
        @Size(
                min = 1,
                max = MessageRules.MESSAGE_MAX_LENGTH,
                message = MessageRules.MESSAGE_LENGTH_MESSAGE
        )
        String content,

        @NotNull(message = "Client ID cannot be null")
        UUID clientId
) {
    public SendMessageRequest {
        if (content != null) {
            content = content.trim();
        }
    }
}
