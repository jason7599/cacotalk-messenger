import { Ban, LogOut, ShieldAlert, ShieldOff, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import LeaveConversationModal from "./LeaveConversationModal";
import type { ConversationMeta } from "../types";
import { useContactsStore } from "../../userRelations/contactsStore";
import { useModal } from "../../../components/ModalProvider";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import type { UserInfo } from "../../../shared/types";
import { cn } from "../../../components/ui";

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
        <div className="flex flex-wrap items-stretch border-t-2 border-edge bg-pit">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 lg:px-5">
                <div className="grid h-8 w-8 shrink-0 place-items-center border border-warn-edge bg-warn-bg text-warn">
                    <ShieldAlert size={15} strokeWidth={2.4} />
                </div>

                <div className="min-w-0">
                    <p className="text-3xs font-bold tracking-loud text-faint">WARNING</p>
                    <p className="mt-0.5 text-2xs tracking-label text-ash">
                        {meta.type === "DIRECT"
                            ? "UNRECOGNIZED SOUL // NOT IN CONTACTS"
                            : isSubjectUserBlocked
                                ? "GROUP ORIGIN FLAGGED // CREATOR BLOCKED"
                                : "UNKNOWN ORIGIN // CREATOR NOT IN CONTACTS"
                        }
                    </p>
                </div>
            </div>

            <div className="flex w-full shrink-0 items-stretch divide-x divide-edge border-t border-edge lg:w-auto lg:border-l lg:border-t-0">
                {!isSubjectUserBlocked && (
                    <WarningAction
                        disabled={isAddingContact}
                        onClick={() => addContact(subjectUser.userId)}
                        icon={<UserPlus size={13} strokeWidth={2.5} />}
                    >
                        {isAddingContact ? "LINKING..." : "ACCEPT SOUL"}
                    </WarningAction>
                )}

                {meta.type === "DIRECT" ? (
                    <WarningAction
                        danger
                        disabled={isBlockStatePending}
                        onClick={() => blockUser(subjectUser.userId)}
                        icon={<Ban size={13} strokeWidth={2.6} className="transition-transform group-hover:-rotate-12" />}
                    >
                        BLOCK
                    </WarningAction>
                ) : (
                    <>
                        {isSubjectUserBlocked && (
                            <WarningAction
                                disabled={isBlockStatePending}
                                onClick={() => unblockUser(subjectUser.userId)}
                                icon={<ShieldOff size={13} strokeWidth={2.5} />}
                            >
                                {isBlockStatePending ? "UNBLOCKING..." : "UNBLOCK"}
                            </WarningAction>
                        )}

                        <WarningAction
                            danger
                            onClick={() => openModal(<LeaveConversationModal groupCreator={subjectUser}/>)}
                            icon={<LogOut size={13} strokeWidth={2.6} className="transition-transform group-hover:translate-x-0.5" />}
                        >
                            ABANDON
                        </WarningAction>
                    </>
                )}
            </div>
        </div>
    );
}

type WarningActionProps = {
    danger?: boolean;
    disabled?: boolean;
    onClick: () => void;
    icon: ReactNode;
    children: ReactNode;
};

function WarningAction({ danger = false, disabled, onClick, icon, children }: WarningActionProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "group flex min-w-32 flex-1 items-center justify-center gap-2 px-4 py-3 text-3xs font-black tracking-caps transition-colors lg:flex-initial",
                "disabled:pointer-events-none disabled:opacity-40",
                danger
                    ? "bg-sunken text-crimson hover:bg-raised hover:text-crimson-bright"
                    : "bg-pit text-muted hover:bg-panel-hover hover:text-bone",
            )}
        >
            {icon}
            {children}
        </button>
    );
}
