package com.jason7599.cacotalk.exceptions;

public record ApiErrorResponse(
        String code,
        String message
) {
    public ApiErrorResponse(ApiErrorCodes errorCode) {
        this(errorCode.name(), errorCode.getMessage());
    }
}