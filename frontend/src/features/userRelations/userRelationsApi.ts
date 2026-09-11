import api from "../../shared/apiClient";
import type { UserResponse } from "../../shared/types";

export async function getContacts(): Promise<UserResponse[]> {
    return (await api.get("/users/me/contacts")).data;
}

export async function addContact(targetId: number): Promise<void> {
    await api.post(`/users/me/contacts/${targetId}`);
}

export async function removeContact(targetId: number): Promise<void> {
    await api.delete(`/users/me/contacts/${targetId}`);
}

export async function getBlockedUsers(): Promise<UserResponse[]> {
    return (await api.get("/users/me/blocks")).data;
}

export async function blockUser(targetId: number): Promise<void> {
    await api.post(`/users/me/blocks/${targetId}`);
}

export async function unblockUser(targetId: number): Promise<void> {
    await api.delete(`/users/me/blocks/${targetId}`);
}