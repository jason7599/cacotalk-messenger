import { create } from "zustand";
import type { ConversationSummary } from "./types";
import type { ChatMessage } from "../messages/types";
import { apiGetConversationSummary } from "./conversationsApi";
import { getErrorMessage } from "../../shared/apiClient";

type ConversationsState = {
    conversationsById: Record<string, ConversationSummary>;

    // local sync
    setConversations: (conversations: ConversationSummary[]) => void;
    upsertLocal: (conversation: ConversationSummary) => void;
    removeLocal: (conversationId: string) => void;
    onNewMessage: (message: ChatMessage) => Promise<void>;
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

    onNewMessage: async (message) => {
        // Oh, this is actually very possible.
        // When a message is sent in a direct conversation for the first time,
        // at this point the conversation list doesn't have the entry.
        // Same goes for when a user is invited to a group conversation.
        // So, we should do an API call to get the conversationSummary 
        if (!get().conversationsById[message.conversationId]) {
            try {
                const summary = await apiGetConversationSummary(message.conversationId);
                get().upsertLocal(summary); // can I just do this?
            } catch (err) {
                // Two real cases here:
                // 1. User is no longer a member of this conversation (e.g. removed from a group between the message being sent and this fetch)
                // Here it's correct to do nothing.
                // 2. Server error — the conversation will be missing from the sidebar until a future refresh/bootstrap catches it up.
                // Not ideal, but acceptable for now...
                console.log(getErrorMessage(err));
            }
            return;
        }
        
        set((state) => {
            const current = state.conversationsById[message.conversationId]!;

            // Stale or duplicate
            if ((current.lastMessage?.seq ?? 0) >= message.seq) {
                return state;
            }

            return {
                conversationsById: {
                    ...state.conversationsById,
                    [message.conversationId]: {
                        ...current,
                        lastMessage: message
                    }
                }
            };
        })
    },

    reset: () => {
        set({
            conversationsById: {}
        });
    }
}));