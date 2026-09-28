import { RotateCw, Trash2 } from "lucide-react";
import MessageBubble from "./MessageBubble";

type FailedMessageItemProps = {
    content: string;
    onRetry: () => void;
    onDiscard: () => void;
};

export default function FailedMessageItem({ content, onRetry, onDiscard }: FailedMessageItemProps) {
    return (
        <div className="flex flex-col items-end gap-1.5">
            <div className="max-w-[70%]">
                <MessageBubble variant="failed">{content}</MessageBubble>
            </div>

            <div className="flex items-center gap-3 text-2xs font-bold tracking-caps">
                <span className="text-crimson">DELIVERY FAILED</span>

                <button
                    type="button"
                    onClick={onRetry}
                    className="flex items-center gap-1 text-crimson-bright hover:text-bone"
                >
                    <RotateCw size={12} strokeWidth={2.5} />
                    RETRY
                </button>

                <button
                    type="button"
                    onClick={onDiscard}
                    className="flex items-center gap-1 text-muted hover:text-crimson-bright"
                >
                    <Trash2 size={12} strokeWidth={2.5} />
                    DISCARD
                </button>
            </div>
        </div>
    );
}
