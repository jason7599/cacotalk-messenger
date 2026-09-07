package com.jason7599.cacotalk.auth;

import com.jason7599.cacotalk.auth.dto.AuthUserResponse;
import com.jason7599.cacotalk.auth.dto.LoginRequest;
import com.jason7599.cacotalk.auth.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.auth.session.cookie-secure}")
    private boolean cookieSecure;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletResponse response
    ) {
        String token = authService.register(request);
        setSessionCookie(response, token);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void login(
            @RequestBody @Valid LoginRequest request,
            HttpServletResponse response
    ) {
        String token = authService.login(request);
        setSessionCookie(response, token);
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

        clearSessionCookie(response);
    }

    // Looks cursed as for now
    // Explanation for confused future me: See SessionAuthenticationFilter
    @GetMapping("/me")
    public AuthUserResponse getAuthUser(@AuthenticationPrincipal AuthUser user) {
        return new AuthUserResponse(user.userId());
    }

    private void setSessionCookie(
            HttpServletResponse response,
            String token
    ) {
        ResponseCookie cookie = ResponseCookie.from("session", token)
                .httpOnly(true)
                .secure(cookieSecure) // TODO: hardcode this to true on prod if I want
                .sameSite("Lax")
                .path("/")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearSessionCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("session", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO) // tells the browser to expire cookie immediately
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
