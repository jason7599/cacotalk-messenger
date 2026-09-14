import { MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { useConversationsStore } from "../conversationsStore";
import ConversationListItem from "./ConversationListItem";

export default function ConversationList() {
    const conversationsById = useConversationsStore((s) => s.conversationsById);

    const conversations = useMemo(() => {
        return Object.values(conversationsById).sort((a, b) => {
            const aTime = a.lastMessage?.createdAt ?? a.createdAt;
            const bTime = b.lastMessage?.createdAt ?? b.createdAt;

            return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
    }, [conversationsById]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <header
                className="
                    border-b-2 border-[#4b1b1f]
                    bg-[#100708]
                    px-5 py-4
                "
            >
                <p className="mb-1 text-[10px] tracking-[0.22em] text-[#a71924]">
                    TRANSMISSIONS // LIVE
                </p>

                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl font-black tracking-[-0.02em]">
                        CONVERSATIONS
                    </h2>

                    <span className="text-[9px] tracking-[0.16em] text-[#7f6668]">
                        UNIT 01
                    </span>
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
                        <div
                            className="
                                mb-3 grid h-12 w-12 place-items-center
                                border-2 border-[#64141b]
                                bg-[#100708]
                                text-[#a71924]
                                shadow-[3px_3px_0_#48090e]
                            "
                        >
                            <MessageSquare
                                size={22}
                                strokeWidth={2.2}
                            />
                        </div>

                        <p className="text-xs font-bold tracking-[0.12em] text-[#9f8581]">
                            NO TRANSMISSIONS FOUND
                        </p>

                        <p className="mt-1 text-[10px] text-[#7f6668]">
                            THE CHANNELS REMAIN SILENT.
                        </p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <ConversationListItem
                            key={conversation.id}
                            conversation={conversation}
                        />
                    ))
                )}
            </div>

            <footer
                className="
                    border-t border-[#4b1b1f]
                    bg-[#100708]
                    px-4 py-2
                    text-[9px]
                    tracking-[0.16em]
                    text-[#7f6668]
                "
            >
                ACTIVE CHANNELS // LINK STABLE
            </footer>
        </div>
    );
}