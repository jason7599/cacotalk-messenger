import api from "../../shared/apiClient";
import type { UserInfo } from "../../shared/types";

// The backend actually returns a UserSearchResponse, which is basically
// UserInfo + a relation field which can be "NONE", "BLOCKED", or "CONTACT".
// But, to keep consistent with the style of "keep the local memory in sync, and trust the local stores" approach,
// decided to let the component itself check for the relations. 
// Didn't modify the backend api shape (yet), so it still does return the relation field
export async function apiSearchUsers(query: string): Promise<UserInfo[]> {
    return (await api.get(`/users/search?query=${query}`)).data;
}

export async function apiGetContacts(): Promise<UserInfo[]> {
    return (await api.get("/users/me/contacts")).data;
}

export async function apiAddContact(targetId: number): Promise<UserInfo> {
    return (await api.post(`/users/me/contacts/${targetId}`)).data;
}

export async function apiRemoveContact(targetId: number): Promise<void> {
    await api.delete(`/users/me/contacts/${targetId}`);
}

export async function apiGetBlockedUsers(): Promise<UserInfo[]> {
    return (await api.get("/users/me/blocks")).data;
}

export async function apiBlockUser(targetId: number): Promise<UserInfo> {
    return (await api.post(`/users/me/blocks/${targetId}`)).data;
}

export async function apiUnblockUser(targetId: number): Promise<void> {
    await api.delete(`/users/me/blocks/${targetId}`);
}

export async function apiGetInvitableUsers(): Promise<UserInfo[]> {
    return (await (api.get("/users/me/invitable"))).data;
}