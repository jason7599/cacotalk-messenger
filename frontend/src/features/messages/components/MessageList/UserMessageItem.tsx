import { useCallback, useRef, useState } from "react";
import { Reply, SmilePlus } from "lucide-react";
import { useAuthStore } from "../../../auth/authStore";
import { useActiveConversationStore } from "../../../conversations/activeConversationStore";
import { formatMessageTimestamp } from "../../formatters";
import type { UserMessage } from "../../types";
import type { ReactionType } from "../../reactions/reactions";
import { apiRemoveReaction, apiSetReaction } from "../../messagesApi";
import { useComposerLockedReason } from "../../useComposerLockedReason";
import { Avatar, cn } from "../../../../components/ui";
import MessageBubble from "./MessageBubble";
import ReplyQuote from "../ReplyQuote";
import ReactionPicker from "../../reactions/components/ReactionPicker";
import ReactionList from "../../reactions/components/ReactionList";
import { useModal } from "../../../../components/ModalProvider";
import ReactionsModal from "../../reactions/components/ReactionsModal";

type UserMessageItemProps = {
    message: UserMessage;
    /** First message of a group: show avatar + name. Later ones in the group hide them. */
    showSender?: boolean;
    /** Last message of a group: show the timestamp under it. */
    showTimestamp?: boolean;
};

const actionButtonClass =
    "grid h-7 w-7 place-items-center text-faint transition-colors hover:text-crimson-bright focus-visible:text-crimson-bright";

export default function UserMessageItem({ message, showSender = true, showTimestamp = true }: UserMessageItemProps) {
    const myId = useAuthStore((s) => s.user!.userId);
    const isMine = message.senderId === myId;

    const setReplyingTo = useActiveConversationStore((s) => s.setReplyingTo);

    // replying and reacting follow the same rules as sending
    const canInteract = useComposerLockedReason() === null;

    const [pickerOpen, setPickerOpen] = useState(false);
    const closePicker = useCallback(() => setPickerOpen(false), []);
    const reactButtonRef = useRef<HTMLButtonElement>(null);

    const myReaction = message.reactions.find((r) => r.userId === myId)?.type ?? null;

    const { openModal } = useModal();

    // same reaction again = remove it, anything else = set/replace.
    // No optimistic update: the WS event (which we receive too) updates the store.
    function toggleReaction(type: ReactionType) {
        const request = type === myReaction
            ? apiRemoveReaction(message.conversationId, message.seq)
            : apiSetReaction(message.conversationId, message.seq, type);

        request.catch((err) => console.error("Reaction failed", err));
    }

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

                    <div className={cn("relative w-fit", isMine && "ml-auto")}>
                        <MessageBubble
                            variant={isMine ? "mine" : "theirs"}
                            quote={message.replyTo && <ReplyQuote replyTo={message.replyTo} />}
                        >
                            {message.content}
                        </MessageBubble>

                        {canInteract && (
                            <div
                                className={cn(
                                    "absolute top-1/2 flex -translate-y-1/2 gap-0.5 transition-opacity",
                                    // stay visible while the picker is open, or they'd fade as you move to it.
                                    // z-20 lifts the whole cluster (and the picker inside it) above later messages.
                                    pickerOpen
                                        ? "z-20 opacity-100"
                                        : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 touch:opacity-100",
                                    // outer side of the bubble: left of mine, right of theirs
                                    isMine ? "right-full mr-1 flex-row-reverse" : "left-full ml-1",
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo({
                                        seq: message.seq,
                                        senderName: message.senderName,
                                        content: message.content,
                                    })}
                                    aria-label={`Reply to ${message.senderName}`}
                                    // steps aside while the circle is open
                                    className={cn(
                                        actionButtonClass,
                                        "transition-[color,opacity]",
                                        pickerOpen && "pointer-events-none opacity-0",
                                    )}
                                >
                                    <Reply size={20} strokeWidth={2.4} />
                                </button>

                                {/* the circle is summoned around this button; it stays on top as the circle's eye */}
                                <div className="relative">
                                    <button
                                        ref={reactButtonRef}
                                        type="button"
                                        onClick={() => setPickerOpen((o) => !o)}
                                        aria-label="React"
                                        aria-expanded={pickerOpen}
                                        className={cn(actionButtonClass, "relative z-10", pickerOpen && "text-crimson-bright")}
                                    >
                                        <SmilePlus size={20} strokeWidth={2.4} />
                                    </button>

                                    {pickerOpen && (
                                        <ReactionPicker
                                            current={myReaction}
                                            onSelect={toggleReaction}
                                            onClose={closePicker}
                                            anchorRef={reactButtonRef}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <ReactionList
                        reactions={message.reactions}
                        myId={myId}
                        onToggle={toggleReaction}
                        disabled={!canInteract}
                        onShowAll={() => openModal(<ReactionsModal conversationId={message.conversationId} seq={message.seq} />)}
                        align={isMine ? "end" : "start"}
                        className={isMine ? "justify-end" : undefined}
                    />

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