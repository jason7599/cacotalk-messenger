import type { EventData } from "./types";

export function formatMessageTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    ;

    if (isToday) {
        return `TODAY // ${time}`;
    }

    const isYesterday = (() => {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        return (
            date.getFullYear() === yesterday.getFullYear() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getDate() === yesterday.getDate()
        );
    })();

    if (isYesterday) {
        return `YESTERDAY // ${time}`;
    }

    const sameYear = date.getFullYear() === now.getFullYear();

    const day = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        ...(sameYear ? {} : { year: "numeric" }),
    });

    return `${day.toUpperCase()} // ${time}`;
}

/** One-line summary of an event message. Used by the conversation list preview and notifications. */
export function getEventMessagePreview(event: EventData) {
    switch (event.type) {
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
