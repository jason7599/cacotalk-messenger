import { create } from "zustand";
import { apiGetOrCreateDirectConversation } from "./conversationsApi";
import { getErrorMessage } from "../../shared/apiClient";
import type { ChatMessage } from "../messages/types";
import { apiLoadMessages } from "../messages/messagesApi";

export type ActiveConversationState = {
    activeConversationId: string | null; // currently opened conversation

    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    messages: ChatMessage[];
    hasOlder: boolean;
    loadingOlder: boolean;

    setActiveConversation: (conversationId: string) => Promise<void>;
    clearActiveConversation: () => void;
    openDirectConversation: (targetId: number) => Promise<void>;
    loadOlderMessages: () => Promise<void>;
};

export const useActiveConversationStore = create<ActiveConversationState>((set, get) => {
    // internal only stale guard
    let requestId = 0;

    const setActiveConversation = async (conversationId: string) => {
        if (get().activeConversationId === conversationId && get().status !== "ERROR") {
            return;
        }

        const myRequestId = ++requestId;

        set({
            activeConversationId: conversationId,
            status: "LOADING",
            error: null
        });

        try {
            const page = await apiLoadMessages(conversationId);
            if (requestId !== myRequestId) return;

            set({
                messages: page.messages,
                hasOlder: page.hasOlder,
                status: "READY"
            });
        } catch (err) {
            if (requestId !== myRequestId) return;

            set({
                status: "ERROR",
                error: getErrorMessage(err)
            });
        }
    };

    const clearActiveConversation = () => {
        requestId++; // invalidate anything in flight
        set({
            activeConversationId: null,
            status: "IDLE",
            error: null,
            messages: [],
            hasOlder: false,
            loadingOlder: false,
        });
    };

    const openDirectConversation = async (targetId: number) => {
        const myRequestId = ++requestId;

        // TODO? do a local search in the conversationsStore list first?
        // Nah
        set({
            status: "LOADING",
            error: null
        });

        try {
            const conversation = await apiGetOrCreateDirectConversation(targetId);
            if (requestId !== myRequestId) return;

            await get().setActiveConversation(conversation.id);
        } catch (err) {
            if (requestId !== myRequestId) return;

            set({
                status: "ERROR",
                error: getErrorMessage(err)
            })
        }
    };

    const loadOlderMessages = async () => {
        const s = get();

        if (s.loadingOlder || !s.activeConversationId || s.loadingOlder || s.messages.length === 0) {
            return;
        }

        const myRequestId = ++requestId;
        const cursor = s.messages[0].seq;

        set({
            loadingOlder: true,
            error: null 
        });

        try {
            const page = await apiLoadMessages(s.activeConversationId, cursor);
            if (requestId !== myRequestId) return;

            set((state) => ({
                messages: [...page.messages, ...state.messages],
                hasOlder: page.hasOlder,
            }));
        } catch (err) {
            if (requestId !== myRequestId) return;

            set({ 
                status: "ERROR",
                error: getErrorMessage(err) 
            });
        } finally {
            set({ loadingOlder: false });
        }
    };

    return {
        activeConversationId: null,
        status: "IDLE",
        error: null,
        messages: [],
        hasOlder: false,
        loadingOlder: false,

        setActiveConversation,
        clearActiveConversation,
        openDirectConversation,
        loadOlderMessages
    };
});