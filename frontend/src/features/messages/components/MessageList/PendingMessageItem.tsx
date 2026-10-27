import { Spinner } from "../../../../components/ui";
import type { ReplyTo } from "../../types";
import ReplyQuote from "../ReplyQuote";
import MessageBubble from "./MessageBubble";

type PendingMessageItemProps = {
    content: string;
    replyTo: ReplyTo | null;
};

export default function PendingMessageItem({ content, replyTo }: PendingMessageItemProps) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[85%] lg:max-w-[70%]">
                <MessageBubble
                    variant="pending"
                    trailing={<Spinner size="sm" />}
                    quote={replyTo && <ReplyQuote replyTo={replyTo} />}
                >
                    {content}
                </MessageBubble>
            </div>
        </div>
    );
}
