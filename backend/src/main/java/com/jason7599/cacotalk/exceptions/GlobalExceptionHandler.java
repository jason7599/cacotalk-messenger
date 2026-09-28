package com.jason7599.cacotalk.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException e) {
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(new ApiErrorResponse(e.getErrorCode()));
    }

    // Bean validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException e
    ) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse(ApiErrorCodes.VALIDATION_ERROR.getMessage());

        return ResponseEntity
                .status(ApiErrorCodes.VALIDATION_ERROR.getStatus())
                .body(new ApiErrorResponse(
                        ApiErrorCodes.VALIDATION_ERROR.name(),
                        message
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception e) {
        log.error("Unhandled exception", e);
        
        return ResponseEntity
                .status(ApiErrorCodes.INTERNAL_SERVER_ERROR.getStatus())
                .body(new ApiErrorResponse(
                        ApiErrorCodes.INTERNAL_SERVER_ERROR
                ));
    }
}
