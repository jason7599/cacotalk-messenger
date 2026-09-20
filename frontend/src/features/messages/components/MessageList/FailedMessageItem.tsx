import { RotateCw, Trash2 } from "lucide-react";

type FailedMessageItemProps = {
    content: string;
    onRetry: () => void;
    onDiscard: () => void;
};

export default function FailedMessageItem({ content, onRetry, onDiscard }: FailedMessageItemProps) {
    return (
        <div className="flex flex-col items-end gap-1.5">
            <div className="max-w-[75%] border-2 border-[#e02632] bg-[#190b0d] px-4 py-2.5 text-sm text-[#eee2d5]">
                <span className="whitespace-pre-wrap">{content}</span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.15em]">
                <span className="text-[#a71924]">
                    DELIVERY FAILED
                </span>

                <button
                    type="button"
                    onClick={onRetry}
                    className="flex items-center gap-1 text-[#e02632] hover:text-[#eee2d5]"
                >
                    <RotateCw size={12} strokeWidth={2.5} />
                    RETRY
                </button>

                <button
                    type="button"
                    onClick={onDiscard}
                    className="flex items-center gap-1 text-[#9f8581] hover:text-[#e02632]"
                >
                    <Trash2 size={12} strokeWidth={2.5} />
                    DISCARD
                </button>
            </div>
        </div>
    );

}