package com.jason7599.cacotalk.message.dto;

import java.util.List;

public record MessagePage(
        List<MessageResponse> messages,
        // ID of the first message NOT included in this page
        // Should be used inclusively as the starting point of the next older-messages request
        Long nextPageStartId
) {
    public static MessagePage empty() {
        return new MessagePage(
                List.of(),
                null
        );
    }
}
