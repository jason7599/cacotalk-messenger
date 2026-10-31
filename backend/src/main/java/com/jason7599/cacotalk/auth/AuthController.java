package com.jason7599.cacotalk.auth;

import com.jason7599.cacotalk.auth.dto.AuthUserResponse;
import com.jason7599.cacotalk.auth.dto.LoginRequest;
import com.jason7599.cacotalk.auth.dto.RegisterRequest;
import com.jason7599.cacotalk.auth.session.SessionCookies;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SessionCookies sessionCookies;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletResponse response
    ) {
        String token = authService.register(request);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookies.create(token));
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void login(
            @RequestBody @Valid LoginRequest request,
            HttpServletResponse response
    ) {
        String token = authService.login(request);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookies.create(token));
    }
    
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @CookieValue(name = "session", required = false) String token, // idempotent
            HttpServletResponse response
    ) {
        if (token != null) {
            authService.logout(token);
        }

        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookies.clear());
    }

    @GetMapping("/me")
    public AuthUserResponse getAuthUser(@AuthenticationPrincipal AuthUser authUser) {
        return authService.getAuthUser(authUser.userId());
    }
}
