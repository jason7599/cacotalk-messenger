package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping("/me")
    public List<ConversationSummary> getConversationSummaries(@AuthenticationPrincipal AuthUser authUser) {
        return conversationService.getConversationSummaries(authUser.userId());
    }

    @PostMapping("/direct/{targetId}")
    public ConversationSummary getOrCreateDirectConversation(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable long targetId
    ) {
        return conversationService.getOrCreateDirectConversation(authUser.userId(), targetId);
    }
}
