import { Ban, LogOut, ShieldAlert, UserPlus } from "lucide-react";
import LeaveConversationModal from "./LeaveConversationModal";
import type { ConversationMeta } from "../types";
import { useContactsStore } from "../../userRelations/contactsStore";
import { useModal } from "../../../components/ModalProvider";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import type { UserInfo } from "../../../shared/types";

// I could just read these from the zustand stores, but would be pointless to recompute things that are already in ConversationHeader
type ConversationWarningProps = {
    meta: ConversationMeta;
    subjectUser: UserInfo;
    isSubjectUserBlocked: boolean;
    isAddingContact: boolean;
    isBlockStatePending: boolean;
};

export default function ConversationWarning({
    meta, 
    subjectUser,
    isSubjectUserBlocked,
    isAddingContact,
    isBlockStatePending
}: ConversationWarningProps) {
    
    const { openModal } = useModal();

    const addContact = useContactsStore((s) => s.addContact);
    const blockUser = useBlockedUsersStore((s) => s.blockUser);
    const unblockUser = useBlockedUsersStore((s) => s.unblockUser);

    return (
        <div
            className="
                flex flex-wrap items-stretch
                border-t-2 border-[#4b1b1f]
                bg-[#16090a]
            "
        >
            <div
                className="
                    flex min-w-0 flex-1 items-center gap-3
                    px-5 py-3
                "
            >
                <div
                    className="
                        grid h-8 w-8 shrink-0 place-items-center
                        border border-[#71401d]
                        bg-[#211308]
                        text-[#d88928]
                    "
                >
                    <ShieldAlert size={15} strokeWidth={2.4} />
                </div>

                <div className="min-w-0">
                    <p
                        className="
                            text-[8px] font-bold
                            tracking-[0.22em]
                            text-[#7f5954]
                        "
                    >
                        WARNING
                    </p>
                    <p
                        className="
                            mt-0.5 text-[10px]
                            tracking-[0.12em]
                            text-[#c7a7a0]
                        "
                    >
                        {meta.type === "DIRECT"
                            ? "UNRECOGNIZED SOUL // NOT IN CONTACTS"
                            : isSubjectUserBlocked
                                ? "GROUP ORIGIN FLAGGED // CREATOR BLOCKED"
                                : "UNKNOWN ORIGIN // CREATOR NOT IN CONTACTS"
                        }
                    </p>
                </div>
            </div>

            <div
                className="
                    flex shrink-0 items-stretch
                    border-l border-[#4b1b1f]
                "
            >
                {!isSubjectUserBlocked && (
                    <button
                        type="button"
                        disabled={isAddingContact}
                        onClick={() => addContact(subjectUser.userId)}
                        className="
                            group flex min-w-35 items-center justify-center gap-2
                            border-r border-[#4b1b1f]
                            bg-[#13090a]
                            px-4 py-3
                            text-[9px] font-black tracking-[0.16em]
                            text-[#aa918b]
                            transition
                            hover:bg-[#211012]
                            hover:text-[#eee2d5]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <UserPlus
                            size={13}
                            strokeWidth={2.5}
                            className="text-[#8d5558] group-hover:text-[#d28b91]"
                        />

                        {isAddingContact
                            ? "LINKING..."
                            : "ACCEPT SOUL"}
                    </button>
                )}

                {meta.type === "DIRECT" ? (
                    <button
                        type="button"
                        disabled={isBlockStatePending}
                        onClick={() => blockUser(subjectUser.userId)}
                        className="
                            group flex min-w-31 items-center justify-center gap-2
                            bg-[#1d090b]
                            px-4 py-3
                            text-[9px] font-black tracking-[0.16em]
                            text-[#a71924]
                            transition
                            hover:bg-[#310c10]
                            hover:text-[#f13a45]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <Ban
                            size={13}
                            strokeWidth={2.6}
                            className="
                                transition-transform
                                group-hover:-rotate-12
                            "
                        />

                        BLOCK
                    </button>
                ) : (
                    <>
                        {isSubjectUserBlocked && (
                            <button
                                type="button"
                                disabled={isBlockStatePending}
                                onClick={() => unblockUser(subjectUser.userId)}
                                className="
                                    group flex min-w-35 items-center justify-center gap-2
                                    border-r border-[#4b1b1f]
                                    bg-[#13090a]
                                    px-4 py-3
                                    text-[9px] font-black tracking-[0.16em]
                                    text-[#8f7370]
                                    transition
                                    hover:bg-[#211012]
                                    hover:text-[#d8b3ad]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <span
                                    className="
                                        h-1.5 w-1.5
                                        bg-[#64141b]
                                        transition
                                        group-hover:bg-[#d12c37]
                                    "
                                />

                                {isBlockStatePending
                                    ? "UNBLOCKING..."
                                    : "UNBLOCK"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => openModal(
                                <LeaveConversationModal groupCreator={subjectUser}/>)
                            }
                            className="
                                group flex min-w-31 items-center justify-center gap-2
                                bg-[#1d090b]
                                px-4 py-3
                                text-[9px] font-black tracking-[0.16em]
                                text-[#a71924]
                                transition
                                hover:bg-[#310c10]
                                hover:text-[#f13a45]
                            "
                        >
                            <LogOut
                                size={13}
                                strokeWidth={2.6}
                                className="
                                    transition-transform
                                    group-hover:translate-x-0.5
                                "
                            />

                            ABANDON
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}