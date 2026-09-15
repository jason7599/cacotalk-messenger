package com.jason7599.cacotalk.message.dto;

import java.util.List;

public record MessagePage(
        List<MessageResponse> messages,
        boolean hasMore
) {
}
