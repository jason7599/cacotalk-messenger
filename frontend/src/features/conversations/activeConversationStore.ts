import { create } from "zustand";
import { apiGetConversationDetail, apiLeaveConversation, apiMarkAsRead, apiResolveDirectConversation } from "./conversationsApi";
import { getErrorMessage } from "../../shared/apiError";
import { apiLoadMessages } from "../messages/messagesApi";
import type { ActiveConversation, ConversationMeta } from "./types";
import type { ChatMessage } from "../messages/types";
import { immer } from "zustand/middleware/immer";
import { useConversationsStore } from "./conversationsStore";
import { useAuthStore } from "../auth/authStore";
import type { UserInfo } from "../../shared/types";

const READ_ACK_DEBOUNCE_MS = 1500;

export type ActiveConversationState = {
    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    conversation: ActiveConversation | null;
    loadingConversationId: string | null;

    setActiveConversation: (conversationId: string, resync?: boolean) => Promise<void>;
    clearActiveConversation: () => void;
    openDirectConversation: (targetId: number) => Promise<void>;
    loadOlderMessages: () => Promise<void>;
    upsertMessage: (message: ChatMessage) => void;
    leaveConversation: () => Promise<void>;
    onMembersAdded: (newMembers: UserInfo[]) => void;
    onMemberRemoved: (memberId: number) => void; 
    onGroupClosed: () => void;
    onAckConfirmed: (seq: number) => void; 
};

export const selectGroupCreator = (state: ActiveConversationState) => {
    const meta = state.conversation?.meta;
    return meta?.type === "GROUP" ? meta.groupCreator : null;
}

