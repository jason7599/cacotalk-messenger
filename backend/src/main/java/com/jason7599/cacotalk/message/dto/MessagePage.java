package com.jason7599.cacotalk.message.dto;

import java.util.List;

public record MessagePage(
        List<MessageResponse> messages,
        Long nextCursor,
        boolean hasOlder
) {
    public static MessagePage empty() {
        return new MessagePage(
                List.of(),
                null,
                false
        );
    }
}
