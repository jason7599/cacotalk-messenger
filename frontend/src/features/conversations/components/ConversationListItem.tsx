import { Ban, Lock, Users, } from "lucide-react";
import type { ConversationSummary } from "../types";
import type { EventMessage } from "../../messages/types";
import { useActiveConversationStore } from "../activeConversationStore";

type ConversationListItemProps = {
    conversation: ConversationSummary;
};

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
    const setActiveConversation = useActiveConversationStore((s) => s.setActiveConversation);

    const displayName = getDisplayName(conversation);
    const lastMessagePreview = getLastMessagePreview(conversation.lastMessage);
    const timestamp = getTimestamp(conversation.lastMessage?.createdAt ?? conversation.createdAt);

    const hasUnread =
        conversation.lastMessage !== null &&
        conversation.lastMessage.id !== conversation.lastReadMessageId
    ;

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
            className="
                group flex w-full items-center gap-3
                border-b border-[#4b1b1f]
                bg-[#190b0d]
                px-3 py-3
                text-left
                hover:bg-[#240d10]
            "
        >
            <div
                className={`
                    grid h-11 w-11 shrink-0 place-items-center
                    border-2
                    bg-[#100708]
                    shadow-[2px_2px_0_#48090e]
                    ${hasUnread
                        ? "border-[#a71924] text-[#e02632]"
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
                            truncate text-sm
                            ${hasUnread
                                ? "font-black text-[#eee2d5]"
                                : "font-bold text-[#cbb9b6]"
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

                <p
                    className={`
                        mt-1 truncate text-xs
                        ${hasUnread
                            ? "font-medium text-[#bfa6a3]"
                            : "text-[#7f6668]"
                        }
                    `}
                >
                    {lastMessagePreview}
                </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                    className={`
                        text-[9px]
                        tracking-[0.08em]
                        ${hasUnread
                            ? "text-[#a71924]"
                            : "text-[#6f595b]"
                        }
                    `}
                >
                    {timestamp}
                </span>

                {hasUnread && (
                    <span
                        className="
                            h-2.5 w-2.5
                            border border-[#e02632]
                            bg-[#a71924]
                            shadow-[1px_1px_0_#48090e]
                        "
                    />
                )}
            </div>
        </button>
    );
}

function getDisplayName(conversation: ConversationSummary) {
    if (conversation.membersPreview.length === 0) {
        return conversation.type === "GROUP"
            ? "EMPTY CHANNEL"
            : "UNKNOWN SOUL";
    }

    return conversation.membersPreview.join(", ");
}

function getLastMessagePreview(
    message: ConversationSummary["lastMessage"]
) {
    if (!message) {
        return "NO TRANSMISSIONS YET";
    }

    if (message.type === "USER") {
        return message.content;
    }

    return getEventMessagePreview(message);
}

function getEventMessagePreview(message: EventMessage) {
    switch (message.eventType) {
        case "GROUP_CREATED":
            return "GROUP CHANNEL ESTABLISHED";

        case "USER_INVITED":
            return "A SOUL ENTERED THE CHANNEL";

        case "USER_LEFT":
            return "A SOUL LEFT THE CHANNEL";

        case "USER_REMOVED":
            return "A SOUL WAS REMOVED";

        case "GROUP_CLOSED":
            return "CHANNEL CLOSED";
    }
}

function getTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    if (isToday) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });
}