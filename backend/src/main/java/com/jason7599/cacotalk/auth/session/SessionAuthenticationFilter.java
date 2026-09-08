package com.jason7599.cacotalk.auth.session;

import com.jason7599.cacotalk.auth.AuthUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final SessionService sessionService;

    // Look up by session token and inject authentication per request
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        Cookie cookie = WebUtils.getCookie(request, "session");
        String token = cookie == null ? null : cookie.getValue();

        if (token != null) {
            sessionService.resolveUserId(token).ifPresent(userId -> {
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                new AuthUser(userId), // @AuthenticationPrincipal
                                null,
                                List.of())
                );
            });
        }

        filterChain.doFilter(request, response);
    }
}
