import type React from "react";
import type { ChatMessage } from "../../types";
import { useLayoutEffect, useRef } from "react";

interface UseInitialScrollPositionOptions {
    containerRef: React.RefObject<HTMLDivElement | null>;
    messages: ChatMessage[];
    prevLastReadSeq: number;
};

export function useInitialScrollPosition({ containerRef, messages, prevLastReadSeq }: UseInitialScrollPositionOptions) {
    const done = useRef(false);

    useLayoutEffect(() => {
        if (done.current) return;

        const container = containerRef.current;
        if (!container || messages.length === 0) return;

        if (prevLastReadSeq !== 0) {
            const el = container.querySelector(`[data-seq="${prevLastReadSeq}"]`);
            if (el) {
                el.scrollIntoView({ block: "center" });
                done.current = true;
                return;
            }

            const oldestLoadedSeq = messages[0].seq;
            if (prevLastReadSeq < oldestLoadedSeq) {
                // unread boundary got dropped from the initial load due to load cap. 
                // just land at the top.
                container.scrollTop = 0;
                done.current = true;
                return; 
            }
        }

        // Never read before, or already caught up.
        container.scrollTop = container.scrollHeight;
        done.current = true;
        return;
    }, [containerRef, messages, prevLastReadSeq]);
}