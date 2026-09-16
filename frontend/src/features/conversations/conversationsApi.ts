import api from "../../shared/apiClient";
import type { ConversationDetail, ConversationSummary } from "./types";

export async function apiGetConversations(): Promise<ConversationSummary[]> {
    return (await api.get("/conversations/me")).data;
}

export async function apiResolveDirectConversation(targetId: number): Promise<string> {
    return (await api.post(`/conversations/direct/${targetId}`)).data;
}

export async function apiGetConversationDetail(conversationId: string): Promise<ConversationDetail> {
    return (await api.get(`/conversations/${conversationId}`)).data;
}