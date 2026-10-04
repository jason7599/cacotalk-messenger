package com.jason7599.cacotalk.message;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageRateLimiter {

    // Lua script for atomically incrementing the request count and setting the TTL only when the key is newly created
    private static final RedisScript<Long> INCR_WITH_TTL = new DefaultRedisScript<>("""
            local count = redis.call('INCR', KEYS[1])
            if count == 1 then
                redis.call('PEXPIRE', KEYS[1], ARGV[1])
            end
            return count
    """, Long.class);

    // {rateKey -> count of message sends in the current window}
    private final StringRedisTemplate redis;

    @Value("${app.message.rate-limit.max}")
    private int maxPerWindow;

    @Value("${app.message.rate-limit.window}")
    private Duration window;

    private String rateKey(long userId) {
        return "ratelimit:message:" + userId;
    }

    // Tries to acquire permission for one message send.
    // Returns false if the user has exceeded the rate limit.
    public boolean tryConsume(long userId) {
        Long count = redis.execute(
                INCR_WITH_TTL,
                List.of(rateKey(userId)),
                String.valueOf(window.toMillis())
        );

        // redis must be down...
        if (count == null) {
            throw new IllegalArgumentException("Redis rate-limit script returned null");
        }

        return count <= maxPerWindow;
    }
}
