package com.jason7599.cacotalk.user.dto;

public record UserSearchResponse(
        long userId,
        String username,
        // Skipping the enum projection. Because the FE is gonna read it as a string anyway.
        String relation // NONE, CONTACT, BLOCKED
) {
}
