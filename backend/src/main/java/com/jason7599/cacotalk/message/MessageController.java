package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.message.dto.AddReactionRequest;
import com.jason7599.cacotalk.message.dto.MessagePage;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.message.dto.SendMessageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId,
            @RequestBody @Valid SendMessageRequest request
    ) {
        return messageService.sendUserMessage(
                authUser.userId(),
                conversationId,
                request.content(),
                request.replyToSeq(),
                request.clientId()
        );
    }

    @PutMapping("/{messageSeq}/reaction")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setReaction(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId,
            @PathVariable long messageSeq,
            @RequestBody @Valid AddReactionRequest request
    ) {
        messageService.addReaction(
                conversationId,
                messageSeq,
                authUser.userId(),
                request.reactionType()
        );
    }

    @DeleteMapping("/{messageSeq}/reaction")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeReaction(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable UUID conversationId,
            @PathVariable long messageSeq
    ) {
        messageService.removeReaction(
                conversationId,
                messageSeq,
                authUser.userId()
        );
    }
}
