import { cn } from "../../../components/ui";
import type { ReplyTo } from "../types";

export function toOneLine(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

type ReplyQuoteProps = {
    replyTo: ReplyTo;
    className?: string;
};

/** The quoted original shown at the top of a reply bubble. */
export default function ReplyQuote({ replyTo, className }: ReplyQuoteProps) {
    return (
        <div className={cn("min-w-0 border-l-2 border-crimson bg-void/40 px-2.5 py-1.5", className)}>
            <p className="truncate text-3xs font-bold tracking-label text-faint">
                {replyTo.senderName}
            </p>
            <p className="truncate text-xs text-muted">
                {toOneLine(replyTo.content)}
            </p>
        </div>
    );
}
