import { useCallback, useEffect, useRef, useState } from "react";

const BOTTOM_THRESHOLD_PX = 300;

interface UseStickToBottomOptions {
    containerRef: React.RefObject<HTMLDivElement | null>;
    lastMessageSeq: number | null;
}

interface UseStickToBottomResult {
    isNearBottom: boolean;
    scrollToBottom: () => void;
}

export function useStickToBottom({ containerRef, lastMessageSeq }: UseStickToBottomOptions): UseStickToBottomResult {
    const [isNearBottom, setIsNearBottom] = useState(true);
    const prevLastMessageSeq = useRef(lastMessageSeq);

    const scrollToBottom = useCallback(() => {
            const el = containerRef.current;
            if (!el) return;
            el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
        },
        [containerRef]
    );

    // Track whether the user is near the bottom as they scroll around.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
            const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            setIsNearBottom(distanceFromBottom <= BOTTOM_THRESHOLD_PX);
        };

        el.addEventListener("scroll", handleScroll, { passive: true });

        // run once up front in case content is short enough that we start "at bottom"
        handleScroll();

        return () => el.removeEventListener("scroll", handleScroll);
    }, [containerRef]);

    // If a genuinely new last message arrives (not older messages being prepended) while
    // the user is already at the bottom, follow it down automatically.
    useEffect(() => {
        const isNewLastMessage = lastMessageSeq !== null && lastMessageSeq !== prevLastMessageSeq.current;
        prevLastMessageSeq.current = lastMessageSeq;
        if (!isNewLastMessage || !isNearBottom) return;

        // wait a frame so the new node is laid out before we measure/scroll
        requestAnimationFrame(() => scrollToBottom());
    }, [lastMessageSeq, isNearBottom, scrollToBottom]);

    return { isNearBottom, scrollToBottom };
}