import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import UserMessageItem from "./UserMessageItem";

export default function MessageList() {
    const messages = useActiveConversationStore((s) => s.conversation!.messages);
    
    return (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-3">
                {messages.map((message) => {
                    const key = `${message.conversationId}:${message.seq}`;

                    return message.type === "USER" ? (
                        <UserMessageItem
                            key={key}
                            message={message}
                        />
                    ) : (
                        <>hi</>
                    );
                })}
            </div>
        </div>
    );
}