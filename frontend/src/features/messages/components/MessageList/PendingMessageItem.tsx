import { Spinner } from "../../../../components/ui";
import MessageBubble from "./MessageBubble";

type PendingMessageItemProps = {
    content: string;
};

export default function PendingMessageItem({ content }: PendingMessageItemProps) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[85%] lg:max-w-[70%]">
                <MessageBubble variant="pending" trailing={<Spinner size="sm" />}>
                    {content}
                </MessageBubble>
            </div>
        </div>
    );
}
