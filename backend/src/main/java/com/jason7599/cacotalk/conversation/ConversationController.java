package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.conversation.dto.ConversationDetail;
import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import com.jason7599.cacotalk.conversation.dto.CreateGroupConversationRequest;
import com.jason7599.cacotalk.conversation.dto.InviteMembersRequest;
import com.jason7599.cacotalk.user.dto.UserResponse;
import com.jason7599.cacotalk.userrelation.UserRelationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final UserRelationService userRelationService;

    // List all the authenticated user's conversation summaries
    @GetMapping
    public List<ConversationSummary> getConversationSummaries(@AuthenticationPrincipal AuthUser authUser) {
        return conversationService.getConversationSummaries(authUser.userId());
    }

    // one conversation's summary
    @GetMapping("/{conversationId}/summary")
    public ConversationSummary getConversationSummary(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId
    ) {
        return conversationService.getConversationSummary(conversationId, authUser.userId());
    }

    // Full detail
    @GetMapping("/{conversationId}")
    public ConversationDetail getConversationDetail(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId
    ) {
        return conversationService.getConversationDetail(conversationId, authUser.userId());
    }

    @PostMapping("/direct/{targetId}")
    @ResponseStatus(HttpStatus.CREATED)
    public UUID resolveDirectConversation(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable long targetId
    ) {
        return conversationService.resolveDirectConversation(authUser.userId(), targetId);
    }


    @PostMapping("/group")
    @ResponseStatus(HttpStatus.CREATED)
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

    @GetMapping("/{conversationId}/invitable")
    public List<UserResponse> getInvitableUsers(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId
    ) {
        return userRelationService.getInvitableUsers(conversationId, authUser.userId());
    }

    @PostMapping("/{conversationId}/members")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inviteMembers(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId,
            @RequestBody @Valid InviteMembersRequest request
    ) {
        conversationService.inviteMembers(
                conversationId,
                authUser.userId(),
                request.memberIds()
        );
    }

    @DeleteMapping("/{conversationId}/members/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveConversation(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId
    ) {
        conversationService.leaveConversation(conversationId, authUser.userId());
    }

    @DeleteMapping("/{conversationId}/members/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId,
            @PathVariable long targetId
    ) {
        conversationService.removeMember(conversationId, authUser.userId(), targetId);
    }

    @PatchMapping("/{conversationId}/close")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void closeConversation(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId
    ) {
        conversationService.closeConversation(conversationId, authUser.userId());
    }
}
