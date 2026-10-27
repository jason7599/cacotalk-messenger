import type { ReactNode } from "react";
import { cn } from "../../../../components/ui";

const variants = {
    /** Your own sent message. */
    mine: "border-crimson bg-crimson-deep text-bone",
    /** Someone else's message. */
    theirs: "border-edge bg-panel text-ash",
    /** Yours, still sending. */
    pending: "border-crimson bg-crimson-deep text-bone opacity-60",
    /** Yours, failed to send. */
    failed: "border-crimson-bright bg-panel text-bone",
};

type MessageBubbleProps = {
    variant: keyof typeof variants;
    /** Extra content after the text (e.g. a spinner). */
    trailing?: ReactNode;
    quote?: ReactNode; // reply quote
    children: ReactNode;
};

export default function MessageBubble({ variant, trailing, quote, children }: MessageBubbleProps) {
    return (
        <div
            className={cn(
                "border-2 px-4 py-3 text-sm leading-relaxed shadow-hard-md",
                variants[variant],
            )}
        >
            {quote && <div className="mb-2">{quote}</div>}
            <div className="flex items-center gap-2.5">
                <p className="whitespace-pre-wrap wrap-break-word">{children}</p>
                {trailing}
            </div>
        </div>
    );
}
