package com.jason7599.cacotalk.auth.session;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionService {

    @Value("${app.auth.session.ttl}")
    private Duration sessionTtl;

    // {sessionKey -> user_id}
    private final StringRedisTemplate redis;
    private final SessionTokenService tokenService;

    private String sessionKey(String token) {
        String hash = tokenService.hash(token);
        return "session:" + hash;
    }

    // generate random token, store hash -> userId, return raw token
    public String create(Long userId) {
        String token = tokenService.generate();

        // opsForValue() = give me the operation set for simple redis string vals
        redis.opsForValue().set(
                sessionKey(token),
                userId.toString(),
                sessionTtl
        );

        return token;
    }

    public Optional<Long> resolveUserId(String token) {
        String key = sessionKey(token);

        String userId = redis.opsForValue().get(key);

        if (userId == null) {
            return Optional.empty();
        }

        // sliding expiry renewal on every hit for now
        redis.expire(key, sessionTtl);

        return Optional.of(Long.parseLong(userId));
    }

    // logout
    // deletes only this one session, not all of this user's
    public void delete(String token) {
        String key = sessionKey(token);
        redis.delete(key);
    }
}
