import api from "../../shared/apiClient";
import type { MessagePage, UserMessage } from "./types";

export async function apiLoadMessages(conversationId: string, before?: number): Promise<MessagePage> {
    return (await api.get(`/conversations/${conversationId}/messages`, { params: {before }})).data;
}

export async function apiSendMessage(conversationId: string, content: string, clientId: string): Promise<UserMessage> {
    return (await api.post(`/conversations/${conversationId}/messages`, { content, clientId })).data;
}