import { useAuthStore } from "../../../auth/authStore";
import { formatMessageTimestamp } from "../../formatters";
import type { UserMessage } from "../../types";
import { cn } from "../../../../components/ui";
import MessageBubble from "./MessageBubble";

type UserMessageItemProps = {
    message: UserMessage;
};

export default function UserMessageItem({ message }: UserMessageItemProps) {
    const myId = useAuthStore((s) => s.user!.userId);
    const isMine = message.senderId === myId;

    console.log(message.seq);

    return (
        <div className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
            <div className="max-w-[70%]">
                {!isMine && (
                    <p className="mb-1 ml-1 text-3xs font-bold tracking-label text-faint">
                        {message.senderName}
                    </p>
                )}

                <MessageBubble variant={isMine ? "mine" : "theirs"}>
                    {message.content}
                </MessageBubble>

                <p className={cn("mt-1 text-3xs tracking-widest text-dim", isMine ? "mr-1 text-right" : "ml-1")}>
                    {formatMessageTimestamp(message.createdAt)}
                </p>
            </div>
        </div>
    );
}
