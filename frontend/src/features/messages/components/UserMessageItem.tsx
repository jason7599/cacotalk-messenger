import { useAuth } from "../../auth/AuthProvider";
import type { UserMessage } from "../types";

type UserMessageItemProps = {
    message: UserMessage;
};

export default function UserMessageItem({ message }: UserMessageItemProps) {
    const meId = useAuth().user!.userId;
    const isMine = message.senderId === meId;

    return (
        <div
            className={`
                flex w-full
                ${isMine ? "justify-end" : "justify-start"}
            `}
        >
            <div className="max-w-[70%]">
                {!isMine && (
                    <p
                        className="
                            mb-1 ml-1
                            text-[9px] font-bold
                            tracking-[0.12em]
                            text-[#8f7376]
                        "
                    >
                        {message.senderName}
                    </p>
                )}

                <div
                    className={`
                        px-4 py-3
                        text-sm leading-relaxed
                        shadow-[3px_3px_0_#48090e]
                        ${isMine
                            ? `
                                    border-2 border-[#8f1d26]
                                    bg-[#5a171d]
                                    text-[#f1dfdc]
                                `
                            : `
                                    border-2 border-[#4b1b1f]
                                    bg-[#190b0d]
                                    text-[#d8c3bf]
                                `
                        }
                    `}
                >
                    <p className="whitespace-pre-wrap wrap-break-word">
                        {message.content}
                    </p>
                </div>

                <p
                    className={`
                        mt-1
                        text-[9px]
                        tracking-[0.08em]
                        text-[#5f4a4c]
                        ${isMine ? "mr-1 text-right" : "ml-1"}
                    `}
                >
                    {formatMessageTimestamp(message.createdAt)}
                </p>
            </div>
        </div>
    );
}

function formatMessageTimestamp(timestamp: string) {
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