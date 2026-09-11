export type UserResponse = {
    userId: number;
    username: string;
};

export type UserSearchResponse = {
    userId: number;
    username: string;
    relation: "NONE" | "CONTACT" | "BLOCKED";
};