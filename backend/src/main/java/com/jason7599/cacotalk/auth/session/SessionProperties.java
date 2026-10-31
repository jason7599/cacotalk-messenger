package com.jason7599.cacotalk.auth.session;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.auth.session")
public record SessionProperties(
        Duration ttl,
        boolean cookieSecure
) {
}
