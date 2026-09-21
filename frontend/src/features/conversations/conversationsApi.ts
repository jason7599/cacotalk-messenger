import api from "../../shared/apiClient";
import type { ConversationDetail, ConversationSummary } from "./types";

export async function apiGetConversationSummaries(): Promise<ConversationSummary[]> {
    return (await api.get("/conversations")).data;
}

export async function apiGetConversationSummary(conversationId: string): Promise<ConversationSummary> {
    return (await api.get(`/conversations/${conversationId}/summary`)).data;
}

export async function apiGetConversationDetail(conversationId: string): Promise<ConversationDetail> {
    return (await api.get(`/conversations/${conversationId}`)).data;
}

export async function apiResolveDirectConversation(targetId: number): Promise<string> {
    return (await api.post(`/conversations/direct/${targetId}`)).data;
}

export async function apiCreateGroupConversation(initMemberIds: number[]): Promise<string> {
    return (await api.post("/conversations/group", { initMemberIds, clientId: crypto.randomUUID() })).data;
}