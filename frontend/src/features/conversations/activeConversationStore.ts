import { create } from "zustand";
import { apiGetOrCreateDirectConversation } from "./conversationsApi";
import { getErrorMessage } from "../../shared/apiClient";

export type ActiveConversationState = {
    activeConversationId: string | null; // currently opened conversation

    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    setActiveConversation: (conversationId: string) => Promise<void>;
    clearActiveConversation: () => void;

    openDirectConversation: (targetId: number) => Promise<void>;
};

export const useActiveConversationStore = create<ActiveConversationState>((set, get) => ({
    activeConversationId: null,
    status: "IDLE",
    error: null,

    setActiveConversation: async (conversationId) => {
        set({
            activeConversationId: conversationId,
            status: "LOADING",
            error: null
        });

        // TODO: wire api
    },

    clearActiveConversation: () => {
        set({ 
            activeConversationId: null,
            status: "IDLE",
            error: null
        });
    },

    openDirectConversation: async (targetId) => {
        // TODO? do a local search in the conversationsStore list first?
        // Nah

        set({
            status: "LOADING",
            error: null
        });

        try {
            const conversation = await apiGetOrCreateDirectConversation(targetId);
            await get().setActiveConversation(conversation.id);
        } catch (err) {
            set({
                status: "ERROR",
                error: getErrorMessage(err)
            })
        }
    }
}));