import { Ban, Reply, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import { useMessageSendStore } from "../messageSendStore";
import { IconButton } from "../../../components/ui";
import { MESSAGE_MAX_LENGTH } from "../../../shared/constants";
import { useComposerLockedReason } from "../useComposerLockedReason";
import { toOneLine } from "./ReplyQuote";

export default function MessageComposer() {
    const conversationId = useActiveConversationStore((s) => s.conversation!.id);
    const replyingTo = useActiveConversationStore((s) => s.conversation!.replyingTo);
    const clearReplyingTo = useActiveConversationStore((s) => s.clearReplyingTo);

    const sendMessage = useMessageSendStore((s) => s.send);

    const [content, setContent] = useState("");

    const lockedReason = useComposerLockedReason();
    const canSend = !lockedReason && content.trim().length > 0;

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Clicking reply on a message jumps straight into typing.
    // Keyed on seq so picking a different message re-focuses too.
    const replySeq = replyingTo?.seq ?? null;
    useEffect(() => {
        if (replySeq !== null) {
            textareaRef.current?.focus();
        }
    }, [replySeq]);

    function resizeTextarea() {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }

    function handleChange(value: string) {
        setContent(value);
        requestAnimationFrame(resizeTextarea);
    }

    function handleSend() {
        if (!canSend) {
            return;
        }

        const trimmed = content.trim().substring(0, MESSAGE_MAX_LENGTH);
        sendMessage(conversationId, trimmed, replyingTo);

        setContent("");
        clearReplyingTo();

        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        });
    }

    return (
        <div className="shrink-0 border-t-2 border-edge bg-sunken p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {lockedReason ? (
                <div className="flex items-center justify-center gap-2 border-2 border-edge bg-pit p-4 text-faint">
                    <Ban size={16} strokeWidth={2.3} />
                    <span className="text-2xs font-bold tracking-caps">{lockedReason}</span>
                </div>
            ) : (
                // actual input bar
                <>
                    {replyingTo && (
                        <div className="mb-2 flex items-center gap-2 border-2 border-edge bg-pit py-1 pl-3 pr-1">
                            <Reply size={14} strokeWidth={2.4} className="shrink-0 text-crimson" />

                            <p className="min-w-0 flex-1 truncate text-xs text-muted">
                                <span className="font-bold tracking-label text-faint">
                                    REPLYING TO {replyingTo.senderName}
                                </span>
                                <span className="mx-1.5 text-dim">//</span>
                                {toOneLine(replyingTo.content)}
                            </p>

                            <button
                                type="button"
                                onClick={clearReplyingTo}
                                aria-label="Cancel reply"
                                className="grid h-7 w-7 shrink-0 place-items-center text-faint transition-colors hover:text-crimson-bright focus-visible:text-crimson-bright"
                            >
                                <X size={14} strokeWidth={2.4} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => handleChange(e.target.value)}
                            maxLength={MESSAGE_MAX_LENGTH}
                            onKeyDown={(e) => {
                                if (e.key === "Escape" && replyingTo) {
                                    e.preventDefault();
                                    clearReplyingTo();
                                    return;
                                }

                                if (e.key !== "Enter" || e.shiftKey) return;

                                // Mid-composition (Korean/Japanese/Chinese IME): this Enter commits the
                                // syllable, it's not a send. Otherwise the last character gets left behind.
                                if (e.nativeEvent.isComposing) return;

                                // Phones/tablets: Enter is a newline, the send button sends.
                                // Same check as the `touch:` variant in index.css.
                                if (window.matchMedia("(hover: none)").matches) return;

                                e.preventDefault();
                                handleSend();
                            }}
                            placeholder="WHISPER INTO THE VOID..."
                            rows={1}
                            className="field max-h-32 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto p-3 text-base md:text-sm"
                        />

                        <IconButton
                            variant="accent"
                            size="xl"
                            onClick={handleSend}
                            disabled={!canSend}
                            aria-label="Send message"
                        >
                            <Send size={18} strokeWidth={2.4} />
                        </IconButton>
                    </div>

                    <div className="mt-2 hidden items-center justify-between text-3xs tracking-label text-dim lg:flex">
                        <span>ENTER // SEND</span>
                        <span>SHIFT + ENTER // NEW LINE</span>
                    </div>
                </>
            )}
        </div>
    );
}