export const useActiveConversationStore = create<ActiveConversationState>()(immer((set, get) => {
    // internal only stale guard
    let requestId = 0;

    // debounced ack flush logic.
    // upon new message arrival, wait a bit for the potential next message, if it doesn't come, flush. 
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let flushingConversationId: string | null = null; // which conversation the timer belongs to

    // cancel whatever's pending if any
    const clearFlushTimer = () => {
        if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
        }
        flushingConversationId = null;
    };

    // the actual api call, run once the debounce window expires
    const doFlush = (conversationId: string) => {
        const current = get().conversation;
        if (!current || current.id !== conversationId || current.messages.length === 0) {
            return;
        }

        const targetSeq = current.messages[current.messages.length - 1].seq;
        if (targetSeq <= current.ackedSeq) {
            return; // nothing new to ack
        }

        // Optimistic UI update.
        // Bump locally now, instead of waiting for the API or WS response
        set((state) => {
            if (state.conversation?.id === conversationId) {
                state.conversation.ackedSeq = Math.max(state.conversation.ackedSeq, targetSeq);
            }
        });

        // No await, and no rollback.
        // A failed/lost ack is low stakes and will self-correct on next flush or reopen
        apiMarkAsRead(conversationId, targetSeq).catch((err) => {
            console.warn(`markAsRead failed for ${conversationId}:`, getErrorMessage(err));
        });
    };

    // called every time a new message arrives
    // start the timer if 
    const scheduleAckFlush = (conversationId: string) => {
        // timer already pending, cancel it and restart the delay
        if (flushTimer && flushingConversationId === conversationId) {
            clearTimeout(flushTimer); 
        } else {
            // timer for a differnt conversation?
            // shouldn't happen
            clearFlushTimer(); 
        }

        flushingConversationId = conversationId;
        flushTimer = setTimeout(() => {
            flushTimer = null;
            flushingConversationId = null;
            doFlush(conversationId);
        }, READ_ACK_DEBOUNCE_MS);
    };

    const flushAckNow = (conversationId: string) => {
        clearFlushTimer();
        doFlush(conversationId);
    };

    // ------------------ Actual store methods ------------------ \\
    const onAckConfirmed = (seq: number) => {
        set((state) => {
            if (!state.conversation) return;
            state.conversation.ackedSeq = Math.max(state.conversation.ackedSeq, seq);
        });
    };

    const setActiveConversation = async (conversationId: string, resync = false) => {
        if (!resync && get().conversation?.id === conversationId && get().status !== "ERROR") {
            return;
        }

        const prev = get().conversation;
        if (prev) {
            flushAckNow(prev.id);
        }

        const myRequestId = ++requestId;

        // no loading state on resync so that the user still sees the original window
        if (!resync) {
            set({
                conversation: null,
                status: "LOADING",
                error: null,
                loadingConversationId: conversationId,
            });
        }

        try {
            const [
                detail,
                page
            ] = await Promise.all([
                apiGetConversationDetail(conversationId),
                apiLoadMessages(conversationId)
            ])

            if (requestId !== myRequestId) return;

            const me = useAuthStore.getState().user!;
            
            const meta: ConversationMeta =
                detail.type === "DIRECT"
                    ? {
                        type: "DIRECT",
                        blockedMe: detail.blockedMe,
                        createdAt: detail.createdAt,
                    }
                    : {
                        type: "GROUP",
                        groupCreator: (detail.groupCreatorId === me.userId ? me : detail.otherMembers.find((m) => m.userId === detail.groupCreatorId)!),
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
                    lastSeqSnapshot: detail.lastSeqSnapshot,
                    myLastReadSeq: detail.myLastReadSeq,
                    loadingOlder: false,
                    loadOlderError: null,
                    ackedSeq: detail.myLastReadSeq
                },
                status: "READY",
                loadingConversationId: null,
            });

            if (detail.myLastReadSeq < detail.lastSeqSnapshot) {
                flushAckNow(conversationId);
            }
        } catch (err) {
            if (requestId !== myRequestId) return;

            set({
                status: "ERROR",
                error: getErrorMessage(err),
                loadingConversationId: null,
            });
        }
    };

    const clearActiveConversation = () => {
        const current = get().conversation;
        if (current) {
            flushAckNow(current.id);
        }

        requestId++; // invalidate anything in flight
        set({
            status: "IDLE",
            error: null,
            conversation: null,
            loadingConversationId: null,
        });
    };

    const openDirectConversation = async (targetId: number) => {
        const myRequestId = ++requestId;

        // TODO? do a local search in the conversationsStore list first?
        // Nah
        set({
            status: "LOADING",
            error: null,
            loadingConversationId: null,
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

        if (!s.conversation || s.conversation.loadingOlder || !s.conversation.hasOlder || s.conversation.messages.length === 0) {
            return;
        }

        const myRequestId = ++requestId;
        const cursor = s.conversation.messages[0].seq;

        set((state) => {
            state.conversation!.loadingOlder = true;
            state.conversation!.loadOlderError = null;
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

            set((state) => {
                state.conversation!.loadOlderError = getErrorMessage(err);
            });
        } finally {
            set((state) => {
                state.conversation!.loadingOlder = false;
            });
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

            // optimistic ui update
            useConversationsStore.getState().updateLastReadSeq(message.conversationId, message.seq);
            scheduleAckFlush(state.conversation.id);
        });
    };

    const leaveConversation = async () => {
        const conversationId = get().conversation?.id;
        if (!conversationId) return;

        await apiLeaveConversation(conversationId);
        get().clearActiveConversation();

        useConversationsStore.getState().removeLocal(conversationId);
    };

    const onMembersAdded = (newMembers: UserInfo[]) => {
        set((state) => {
            state.conversation!.otherMembers = state.conversation!.otherMembers
                .concat(newMembers)
                .sort((a, b) => a.username.localeCompare(b.username));
        });
    };

    const onMemberRemoved = (memberId: number) => {
        set((state) => {
            state.conversation!.otherMembers = state.conversation!.otherMembers.filter(
                (m) => m.userId !== memberId
            );
        });
    };

    const onGroupClosed = () => {
        set((state) => {
            // this will never happen but we need the linter happy
            if (state.conversation?.meta.type !== "GROUP") {
                return state;
            }
            state.conversation.meta.isClosed = true;
        });
    };

    return {
        status: "IDLE",
        error: null,
        conversation: null,
        loadingConversationId: null,

        setActiveConversation,
        clearActiveConversation,
        openDirectConversation,
        loadOlderMessages,
        upsertMessage,
        leaveConversation,
        onMembersAdded,
        onMemberRemoved,
        onGroupClosed,
        onAckConfirmed
    };
}));