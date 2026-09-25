package com.jason7599.cacotalk.auth.dto;

import com.jason7599.cacotalk.user.UserEntity;

public record AuthUserResponse(
        long userId,
        String username
) {
    public AuthUserResponse(UserEntity user) {
        this(user.getId(), user.getUsername());
    }
}
