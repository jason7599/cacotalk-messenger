package com.jason7599.cacotalk.user;

public final class UserRules {

    private UserRules() {}

    public static final int USERNAME_MIN_LENGTH = 3;
    public static final int USERNAME_MAX_LENGTH = 32;

    public static final String USERNAME_LENGTH_MESSAGE
            = "Username must be between "
            + USERNAME_MIN_LENGTH
            + " and "
            + USERNAME_MAX_LENGTH
            + " characters";

    public static final String USERNAME_REGEX ="^(?=.*[a-z])[a-z0-9]+$";
    public static final String USERNAME_REGEX_MESSAGE
            = "Username must contain only lowercase letters or digits, and at least one letter";

    public static final int PASSWORD_MIN_LENGTH = 6;
    public static final int PASSWORD_MAX_LENGTH = 32;
    public static final String PASSWORD_LENGTH_MESSAGE
            = "Password must be between "
            + PASSWORD_MIN_LENGTH
            + " and "
            + PASSWORD_MAX_LENGTH
            + " characters";

}
