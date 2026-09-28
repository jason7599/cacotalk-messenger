import { MessageSquare, Users } from "lucide-react";
import { useMemo } from "react";
import { useConversationsStore } from "../conversationsStore";
import ConversationListItem from "./ConversationListItem";
import { useModal } from "../../../components/ModalProvider";
import CreateGroupModal from "./CreateGroupModal";
import { Button, EmptyState, SidebarList } from "../../../components/ui";

export default function ConversationList() {
    const { openModal } = useModal();

    const conversationsById = useConversationsStore((s) => s.conversationsById);

    const conversations = useMemo(() => {
        return Object.values(conversationsById).sort((a, b) => {
            const aTime = a.lastMessage?.createdAt ?? a.createdAt;
            const bTime = b.lastMessage?.createdAt ?? b.createdAt;

            return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
    }, [conversationsById]);

    return (
        <SidebarList
            eyebrow="TRANSMISSIONS // LIVE"
            title="CONVERSATIONS"
            meta="UNIT 01"
            toolbar={
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal(<CreateGroupModal />)}
                    icon={<Users size={17} strokeWidth={2.4} />}
                    className="w-full"
                >
                    CREATE GROUP TRANSMISSION
                </Button>
            }
            footer="ACTIVE CHANNELS // LINK STABLE"
        >
            {conversations.length === 0 ? (
                <EmptyState
                    icon={<MessageSquare size={22} strokeWidth={2.2} />}
                    title="NO TRANSMISSIONS FOUND"
                    subtitle="THE CHANNELS REMAIN SILENT."
                />
            ) : (
                conversations.map((conversation) => (
                    <ConversationListItem
                        key={conversation.id}
                        conversation={conversation}
                    />
                ))
            )}
        </SidebarList>
    );
}
