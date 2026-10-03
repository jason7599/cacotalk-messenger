import { Users } from "lucide-react";
import type { ConversationSummary } from "../types";
import { useActiveConversationStore } from "../activeConversationStore";
import type { ChatMessage, EventMessage } from "../../messages/types";
import { useAuthStore } from "../../auth/authStore";
import { Avatar, cn } from "../../../components/ui";
import { formatUnreadCount, getUnreadCount } from "../conversationsStore";

type ConversationListItemProps = {
    conversation: ConversationSummary;
};

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
    const myId = useAuthStore((s) => s.user!.userId);

    const setActiveConversation = useActiveConversationStore((s) => s.setActiveConversation);
    const isActive = useActiveConversationStore((s) => s.conversation?.id === conversation.id);
    const isLoading = useActiveConversationStore((s) => s.status === "LOADING" && s.loadingConversationId === conversation.id);

    const displayName = getDisplayName(conversation);
    const lastMessagePreview = getMessagePreview(conversation.lastMessage);
    const timestamp = formatMessageTimestamp(conversation.lastMessage?.createdAt ?? conversation.createdAt);

    const unreadCount = getUnreadCount(conversation);

    const highlighted = isActive || isLoading;

    const rowStyle = isLoading
        ? "border-crimson-bright bg-crimson-deep animate-pulse"
        : isActive
            ? "border-crimson bg-raised"
            : "border-edge bg-panel hover:bg-panel-hover"
    ;

    let lastMessageSenderName: string | null = null;
    if (conversation.lastMessage?.type === "USER") {
        if (conversation.lastMessage.senderId === myId) {
            lastMessageSenderName = "YOU";
        } else {
            lastMessageSenderName = conversation.lastMessage.senderName;
        }
    }

    return (
        <button
            type="button"
            onClick={() => setActiveConversation(conversation.id)}
            aria-pressed={isActive}
            className={cn("relative flex w-full items-center gap-3 border-b p-3 text-left transition-colors", rowStyle)}
        >
            {isActive && (
                <span aria-hidden="true" className="absolute left-0 top-0 h-full w-1 bg-crimson-bright" />
            )}

            <Avatar
                name={displayName}
                icon={conversation.type === "GROUP" ? <Users size={18} strokeWidth={2.4} aria-hidden="true" /> : undefined}
                tone={highlighted ? "active" : "muted"}
            />

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className={cn("truncate text-sm font-bold", highlighted ? "text-bone" : "text-ash")}>
                        {displayName}
                    </p>

                    {conversation.type === "GROUP" && (
                        <span className="shrink-0 text-3xs tracking-label text-faint">
                            // {conversation.memberCount}
                        </span>
                    )}
                </div>

                <div className={cn("mt-1 flex min-w-0 items-center text-xs", highlighted ? "text-muted" : "text-faint")}>
                    {lastMessageSenderName && (
                        <span className="mr-1 max-w-24 shrink-0 truncate font-bold text-muted">
                            {lastMessageSenderName}:
                        </span>
                    )}
                    <span className="truncate">{lastMessagePreview}</span>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
                {unreadCount > 0 && (
                    <span
                        aria-label={`${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`}
                        className="min-w-5 border border-crimson bg-raised px-1.5 text-center text-3xs font-black leading-4 text-crimson-bright shadow-hard-xs"
                    >
                        {formatUnreadCount(unreadCount)}
                    </span>
                )}

                <span className={cn("text-3xs tracking-widest", highlighted ? "text-crimson" : "text-faint")}>
                    {timestamp}
                </span>
            </div>
        </button>
    );
}

function getMessagePreview(message: ChatMessage | null) {
    if (!message) {
        return "NO TRANSMISSIONS YET";
    }

    return message.type === "USER" ? message.content : getEventMessagePreview(message);
}

function getEventMessagePreview(message: EventMessage) {
    switch (message.event.type) {
        case "GROUP_CREATED":
            return "GROUP CHANNEL ESTABLISHED";

        case "MEMBERS_INVITED":
            return "NEW BLOOD HAS ENTERED THE CHANNEL";

        case "MEMBER_LEFT":
            return "A SOUL LEFT THE CHANNEL";

        case "MEMBER_REMOVED":
            return "A SOUL WAS REMOVED";

        case "GROUP_CLOSED":
            return "CHANNEL CLOSED";
    }
}

function formatMessageTimestamp(timestamp: string) {
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
            hour12: false,
        });
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });
}

function getDisplayName(conversation: ConversationSummary) {
    if (conversation.membersPreview.length === 0) {
        return "EMPTY CHANNEL";
    }

    return conversation.membersPreview.map((m) => m.username).join(", ");
}