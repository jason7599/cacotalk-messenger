import { useAuthStore } from "../../../auth/authStore";
import { formatMessageTimestamp } from "../../formatters";
import type { UserMessage } from "../../types";
import { Avatar, cn } from "../../../../components/ui";
import MessageBubble from "./MessageBubble";
import { useActiveConversationStore } from "../../../conversations/activeConversationStore";
import { useComposerLockedReason } from "../../useComposerLockedReason";
import { Reply } from "lucide-react";
import ReplyQuote from "../ReplyQuote";

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

    const setReplyingTo = useActiveConversationStore((s) => s.setReplyingTo);
    const canReply = useComposerLockedReason() === null;

    return (
        <div
            className={cn(
                "group flex w-full",
                isMine ? "justify-end" : "justify-start",
                // continued messages sit closer to the one above (list gap is 12px, this makes it 4px)
                !showSender && "-mt-2",
            )}
        >
            <div className="flex max-w-[85%] items-start gap-2.5 lg:max-w-[70%]">
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

                    <div className="relative">
                        <MessageBubble
                            variant={isMine ? "mine" : "theirs"}
                            quote={message.replyTo && <ReplyQuote replyTo={message.replyTo} />}
                        >
                            {message.content}
                        </MessageBubble>

                        {canReply && (
                            <button
                                type="button"
                                onClick={() => setReplyingTo({
                                    seq: message.seq,
                                    senderName: message.senderName,
                                    content: message.content,
                                })}
                                aria-label={`Reply to ${message.senderName}`}
                                className={cn(
                                    "absolute top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-faint transition-opacity hover:text-crimson-bright focus-visible:text-crimson-bright",
                                    "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 touch:opacity-100",
                                    // outer side of the bubble: left of mine, right of theirs
                                    isMine ? "right-full mr-1" : "left-full ml-1",
                                )}
                            >
                                <Reply size={20} strokeWidth={2.4} />
                            </button>
                        )}
                    </div>

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