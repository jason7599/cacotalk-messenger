import { Ban, Lock, Users, } from "lucide-react";
import type { ConversationSummary } from "../types";
import { useActiveConversationStore } from "../activeConversationStore";
import { formatMessageTimestamp, getMessagePreview } from "../../messages/formats";

type ConversationListItemProps = {
    conversation: ConversationSummary;
};

function getDisplayName(conversation: ConversationSummary) {
    if (conversation.membersPreview.length === 0) {
        return conversation.type === "GROUP"
            ? "EMPTY CHANNEL"
            : "UNKNOWN SOUL"
            ;
    }

    return conversation.membersPreview.join(", ");
}

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
    const setActiveConversation = useActiveConversationStore((s) => s.setActiveConversation);

    const displayName = getDisplayName(conversation);
    const lastMessagePreview = getMessagePreview(conversation.lastMessage);
    const timestamp = formatMessageTimestamp(conversation.lastMessage?.createdAt ?? conversation.createdAt);

    const unreadCount = conversation.lastSeq - conversation.lastReadSeq;
    const hasUnread = unreadCount > 0;

    const isBlocked =
        conversation.type === "DIRECT" &&
        conversation.blockStatus !== "NONE"
        ;

    const isClosed =
        conversation.type === "GROUP" &&
        conversation.isClosed
        ;

    return (
        <button
            type="button"
            onClick={() => setActiveConversation(conversation.id)}
            className={`
            group flex w-full items-center gap-3
            border-b
            px-3 py-3
            text-left
            transition-colors
            ${hasUnread
                    ? "border-[#64141b] bg-[#220c0f] hover:bg-[#2d0f13]"
                    : "border-[#4b1b1f] bg-[#190b0d] hover:bg-[#240d10]"
                }
        `}
        >
            <div
                className={`
                grid h-11 w-11 shrink-0 place-items-center
                border-2
                bg-[#100708]
                shadow-[2px_2px_0_#48090e]
                ${hasUnread
                        ? "border-[#8f1d25] text-[#c94a52]"
                        : "border-[#4b1b1f] text-[#7f6668]"
                    }
            `}
            >
                {conversation.type === "DIRECT" ? (
                    <span className="text-sm font-black">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                ) : (
                    <Users size={18} strokeWidth={2.4} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p
                        className={`
                        truncate text-sm font-bold
                        ${hasUnread
                                ? "text-[#eee2d5]"
                                : "text-[#cbb9b6]"
                            }
                    `}
                    >
                        {displayName}
                    </p>

                    {conversation.type === "GROUP" && (
                        <span
                            className="
                            shrink-0
                            text-[9px]
                            tracking-widest
                            text-[#7f6668]
                        "
                        >
                        // {conversation.memberCount}
                        </span>
                    )}

                    {isBlocked && (
                        <Ban
                            size={12}
                            strokeWidth={2.4}
                            className="shrink-0 text-[#8f343b]"
                        />
                    )}

                    {isClosed && (
                        <Lock
                            size={12}
                            strokeWidth={2.4}
                            className="shrink-0 text-[#7f6668]"
                        />
                    )}
                </div>

                <div
                    className={`
                    mt-1 flex min-w-0 items-center text-xs
                    ${hasUnread
                            ? "text-[#bfa6a3]"
                            : "text-[#7f6668]"
                        }
                `}
                >
                    {conversation.type === "GROUP" &&
                        conversation.lastMessage?.type === "USER" && (
                            <span
                                className="
                                mr-1 max-w-24 shrink-0 truncate
                                font-medium
                                text-[#9d7779]
                            "
                            >
                                {conversation.lastMessage.senderName}:
                            </span>
                        )}

                    <span className="truncate">
                        {lastMessagePreview}
                    </span>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
                {unreadCount > 0 && (
                    <span
                        className="
                        min-w-5
                        border border-[#a71924]
                        bg-[#2b0e12]
                        px-1.5
                        text-center
                        text-[9px]
                        font-black
                        leading-4
                        text-[#e02632]
                        shadow-[1px_1px_0_#48090e]
                    "
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}

                <span
                    className={`
                    text-[9px]
                    tracking-[0.08em]
                    ${hasUnread
                            ? "text-[#9f6267]"
                            : "text-[#6f595b]"
                        }
                `}
                >
                    {timestamp}
                </span>
            </div>
        </button>
    );
}