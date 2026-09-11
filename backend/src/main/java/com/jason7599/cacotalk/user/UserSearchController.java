package com.jason7599.cacotalk.user;

import com.jason7599.cacotalk.auth.AuthUser;
import com.jason7599.cacotalk.user.dto.UserSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users/search")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserSearchService userSearchService;

    @GetMapping
    public List<UserSearchResponse> searchUsers(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam("query") String query
    ) {
        return userSearchService.searchUsers(user.userId(),  query);
    }
}
