import { create } from "zustand";
import { apiGetConversationDetail, apiGetOrCreateDirectConversation } from "./conversationsApi";
import { getErrorMessage } from "../../shared/apiClient";
import { apiLoadMessages } from "../messages/messagesApi";
import type { ActiveConversation, ConversationMeta } from "./types";

export type ActiveConversationState = {
    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    conversation: ActiveConversation | null;

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
        if (get().conversation?.id === conversationId && get().status !== "ERROR") {
            return;
        }

        const myRequestId = ++requestId;

        set({
            status: "LOADING",
            error: null
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
                        blockStatus: detail.blockStatus,
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
                    members: detail.members,
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

        if (s.loadingOlder || !s.conversation || !s.conversation.hasOlder || s.conversation.messages.length === 0) {
            return;
        }

        const myRequestId = ++requestId;
        const cursor = s.conversation.messages[0].seq;

        set({
            loadingOlder: true,
            error: null
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

            // TODO: separate message loading error with whole session error
            set({
                status: "ERROR",
                error: getErrorMessage(err)
            });
        } finally {
            set({ loadingOlder: false });
        }
    };

    return {
        status: "IDLE",
        error: null,
        conversation: null,
        loadingOlder: false,

        setActiveConversation,
        clearActiveConversation,
        openDirectConversation,
        loadOlderMessages
    };
});