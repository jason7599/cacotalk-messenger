package com.jason7599.cacotalk.user.dto;

import com.jason7599.cacotalk.user.UserEntity;

public record UserResponse(
        long userId,
        String username
) {

    public UserResponse(UserEntity e) {
        this(e.getId(), e.getUsername());
    }
}
