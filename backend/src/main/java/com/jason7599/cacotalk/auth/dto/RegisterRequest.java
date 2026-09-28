package com.jason7599.cacotalk.auth.dto;

import com.jason7599.cacotalk.user.UserRules;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotNull(message = "Username is required")
        @Size(
                min = UserRules.USERNAME_MIN_LENGTH,
                max = UserRules.USERNAME_MAX_LENGTH,
                message = UserRules.USERNAME_LENGTH_MESSAGE
        )
        @Pattern(
                regexp = UserRules.USERNAME_REGEX,
                message = UserRules.USERNAME_REGEX_MESSAGE
        )
        String username,

        @NotNull(message = "Password is required")
        @Size(
                min = UserRules.PASSWORD_MIN_LENGTH,
                max = UserRules.PASSWORD_MAX_LENGTH,
                message = UserRules.PASSWORD_LENGTH_MESSAGE
        )
        String password
) {
        public RegisterRequest {
                if (username != null) {
                        username = username.trim();
                        // whitespace in passwords are accepted
                }
        }
}
