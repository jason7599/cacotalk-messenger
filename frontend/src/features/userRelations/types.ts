export type UserSearchResponse = {
    userId: number;
    username: string;
    relation: "NONE" | "CONTACT" | "BLOCKED";
};