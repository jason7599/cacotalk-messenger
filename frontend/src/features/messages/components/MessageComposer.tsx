import { Ban, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import { useMessageSendStore } from "../messageSendStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import { IconButton } from "../../../components/ui";

export default function MessageComposer() {
    const conversationId = useActiveConversationStore((s) => s.conversation!.id);
    const meta = useActiveConversationStore((s) => s.conversation!.meta);
    const otherMembers = useActiveConversationStore((s) => s.conversation!.otherMembers);
    const sendMessage = useMessageSendStore((s) => s.send);

    const blockedByMe = useBlockedUsersStore((s) =>
        meta.type === "DIRECT" && !!s.blockedUsersById[otherMembers[0].userId]
    );

    const [content, setContent] = useState("");

    function getLockedReason() {
        if (meta.type === "GROUP") {
            return meta.isClosed ? "CHANNEL SEALED // NO NEW TRANSMISSIONS" : null;
        }
        // blockedByMe takes precedence over blockedMe
        if (blockedByMe) return "LINK SEVERED // YOU BANISHED THIS SOUL";
        if (meta.blockedMe) return "LINK DENIED // THIS SOUL REJECTS YOUR SIGNAL";
        return null;
    }

    const lockedReason = getLockedReason();
    const canSend = !lockedReason && content.trim().length > 0;

    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

        const trimmed = content.trim();
        sendMessage(conversationId, trimmed);

        setContent("");

        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        });
    }

    return (
        <div className="shrink-0 border-t-2 border-edge bg-sunken p-3">
            {lockedReason ? (
                <div className="flex items-center justify-center gap-2 border-2 border-edge bg-pit p-4 text-faint">
                    <Ban size={16} strokeWidth={2.3} />
                    <span className="text-2xs font-bold tracking-caps">{lockedReason}</span>
                </div>
            ) : (
                // actual input bar
                <>
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => handleChange(e.target.value)}
                            maxLength={2000}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="WHISPER INTO THE VOID..."
                            rows={1}
                            className="field max-h-32 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto p-3 text-sm"
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

                    <div className="mt-2 flex items-center justify-between text-3xs tracking-label text-dim">
                        <span>ENTER // SEND</span>
                        <span>SHIFT + ENTER // NEW LINE</span>
                    </div>
                </>
            )}
        </div>
    );
}
