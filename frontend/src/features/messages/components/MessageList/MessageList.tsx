import { useRef } from "react";
import { useActiveConversationStore } from "../../../conversations/activeConversationStore";
import UserMessageItem from "../UserMessageItem";
import EventMessageItem from "../EventMessageItem";
import { useInitialScrollPosition } from "./useInitialScrollPosition";
import { useLoadOlderMessages } from "./useLoadOlderMessages";
import { useStickToBottom } from "./useStickToBottom";
import { ChevronDown } from "lucide-react";

export default function MessageList() {
    const messages = useActiveConversationStore((s) => s.conversation!.messages);
    const loadOlderMessages = useActiveConversationStore((s) => s.loadOlderMessages);
    const loadingOlder = useActiveConversationStore((s) => s.loadingOlder);
    const hasOlder = useActiveConversationStore((s) => s.conversation!.hasOlder);
    const prevLastReadSeq = useActiveConversationStore((s) => s.conversation!.prevLastReadSeq);

    const scrollRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);

    const lastSeq = messages[messages.length - 1]?.seq;
    const showDivider = 0 < prevLastReadSeq && prevLastReadSeq < lastSeq;

    useInitialScrollPosition({
        containerRef: scrollRef,
        messages,
        prevLastReadSeq
    });

    useLoadOlderMessages({
        containerRef: scrollRef,
        sentinelRef: topSentinelRef,
        hasOlder,
        loadingOlder,
        loadOlderMessages,
        dependency: messages
    });

    const { isNearBottom, scrollToBottom } = useStickToBottom({
        containerRef: scrollRef,
        lastMessageSeq: lastSeq
    });

    return (
        <div className="relative min-h-0 flex-1">
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto px-5 py-4"
                style={{ overflowAnchor: "none" }}
            >
                <div ref={topSentinelRef} className="flex h-9 items-center justify-center py-2">
                    {loadingOlder && (
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                        <div key={message.seq} data-seq={message.seq}>
                            {message.type === "USER"
                                ? <UserMessageItem message={message} />
                                : <EventMessageItem message={message} />
                            }
                            {showDivider && message.seq === prevLastReadSeq && <UnreadDivider />}
                        </div>
                    ))}
                </div>
            </div>

            {!isNearBottom && messages.length > 0 && (
                <button
                    type="button"
                    onClick={scrollToBottom}
                    className="
                        absolute bottom-4 left-1/2 -translate-x-1/2
                        flex items-center gap-2
                        border-2 border-[#e02632]
                        bg-[#a71924]
                        px-4 py-2.5
                        text-xs font-bold tracking-[0.15em]
                        text-[#eee2d5]
                        shadow-[4px_4px_0_#520a10]
                        hover:bg-[#e02632]
                        active:shadow-[1px_1px_0_#520a10]
                    "
                >
                    <ChevronDown size={15} strokeWidth={2.5} />
                    RETURN TO THE LIVING
                </button>
            )}
        </div>
    );
};

function UnreadDivider() {
    return (
        <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#4b1b1f]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#a71924]">
                NEW WHISPERS
            </span>
            <div className="h-px flex-1 bg-[#a71924]" />
        </div>
    );
};