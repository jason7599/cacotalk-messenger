import { create } from "zustand";
import type { ConversationSummary } from "./types";

type ConversationsState = {
    conversationsById: Record<string, ConversationSummary>;

    // local sync
    setConversations: (conversations: ConversationSummary[]) => void;
    upsertLocal: (conversation: ConversationSummary) => void;
    removeLocal: (conversationId: string) => void;
    reset: () => void;
};

export const useConversationsStore = create<ConversationsState>((set) => ({
    conversationsById: {},

    setConversations: (conversations) => {
        set({
            conversationsById: Object.fromEntries(
                conversations.map((c) => [c.id, c])
            )
        });
    },

    upsertLocal: (conversation) => {
        set((state) => ({
            conversationsById: {
                ...state.conversationsById,
                [conversation.id]: conversation
            }
        }));
    },

    removeLocal: (conversationId) => {
        set((state) => {
            const { [conversationId]: _, ...rest } = state.conversationsById;
            return {
                conversationsById: rest
            };
        })
    },

    reset: () => {
        set({
            conversationsById: {}
        });
    }
}));