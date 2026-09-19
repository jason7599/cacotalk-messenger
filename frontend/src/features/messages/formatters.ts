
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