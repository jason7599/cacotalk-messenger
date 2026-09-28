import { MessageSquare, MoreVertical } from "lucide-react";
import type { UserInfo } from "../../../shared/types";
import { useModal } from "../../../components/ModalProvider";
import ContactActionsModal from "./ContactActionsModal";
import { useActiveConversationStore } from "../../conversations/activeConversationStore";
import { Avatar, IconButton } from "../../../components/ui";

type ContactListItemProps = {
    contact: UserInfo;
};

export default function ContactListItem({ contact }: ContactListItemProps) {
    const { openModal } = useModal();
    const openDirectConversation = useActiveConversationStore((s) => s.openDirectConversation);

    return (
        <div className="group flex items-center gap-3 border-b border-edge bg-panel p-3 hover:bg-panel-hover">
            <Avatar name={contact.username} />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{contact.username}</p>

                <p className="mt-1 text-2xs tracking-label text-faint">CONTACT // REGISTERED</p>
            </div>

            <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                <IconButton
                    variant="accent"
                    size="md"
                    onClick={() => openDirectConversation(contact.userId)}
                    aria-label={`Message ${contact.username}`}
                >
                    <MessageSquare size={15} strokeWidth={2.3} />
                </IconButton>

                <IconButton
                    size="md"
                    onClick={() => openModal(<ContactActionsModal contact={contact} />)}
                    aria-label={`More actions for ${contact.username}`}
                >
                    <MoreVertical size={15} strokeWidth={2.3} />
                </IconButton>
            </div>
        </div>
    );
}
