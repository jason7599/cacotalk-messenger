package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class UserRelationController {
    private final UserRelationService userRelationService;

    @GetMapping("/contacts")
    public List<UserResponse> getContacts(@AuthenticationPrincipal AuthUser user) {
        return userRelationService.getContacts(user.userId());
    }

    @PostMapping("/contacts/{targetId}")
    public UserResponse addContact(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable long targetId
    ) {
        return userRelationService.addContact(user.userId(), targetId);
    }

    @DeleteMapping("/contacts/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeContact(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable long targetId
    ) {
        userRelationService.removeContact(user.userId(), targetId);
    }

    @GetMapping("/blocks")
    public List<UserResponse> getBlockedUsers(@AuthenticationPrincipal AuthUser user) {
        return userRelationService.getBlockedUsers(user.userId());
    }

    @PostMapping("/blocks/{targetId}")
    public UserResponse blockUser(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable long targetId
    ) {
        return userRelationService.blockUser(user.userId(), targetId);
    }

    @DeleteMapping("/blocks/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unblockUser(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable long targetId
    ) {
        userRelationService.unblockUser(user.userId(), targetId);
    }
}