package com.jason7599.cacotalk.exceptions;

public record ApiErrorResponse(
        ApiErrorCodes code,
        String message
) {
    public ApiErrorResponse(ApiErrorCodes errorCode) {
        this(errorCode, errorCode.getMessage());
    }
}