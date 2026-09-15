package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.message.dto.MessagePage;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/conversations/{conversationId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public MessagePage loadMessages(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId,
            @RequestParam(required = false) Long before
    ) {
        if (before == null) {
            return messageService.loadInitial(conversationId, authUser.userId());
        }
        return messageService.loadOlder(conversationId, authUser.userId(), before);
    }
}
