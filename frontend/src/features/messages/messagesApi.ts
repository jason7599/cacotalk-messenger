import api from "../../shared/apiClient";
import type { MessagePage } from "./types";

export async function apiLoadMessages(conversationId: string, before?: number): Promise<MessagePage> {
    return (await api.get(`/conversations/${conversationId}/messages`, { params: {before }})).data;
}