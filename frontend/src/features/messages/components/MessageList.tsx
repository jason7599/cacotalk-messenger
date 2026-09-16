import { useEffect, useLayoutEffect, useRef } from "react";
import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import UserMessageItem from "./UserMessageItem";

export default function MessageList() {
    const messages = useActiveConversationStore((s) => s.conversation!.messages);
    const loadOlderMessages = useActiveConversationStore((s) => s.loadOlderMessages);
    const loadingOlder = useActiveConversationStore((s) => s.loadingOlder);
    const hasOlder = useActiveConversationStore((s) => s.conversation!.hasOlder);
    const prevLastReadSeq = useActiveConversationStore((s) => s.conversation!.prevLastReadSeq);

    const scrollRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number | null>(null);
    const initialScrollDoneRef = useRef(false);

    const showDivider = 0 < prevLastReadSeq && prevLastReadSeq < messages[messages.length - 1]?.seq;

    // Trigger load when sentinel enters view
    useEffect(() => {
        const container = scrollRef.current;
        const sentinel = topSentinelRef.current;
        if (!container || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingOlder && hasOlder) {
                    prevScrollHeight.current = container.scrollHeight;
                    loadOlderMessages();
                }
            },
            { root: container, rootMargin: "300px 0px 0px 0px" }
        )

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadingOlder, hasOlder, loadOlderMessages]);

    // Runs exactly once on first paint
    useLayoutEffect(() => {
        const container = scrollRef.current;
        if (!container || prevScrollHeight.current === null) return;

        const newScrollHeight = container.scrollHeight;
        container.scrollTop += newScrollHeight - prevScrollHeight.current;
        prevScrollHeight.current = null;
    }, [messages]);

    useLayoutEffect(() => {
        if (initialScrollDoneRef.current) return;
        const container = scrollRef.current;
        if (!container || messages.length === 0) return;

        if (prevLastReadSeq > 0) {
            const el = container.querySelector(`[data-seq="${prevLastReadSeq}"]`);
            if (el) {
                el.scrollIntoView({ block: "center" });
                initialScrollDoneRef.current = true;
                return;
            }

            const oldestLoadedSeq = messages[0].seq;
            if (prevLastReadSeq < oldestLoadedSeq) {
                // boundary got dropped from the initial load — land at top,
                // divider will appear once the user scrolls up into it
                container.scrollTop = 0;
                initialScrollDoneRef.current = true;
                return;
            }
        }

        // never read before, or already caught up
        container.scrollTop = container.scrollHeight;
        initialScrollDoneRef.current = true;
    }, [messages, prevLastReadSeq]);

    return (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4" style={{ overflowAnchor: "none" }}>
            <div ref={topSentinelRef} className="flex h-9 items-center justify-center py-2">
                {loadingOlder && (
                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                )}
            </div>

            <div className="flex flex-col gap-3">
                {messages.map((message) => {
                    return (
                        <div key={message.seq} data-seq={message.seq}>
                            {message.type === "USER" 
                                ? <UserMessageItem message={message} />
                                : <>hi</>
                            }
                            {showDivider && message.seq === prevLastReadSeq && <UnreadDivider />}
                        </div>
                    );
                })}
            </div>
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