import { useEffect } from "react";
import { Users, X } from "lucide-react";
import { useToastStore, type Toast } from "../toastStore";
import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import { Avatar } from "../../../components/ui";

const TOAST_MS = 5000;

/**
 * In-app message popups. Phones: top of the screen. Desktop: bottom-right, above the composer so it never covers Send.
 * Mount once, in MainPage.
 */
export default function ToastStack() {
    const toasts = useToastStore((s) => s.toasts);
    const activeId = useActiveConversationStore((s) => s.conversation?.id);

    // drop everything on logout / unmount
    useEffect(() => () => useToastStore.getState().clear(), []);

    // no point showing a toast for the chat that's already open
    const visible = toasts.filter((t) => t.conversationId !== activeId);
    if (visible.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex flex-col gap-2 lg:inset-x-auto lg:top-auto lg:right-5 lg:bottom-28 lg:w-80">
            {visible.map((toast) => (
                <ToastCard key={toast.key} toast={toast} />
            ))}
        </div>
    );
}

function ToastCard({ toast }: { toast: Toast }) {
    const dismiss = useToastStore((s) => s.dismiss);
    const setActiveConversation = useActiveConversationStore((s) => s.setActiveConversation);

    useEffect(() => {
        const id = window.setTimeout(() => dismiss(toast.key), TOAST_MS);
        return () => window.clearTimeout(id);
    }, [toast.key, dismiss]);

    return (
        <div
            role="status"
            className="pointer-events-auto relative flex animate-toast-in border-2 border-crimson bg-raised shadow-hard-lg shadow-shade-crimson motion-reduce:animate-none"
        >
            <button
                type="button"
                onClick={() => {
                    dismiss(toast.key);
                    setActiveConversation(toast.conversationId);
                }}
                className="flex min-w-0 flex-1 items-start gap-3 p-3 pr-9 text-left transition-colors hover:bg-panel-hover"
            >
                <Avatar
                    name={toast.title}
                    icon={toast.kind === "event" ? <Users size={16} strokeWidth={2.4} aria-hidden="true" /> : undefined}
                    size="sm"
                    tone="active"
                />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-3xs font-bold tracking-label text-crimson">{toast.eyebrow}</p>
                    <p className="line-clamp-2 text-sm font-bold wrap-break-word text-bone">{toast.title}</p>
                    {toast.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed wrap-break-word text-muted">{toast.body}</p>
                    )}
                </div>
            </button>

            <button
                type="button"
                onClick={() => dismiss(toast.key)}
                aria-label="Dismiss"
                className="absolute top-2 right-2 grid h-6 w-6 place-items-center text-faint transition-colors hover:text-crimson-bright"
            >
                <X size={14} strokeWidth={2.5} />
            </button>
        </div>
    );
}
