package com.jason7599.cacotalk.conversation;

public final class ConversationRules {

    private ConversationRules() {}

    public static final int GROUP_MINIMUM_MEMBER_COUNT = 3;
    public static final int GROUP_MAXIMUM_MEMBER_COUNT = 100;

    public static final String GROUP_TOO_SMALL_MESSAGE
            = "A group needs at least "
            + GROUP_MINIMUM_MEMBER_COUNT
            + " initial members";

    public static final String GROUP_TOO_BIG_MESSAGE
            = "A group can have at most "
            + GROUP_MAXIMUM_MEMBER_COUNT
            + " members";
}
