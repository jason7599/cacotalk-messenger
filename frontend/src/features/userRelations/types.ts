export type UserSearchResult = {
    userId: number;
    username: string;
    relation: "NONE" | "CONTACT" | "BLOCKED";
};