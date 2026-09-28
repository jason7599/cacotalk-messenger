package com.jason7599.cacotalk.message;

public final class MessageRules {

    private MessageRules() {}

    public static final int MESSAGE_MAX_LENGTH = 2000;
    public static final String MESSAGE_LENGTH_MESSAGE
            = "Message must be between 1-"
            + MESSAGE_MAX_LENGTH
            + " characters";
}
