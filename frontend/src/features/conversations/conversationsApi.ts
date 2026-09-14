import api from "../../shared/apiClient";
import type { Conversation } from "./types";

export async function apiGetConversations(): Promise<Conversation[]> {
    return (await api.get("/conversations/me")).data;
}