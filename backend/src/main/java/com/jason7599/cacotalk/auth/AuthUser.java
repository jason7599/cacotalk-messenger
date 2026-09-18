package com.jason7599.cacotalk.auth;

import java.security.Principal;

public record AuthUser(
        long userId
) implements Principal {

    // for websocket identity
    @Override
    public String getName() {
        return Long.toString(userId);
    }
}
