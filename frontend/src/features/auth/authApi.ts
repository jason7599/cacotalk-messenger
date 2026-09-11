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

export async function apiGetAuthUser(): Promise<AuthUserResponse> {
    return (await api.get("/auth/me")).data;
}

export async function apiLogin(request: LoginRequest): Promise<void> {
    await api.post("/auth/login", request);
}

export async function apiRegister(request: RegisterRequest): Promise<void> {
    await api.post("/auth/register", request);
}

export async function apiLogout(): Promise<void> {
    await api.post("/auth/logout");
}