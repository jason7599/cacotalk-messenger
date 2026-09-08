import api from "../../shared/apiClient";

export type LoginRequest = {
    username: string;
    password: string;
};

export type RegisterRequest = {
    username: string;
    password: string;
};

export type AuthUserResponse = {
    userId: number;
};

export async function getAuthUser(): Promise<AuthUserResponse | null> {
    const res = (await api.get("/auth/me")).data;
    return res;
};