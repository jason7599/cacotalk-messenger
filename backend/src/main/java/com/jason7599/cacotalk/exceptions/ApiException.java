package com.jason7599.cacotalk.exceptions;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {

    private final ApiErrorCodes errorCode;

    public ApiException(ApiErrorCodes errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
