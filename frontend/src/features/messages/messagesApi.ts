import api from "../../shared/apiClient";
import type { ReactionType } from "./reactions";
import type { MessagePage, UserMessage } from "./types";

export async function apiLoadMessages(conversationId: string, before?: number): Promise<MessagePage> {
    return (await api.get(`/conversations/${conversationId}/messages`, { params: { before } })).data;
}

export async function apiSendMessage(conversationId: string, content: string, replyToSeq: number | null, clientId: string): Promise<UserMessage> {
    return (await api.post(`/conversations/${conversationId}/messages`, { content, replyToSeq, clientId })).data;
}

export async function apiSetReaction(conversationId: string, messageSeq: number, reactionType: ReactionType): Promise<void> {
    await api.put(`/conversations/${conversationId}/messages/${messageSeq}/reaction`, { reactionType });
}

export async function apiRemoveReaction(conversationId: string, messageSeq: number): Promise<void> {
    await api.delete(`/conversations/${conversationId}/messages/${messageSeq}/reaction`);
}