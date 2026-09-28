import type React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

interface UseLoadOlderMessagesOptions {
    containerRef: React.RefObject<HTMLDivElement | null>;
    sentinelRef: React.RefObject<HTMLDivElement | null>;
    hasOlder: boolean;
    loadingOlder: boolean;
    loadOlderMessages: () => void;

    // Value that changes whenever the message list changes
    // Used to know when to reapply the scroll height compensation after older messages load
    dependency: unknown;
};

export function useLoadOlderMessages({
    containerRef,
    sentinelRef,
    hasOlder,
    loadingOlder,
    loadOlderMessages,
    dependency
}: UseLoadOlderMessagesOptions) {
    const prevScrollHeight = useRef<number | null>(null);

    // Trigger load when sentinel enters view
    useEffect(() => {
        const container = containerRef.current;
        const sentinel = sentinelRef.current;
        if (!container || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingOlder && hasOlder) {
                    prevScrollHeight.current = container.scrollHeight;
                    loadOlderMessages();
                }
            },
            { root: container, rootMargin: "300px 0px 0px 0px" }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [containerRef, sentinelRef, loadingOlder, hasOlder, loadOlderMessages]);

    // After older messages are prepended, keep viewport pinned to the same content
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || prevScrollHeight.current === null) return;

        const newScrollHeight = container.scrollHeight;
        container.scrollTop += newScrollHeight - prevScrollHeight.current;
        prevScrollHeight.current = null;
    }, [dependency]);
}