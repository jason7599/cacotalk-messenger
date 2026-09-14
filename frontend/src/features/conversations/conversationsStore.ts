import { create } from "zustand";
import type { Conversation } from "./types";

type ConversationsState = {
    conversationsById: Record<string, Conversation>;

    // local sync
    setConversations: (conversations: Conversation[]) => void;

    reset: () => void;
};

export const useConversationsStore = create<ConversationsState>((set, get) => ({
    conversationsById: {},

    setConversations: (conversations) => {
        set({
            conversationsById: Object.fromEntries(
                conversations.map((c) => [c.id, c])
            )
        });
    },

    reset: () => {
        set({
            conversationsById: {}
        });
    }
}));