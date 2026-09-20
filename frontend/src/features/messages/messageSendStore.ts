import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { apiSendMessage } from "./messagesApi";
import { getErrorMessage } from "../../shared/apiClient";
import { useActiveConversationStore } from "../conversations/activeConversationStore";

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

            // Upsert using the API response.
            // We could rely on WS events, but it could realistically have a delay.
            // That will cause a gap between the pending message being removed from the UI and it actually appearing as
            // a persisted message.
            const message = await apiSendMessage(conversationId, next.content, next.clientId);
            useActiveConversationStore.getState().upsertMessage(message);

            set((state) => {
                const q = state.queues[conversationId];
                q.queue.shift();
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
        reset
    };
}));