package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.conversation.dto.ConversationDetail;
import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import com.jason7599.cacotalk.conversation.dto.CreateGroupConversationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    public UUID resolveDirectConversation(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable long targetId
    ) {
        return conversationService.resolveDirectConversation(authUser.userId(), targetId);
    }

    @GetMapping("/{conversationId}")
    public ConversationDetail getConversationDetail(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId
    ) {
        return conversationService.getConversationDetail(conversationId, authUser.userId());
    }

    @PostMapping("/group")
    public UUID createGroupConversation(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody @Valid CreateGroupConversationRequest request
    ) {
        return conversationService.createGroupConversation(
                authUser.userId(),
                request.initMemberIds(),
                request.clientId()
        );
    }
}
