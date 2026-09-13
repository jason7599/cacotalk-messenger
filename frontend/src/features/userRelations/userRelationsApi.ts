import api from "../../shared/apiClient";
import type { UserSummary } from "../../shared/types";
import type { UserSearchResult } from "./types";

export async function apiSearchUsers(query: string): Promise<UserSearchResult[]> {
    return (await api.get(`/users/search?query=${query}`)).data;
}

export async function apiGetContacts(): Promise<UserSummary[]> {
    return (await api.get("/users/me/contacts")).data;
}

export async function apiAddContact(targetId: number): Promise<UserSummary> {
    return (await api.post(`/users/me/contacts/${targetId}`)).data;
}

export async function apiRemoveContact(targetId: number): Promise<void> {
    await api.delete(`/users/me/contacts/${targetId}`);
}

export async function apiGetBlockedUsers(): Promise<UserSummary[]> {
    return (await api.get("/users/me/blocks")).data;
}

export async function apiBlockUser(targetId: number): Promise<UserSummary> {
    return (await api.post(`/users/me/blocks/${targetId}`)).data;
}

export async function apiUnblockUser(targetId: number): Promise<void> {
    await api.delete(`/users/me/blocks/${targetId}`);
}