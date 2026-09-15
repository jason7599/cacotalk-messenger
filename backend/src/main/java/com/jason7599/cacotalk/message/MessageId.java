package com.jason7599.cacotalk.message;

import jakarta.persistence.Embeddable;

import java.util.UUID;

@Embeddable
public record MessageId(
        UUID conversationId,
        long seq
) {
}
