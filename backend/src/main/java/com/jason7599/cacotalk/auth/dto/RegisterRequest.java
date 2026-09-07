package com.jason7599.cacotalk.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Username is required")
        @Pattern(
                regexp = "^(?=.*[a-z])[a-z0-9]{3,32}$",
                message = "Username must be 3-32 lowercase letters or digits, and contain at least one character"
        )
        String username,

        @NotBlank(message = "Password is required")
        @Size(
                min = 4, // TODO: change later lol
                max = 32,
                message = "Password must be between 4 and 32 letters"
        )
        String password
) {
}
