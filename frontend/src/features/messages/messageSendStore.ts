import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { apiSendMessage } from "./messagesApi";
import { getErrorMessage } from "../../shared/apiError";
import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";

export type PendingMessage = {
    content: string;
    clientId: string;
};

type MessageQueue = {
    queue: PendingMessage[];
    failed: PendingMessage[];
    status: "READY" | "SENDING";
    error: string | null;
};

type MessageSendState = {
    queues: Record<string, MessageQueue>; // by conversationId

    send: (conversationId: string, content: string, clientId?: string) => void;
    retry: (conversationId: string, clientId: string) => void;
    discard: (conversationId: string, clientId: string) => void;
    resolveByClientId: (conversationId: string, clientId: string) => void;

    reset: () => void;
};

// immer makes mutation code much easier
// not even gonna pretend to understand how it works
export const useMessageSendStore = create<MessageSendState>()(immer((set, get) => {

    const process = async (conversationId: string) => {
        const q = get().queues[conversationId];
        if (!q || q.status === "SENDING" || q.queue.length === 0) {
            return;
        }

        const next = q.queue[0];

        set((state) => {
            const q = state.queues[conversationId];
            q.status = "SENDING";
            q.error = null;
        });

        try {
            // TODO: cleanup 
            if (import.meta.env.DEV) {
                const x = next.content.trim();

                switch (x) {
                    case "!error": 
                        await new Promise((r) => setTimeout(r, 1));
                        throw new Error("Simulated failure");
                    case "!wait":
                        await new Promise((r) => setTimeout(r, 3000));
                        break;
                }
            }

            const message = await apiSendMessage(conversationId, next.content, next.clientId);

            set((state) => {
                const q = state.queues[conversationId];

                // This condition might not hold true if the WS event arrived first,
                // in which case resolveByClientId is called to remove the message from the queue.
                // On the contrary, if this does hold true, this means the API response arrived first.
                // Technically we can pull these upsert calls outside, firing them regardless of this check
                // after the await apiSendMessage is finished, since these upserts are idempotent.
                // And that is what realtimeEventHandler#handleNewMessage does too.
                // But the reason why he(yes I'm calling code "he") does it is because
                // there is no way to distinguish multi-session/tab scenarios.
                // Here we can.
                // Also, since handleNewMessage calls these 2 upsert calls unconditionally anyway,
                // this is technically redundant, given that the WS arrives not too long after the API response does.
                // So, future me, if you're confused by this, TLDR;
                // This will solve the "API confirmed it but WS didn't, but the UI still shows it as pending" issue.
                if (q.queue[0]?.clientId === next.clientId) {
                    q.queue.shift();
                    useConversationsStore.getState().onNewMessage(message);
                    useActiveConversationStore.getState().upsertMessage(message);
                }

                q.status = "READY";
            });

            // continue on
            process(conversationId);
        } catch (err) {
            set((state) => {
                const q = state.queues[conversationId];

                q.status = "READY"; // Ready to retry
                q.error = getErrorMessage(err);

                // put aside the whole queue
                q.failed.push(...q.queue);
                q.queue = [];
            });
        }
    };

    const send = (conversationId: string, content: string, clientId: string = crypto.randomUUID()) => {
        set((state) => {
            if (!state.queues[conversationId]) {
                state.queues[conversationId] = { queue: [], failed: [], status: "READY", error: null };
            }
            state.queues[conversationId].queue.push({ content, clientId });
        });

        process(conversationId);
    };

    const retry = (conversationId: string, clientId: string) => {
        let content: string | undefined;

        set((state) => {
            const q = state.queues[conversationId];
            if (!q) return;

            const idx = q.failed.findIndex((m) => m.clientId === clientId);
            if (idx === -1) return;

            content = q.failed[idx].content;
            q.failed.splice(idx, 1);
        });

        if (content) {
            // DEV-ONLY: "!error" always fails by design
            // So bump it to "!!error" so retry can actually succeed
            // TODO: cleanup
            const toSend = import.meta.env.DEV && content === "!error" ? "!!error" : content;
            send(conversationId, toSend, clientId);
        }
    };

    const discard = (conversationId: string, clientId: string) => {
        set((state) => {
            const q = state.queues[conversationId];
            if (!q) return;
            q.failed = q.failed.filter((m) => m.clientId !== clientId);
        });
    };

    // Meant to be called by realtime event handler.
    // If the WS event arrives earlier than the sendMessage API response, remove the entry from the queue.
    const resolveByClientId = (conversationId: string, clientId: string) => {
        set((state) => {
            const q = state.queues[conversationId];
            if (!q) return;
            if (q.queue[0]?.clientId === clientId) {
                q.queue.shift();
            }
        });
    };

    const reset = () => {
        set({
            queues: {}
        });
    };

    return {
        queues: {},
        send,
        retry,
        discard,
        resolveByClientId,
        reset
    };
}));