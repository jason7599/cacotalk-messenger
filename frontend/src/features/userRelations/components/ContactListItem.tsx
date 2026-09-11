import { MessageSquare, MoreVertical } from "lucide-react";
import type { UserResponse } from "../../../shared/types";
import { useModal } from "../../../components/ModalProvider";
import ContactActionsModal from "./ContactActionsModal";

type ContactListItemProps = {
    contact: UserResponse;
};

export default function ContactListItem({ contact }: ContactListItemProps) {
    const { openModal } = useModal();

    return (
        <div
            className="
                group flex items-center gap-3
                border-b border-[#4b1b1f]
                bg-[#190b0d]
                px-3 py-3
                hover:bg-[#240d10]
            "
        >
            <div
                className="
                    grid h-10 w-10 shrink-0 place-items-center
                    border-2 border-[#64141b]
                    bg-[#100708]
                    text-sm font-black
                    text-[#e02632]
                    shadow-[2px_2px_0_#48090e]
                "
            >
                {contact.username.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-[#eee2d5]">
                        {contact.username}
                    </p>
                </div>

                <p className="mt-1 text-[10px] tracking-[0.12em] text-[#7f6668]">
                    CONTACT // REGISTERED
                </p>
            </div>

            <div
                className="
                    flex shrink-0 gap-2
                    opacity-0
                    group-hover:opacity-100
                "
            >
                <button
                    type="button"
                    // TODO: dm 
                    aria-label={`Message ${contact.username}`}
                    className="
                        grid h-8 w-8 place-items-center
                        border border-[#64141b]
                        bg-[#100708]
                        text-[#a71924]
                        hover:border-[#e02632]
                        hover:bg-[#a71924]
                        hover:text-[#eee2d5]
                    "
                >
                    <MessageSquare size={15} strokeWidth={2.3} />
                </button>

                <button
                    type="button"
                    onClick={() => openModal(<ContactActionsModal contact={contact} />)}
                    aria-label={`More actions for ${contact.username}`}
                    className="
                        grid h-8 w-8 place-items-center
                        border border-[#4b1b1f]
                        bg-[#100708]
                        text-[#7f6668]
                        hover:border-[#a71924]
                        hover:text-[#e02632]
                    "
                >
                    <MoreVertical size={15} strokeWidth={2.3} />
                </button>
            </div>
        </div>
    );
}