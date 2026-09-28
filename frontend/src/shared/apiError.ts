export type ApiErrorCode =
    | "INTERNAL_SERVER_ERROR"

    | "VALIDATION_ERROR"

    | "UNAUTHORIZED"
    | "USER_NOT_FOUND"
    | "USERNAME_TAKEN"
    | "BAD_CREDENTIALS"

    | "CANNOT_CONTACT_SELF"
    | "CANNOT_CONTACT_BLOCKED_USER"
    | "CANNOT_BLOCK_SELF"

    | "CONVERSATION_NOT_FOUND"
    | "NOT_A_MEMBER"
    | "NO_SELF_DIRECT_CONVERSATION"
    | "GROUP_TOO_SMALL"
    | "GROUP_TOO_BIG"
    | "MEMBERS_NOT_INVITABLE"
    | "CREATOR_CANNOT_LEAVE"
    | "NOT_GROUP_CREATOR"
    | "CANNOT_REMOVE_SELF"

    | "CANNOT_SEND_MESSAGE"
;

export type ApiErrorResponse = {
    code: ApiErrorCode;
    message: string;
};

export class ApiError extends Error {
    public readonly code: ApiErrorCode;

    constructor(code: ApiErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = "ApiError";
    }

    static is<C extends ApiErrorCode>(
        err: unknown,
        code: C
    ): err is ApiError & { code: C } {
        return err instanceof ApiError && err.code === code;
    }
};

export function getErrorMessage(err: unknown) {
    return err instanceof Error ? err.message : "Something went wrong.";
};