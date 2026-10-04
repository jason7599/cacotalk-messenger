import { isAttending } from "../../shared/attention";
import { useAuthStore } from "../auth/authStore";
import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";
import { getConversationDisplayName } from "../conversations/displayName";
import { getEventMessagePreview } from "../messages/formatters";
import type { ChatMessage, EventMessage } from "../messages/types";
import { showDesktopNotification } from "./desktopNotifications";
import { useNotificationSettingsStore } from "./notificationSettingsStore";
import { playMessageSound } from "./sound";
import { useToastStore } from "./toastStore";

const BODY_MAX = 140;

/**
 * Decides how loudly to announce an incoming message. Read-only: never touches unread state.
 *
 *   looking at that very conversation    -> nothing
 *   looking at CacoTalk, other chat/list -> sound + in-app toast
 *   CacoTalk unfocused / hidden          -> sound + desktop notification (if enabled)
 *
 * Your own messages, and events you caused yourself (closing your own group etc.), are silent.
 */
export function notifyIncoming(message: ChatMessage) {
    const myId = useAuthStore.getState().user?.userId;
    if (myId === undefined) return;

    // The summary can be missing for a conversation we just got pulled into (it's fetched async).
    const summary = useConversationsStore.getState().conversationsById[message.conversationId];
    const groupName = summary?.type === "GROUP" ? getConversationDisplayName(summary) : null;

    if (message.type === "USER" ? message.senderId === myId : isOwnEvent(message, myId, summary?.type === "GROUP" ? summary.groupCreatorId : null)) {
        return;
    }

    const attending = isAttending();
    if (attending && useActiveConversationStore.getState().conversation?.id === message.conversationId) {
        return;
    }

    const { soundEnabled, desktopEnabled } = useNotificationSettingsStore.getState();
    if (soundEnabled) {
        playMessageSound();
    }

    // USER: sender + their text. EVENT: just the one-liner, e.g. "CHANNEL CLOSED".
    const title = message.type === "USER" ? message.senderName : getEventMessagePreview(message.event);
    const body = message.type === "USER" ? truncate(message.content) : undefined;
    const isGroup = groupName !== null || message.type === "EVENT"; // events only happen in groups

    if (attending) {
        useToastStore.getState().push({
            conversationId: message.conversationId,
            kind: message.type === "USER" ? "message" : "event",
            eyebrow: isGroup ? `GROUP // ${groupName ?? "NEW CHANNEL"}` : "DIRECT TRANSMISSION",
            title,
            body,
        });
    } else if (desktopEnabled) {
        showDesktopNotification({
            title: message.type === "USER"
                ? (groupName ? `${title} in ${groupName}` : title)
                : (groupName ?? "CacoTalk"),
            body: body ?? title,
            tag: message.conversationId,
            onClick: () => useActiveConversationStore.getState().setActiveConversation(message.conversationId),
        });
    }
}

/**
 * Event messages have no sender, so "did I cause this?" comes from the group rules:
 * creating, inviting, removing and closing are creator-only; leaving is done by the subject.
 */
function isOwnEvent(message: EventMessage, myId: number, creatorId: number | null) {
    const event = message.event;

    switch (event.type) {
        case "GROUP_CREATED":
            // the creator isn't listed in initMembers
            return !event.initMembers.some((m) => m.userId === myId);
        case "MEMBER_LEFT":
            return event.subject.userId === myId;
        default:
            return creatorId === myId;
    }
}

function truncate(text: string) {
    return text.length > BODY_MAX ? `${text.slice(0, BODY_MAX)}…` : text;
}
