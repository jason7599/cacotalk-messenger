import { create } from "zustand";
import { apiGetConversationDetail, apiLeaveConversation, apiResolveDirectConversation } from "./conversationsApi";
import { getErrorMessage } from "../../shared/apiClient";
import { apiLoadMessages } from "../messages/messagesApi";
import type { ActiveConversation, ConversationMeta } from "./types";
import type { ChatMessage } from "../messages/types";
import { immer } from "zustand/middleware/immer";
import { useConversationsStore } from "./conversationsStore";

export type ActiveConversationState = {
    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    conversation: ActiveConversation | null;

    loadingOlder: boolean;
    loadOlderError: string | null;

    setActiveConversation: (conversationId: string) => Promise<void>;
    clearActiveConversation: () => void;
    openDirectConversation: (targetId: number) => Promise<void>;
    loadOlderMessages: () => Promise<void>;
    upsertMessage: (message: ChatMessage) => void;
    leaveConversation: () => Promise<void>;
};

export const useActiveConversationStore = create<ActiveConversationState>()(immer((set, get) => {
    // internal only stale guard
    let requestId = 0;

    const setActiveConversation = async (conversationId: string) => {
        if (get().conversation?.id === conversationId && get().status !== "ERROR") {
            return;
        }

        const myRequestId = ++requestId;

        set({
            conversation: null,
            status: "LOADING",
            error: null,
            loadingOlder: false,
            loadOlderError: null
        });

        try {
            const [
                detail,
                page
            ] = await Promise.all([
                apiGetConversationDetail(conversationId),
                apiLoadMessages(conversationId)
            ])

            if (requestId !== myRequestId) return;

            const meta: ConversationMeta =
                detail.type === "DIRECT"
                    ? {
                        type: "DIRECT",
                        blockedMe: detail.blockedMe,
                        createdAt: detail.createdAt,
                    }
                    : {
                        type: "GROUP",
                        groupCreatorId: detail.groupCreatorId!,
                        isClosed: detail.isClosed,
                        createdAt: detail.createdAt,
                    }
            ;

            set({
                conversation: {
                    id: detail.id,
                    otherMembers: detail.otherMembers,
                    meta,
                    messages: page.messages,
                    hasOlder: page.hasOlder,
                    lastSeq: detail.lastSeq,
                    prevLastReadSeq: detail.prevLastReadSeq
                },
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
            status: "IDLE",
            error: null,
            conversation: null,
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
            const id = await apiResolveDirectConversation(targetId);
            if (requestId !== myRequestId) return;

            await get().setActiveConversation(id);
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

        if (s.loadingOlder || !s.conversation || !s.conversation.hasOlder || s.conversation.messages.length === 0) {
            return;
        }

        const myRequestId = ++requestId;
        const cursor = s.conversation.messages[0].seq;

        set({
            loadingOlder: true,
            loadOlderError: null
        });

        try {
            const page = await apiLoadMessages(s.conversation.id, cursor);
            if (requestId !== myRequestId) return;

            set((state) => {
                if (!state.conversation) return state;

                return {
                    conversation: {
                        ...state.conversation,
                        messages: [
                            ...page.messages,
                            ...state.conversation.messages
                        ],
                        hasOlder: page.hasOlder
                    }
                };
            });
        } catch (err) {
            if (requestId !== myRequestId) return;

            set({
                status: "ERROR",
                loadOlderError: getErrorMessage(err)
            });
        } finally {
            set({ loadingOlder: false });
        }
    };

    /**
     * Can't make any assumptions here.. Trust no one.
     * Out of order arrivals, duplicate events, etc.
     */
    const upsertMessage = (message: ChatMessage) => {
        set((state) => {
            if (!state.conversation || state.conversation.id !== message.conversationId) {
                return;
            }

            const messages = state.conversation.messages;

            const existingIndex = messages.findIndex((m) => m.seq === message.seq);
            if (existingIndex !== -1) {
                messages[existingIndex] = message;
                return;
            }

            // find the last message with a smaller seq, and insert right after
            const insertAfter = messages.findLastIndex((m) => m.seq < message.seq);
            messages.splice(insertAfter + 1, 0, message);
        });
    };

    
    const leaveConversation = async () => {
        const conversationId = get().conversation?.id;
        if (!conversationId) return;

        await apiLeaveConversation(conversationId);
        get().clearActiveConversation();

        useConversationsStore.getState().removeLocal(conversationId);
    };

    return {
        status: "IDLE",
        error: null,
        conversation: null,
        loadingOlder: false,
        loadOlderError: null,

        setActiveConversation,
        clearActiveConversation,
        openDirectConversation,
        loadOlderMessages,
        upsertMessage,
        leaveConversation
    };
}));