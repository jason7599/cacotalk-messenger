import { Ban, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import { useMessageSendStore } from "../messageSendStore";

export default function MessageComposer() {
    const conversationId = useActiveConversationStore((s) => s.conversation!.id);
    const meta = useActiveConversationStore((s) => s.conversation!.meta);
    const sendMessage = useMessageSendStore((s) => s.send);

    const blocked = meta.type === "DIRECT" && (meta.blockedMe || meta.blockedByMe);

    const [content, setContent] = useState("");
    const canSend = content.trim().length > 0;

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function resizeTextarea() {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }

    function handleChange(value: string) {
        setContent(value);
        requestAnimationFrame(resizeTextarea);
    }

    function handleSend() {
        if (blocked) {
            return;
        }

        const trimmed = content.trim();

        if (!trimmed) {
            return;
        }

        sendMessage(conversationId, trimmed);

        setContent("");

        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        });
    }

    return (
        <div
            className="
                shrink-0
                border-t-2 border-[#4b1b1f]
                bg-[#100708]
                p-3
            "
        >
            {blocked ? (
                <div
                    className="
                        flex items-center justify-center gap-2
                        border-2 border-[#4b1b1f]
                        bg-[#16090b]
                        px-4 py-4
                        text-[#7f6668]
                    "
                >
                    <Ban size={16} strokeWidth={2.3} />

                    <span
                        className="
                            text-[10px] font-bold
                            tracking-[0.16em]
                        "
                    >
                        {meta.blockedByMe
                            ? "TRANSMISSION SEALED // YOU BLOCKED THIS SOUL"
                            : "TRANSMISSION REJECTED // THIS SOUL BLOCKED YOU"}
                    </span>
                </div>
            ) : (
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
                            className="
                                min-h-11 max-h-32
                                min-w-0 flex-1
                                resize-none
                                overflow-y-auto
                                border-2 border-[#4b1b1f]
                                bg-[#0c0506]
                                px-3 py-3
                                text-sm
                                text-[#eee2d5]
                                outline-none
                                placeholder:text-[#5f4548]
                                focus:border-[#a71924]
                            "
                        />

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!canSend}
                            aria-label="Send message"
                            className="
                                grid h-11 w-11 shrink-0 place-items-center
                                border-2 border-[#64141b]
                                bg-[#2b0e12]
                                text-[#a71924]
                                shadow-[3px_3px_0_#48090e]

                                enabled:hover:border-[#e02632]
                                enabled:hover:bg-[#a71924]
                                enabled:hover:text-[#eee2d5]

                                enabled:active:translate-x-0.75
                                enabled:active:translate-y-0.75
                                enabled:active:shadow-[1px_1px_0_#48090e]

                                disabled:cursor-not-allowed
                                disabled:border-[#321316]
                                disabled:bg-[#16090b]
                                disabled:text-[#4f3437]
                                disabled:shadow-none
                            "
                        >
                            <Send size={18} strokeWidth={2.4} />
                        </button>
                    </div>

                    <div
                        className="
                            mt-2 flex items-center justify-between
                            text-[9px]
                            tracking-[0.14em]
                            text-[#5f4a4c]
                        "
                    >
                        <span>ENTER // SEND</span>
                        <span>SHIFT + ENTER // NEW LINE</span>
                    </div>
                </>
            )}
        </div>
    );
}