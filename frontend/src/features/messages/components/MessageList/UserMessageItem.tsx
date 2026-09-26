import { useAuthStore } from "../../../auth/authStore";
import { formatMessageTimestamp } from "../../formatters";
import type { UserMessage } from "../../types";

type UserMessageItemProps = {
    message: UserMessage;
};

export default function UserMessageItem({ message }: UserMessageItemProps) {
    const myId = useAuthStore((s) => s.user!.userId);
    const isMine = message.senderId === myId;

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