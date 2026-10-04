import { create } from "zustand";

export type Toast = {
    /** Changes when a toast is replaced, so its auto-dismiss timer restarts. */
    key: number;
    conversationId: string;
    /** "event" toasts (someone joined, group closed...) show a group icon instead of a letter. */
    kind: "message" | "event";
    eyebrow: string;
    title: string;
    body?: string;
};

const MAX_TOASTS = 3;
let nextKey = 0;

type ToastState = {
    toasts: Toast[];
    /** One toast per conversation: a newer message replaces the older toast. */
    push: (toast: Omit<Toast, "key">) => void;
    dismiss: (key: number) => void;
    clear: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],

    push: (toast) => {
        set((state) => ({
            toasts: [
                ...state.toasts.filter((t) => t.conversationId !== toast.conversationId),
                { ...toast, key: ++nextKey },
            ].slice(-MAX_TOASTS),
        }));
    },

    dismiss: (key) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.key !== key) }));
    },

    clear: () => set({ toasts: [] }),
}));
