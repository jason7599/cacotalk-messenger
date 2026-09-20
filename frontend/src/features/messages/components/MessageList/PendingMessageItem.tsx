type PendingMessageItemProps = {
    content: string;
};

export default function PendingMessageItem({ content }: PendingMessageItemProps) {
    return (
        <div className="flex justify-end">
            <div className="flex max-w-[75%] items-center gap-2.5 border-2 border-[#4b1b1f] bg-[#190b0d] px-4 py-2.5 text-sm text-[#eee2d5] opacity-60">
                <span className="whitespace-pre-wrap">
                    {content}
                </span>
                <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-[#9f8581]/30 border-t-[#9f8581]" />
            </div>
        </div>
    );
}
