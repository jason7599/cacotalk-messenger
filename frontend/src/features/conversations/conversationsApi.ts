import api from "../../shared/apiClient";
import type { UserInfo } from "../../shared/types";
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

export async function apiGetInvitableUsers(conversationId: string): Promise<UserInfo[]> {
    return (await api.get(`/conversations/${conversationId}/invitable`)).data;
}

export async function apiInviteMembers(conversationId: string, memberIds: number[]): Promise<void> {
    await api.post(`/conversations/${conversationId}/members`, { memberIds });
}

export async function apiLeaveConversation(conversationId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}/members/me`);
}

export async function apiRemoveMember(conversationId: string, targetId: number): Promise<void> {
    await api.delete(`/conversations/${conversationId}/members/${targetId}`);
}

export async function apiCloseConversation(conversationId: string): Promise<void> {
    await api.patch(`/conversations/${conversationId}/close`);
}