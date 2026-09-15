import type { ChatMessage, EventMessage } from "./types";

export function getMessagePreview(message: ChatMessage | null) {
    if (!message) {
        return "NO TRANSMISSIONS YET";
    }

    if (message.type === "USER") {
        return message.content;
    } else {
        return getEventMessagePreview(message);
    }
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

export function formatMessageTimestamp(timestamp: string) {
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