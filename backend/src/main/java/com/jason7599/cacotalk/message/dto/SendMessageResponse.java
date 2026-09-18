package com.jason7599.cacotalk.message.dto;

import java.util.UUID;

public record SendMessageResponse(
        UUID clientId,
        long seq
) {
}
