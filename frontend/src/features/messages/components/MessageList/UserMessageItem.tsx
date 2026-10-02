import { useAuthStore } from "../../../auth/authStore";
import { formatMessageTimestamp } from "../../formatters";
import type { UserMessage } from "../../types";
import { Avatar, cn } from "../../../../components/ui";
import MessageBubble from "./MessageBubble";

type UserMessageItemProps = {
    message: UserMessage;
    /** First message of a group: show avatar + name. Later ones in the group hide them. */
    showSender?: boolean;
    /** Last message of a group: show the timestamp under it. */
    showTimestamp?: boolean;
};

export default function UserMessageItem({ message, showSender = true, showTimestamp = true }: UserMessageItemProps) {
    const myId = useAuthStore((s) => s.user!.userId);
    const isMine = message.senderId === myId;

    return (
        <div
            className={cn(
                "flex w-full",
                isMine ? "justify-end" : "justify-start",
                // continued messages sit closer to the one above (list gap is 12px, this makes it 4px)
                !showSender && "-mt-2",
            )}
        >
            <div className="flex max-w-[70%] items-start gap-2.5">
                {!isMine && (
                    showSender
                        ? <Avatar name={message.senderName} size="sm" className="mt-0.5" />
                        // same width as the avatar, so grouped bubbles line up
                        : <div aria-hidden="true" className="w-9 shrink-0" />
                )}

                <div className="min-w-0">
                    {!isMine && showSender && (
                        <p className="mb-1 ml-1 text-3xs font-bold tracking-label text-faint">
                            {message.senderName}
                        </p>
                    )}

                    <MessageBubble variant={isMine ? "mine" : "theirs"}>
                        {message.content}
                    </MessageBubble>

                    {showTimestamp && (
                        <p className={cn("mt-1 text-3xs tracking-widest text-dim", isMine ? "mr-1 text-right" : "ml-1")}>
                            {formatMessageTimestamp(message.createdAt)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}