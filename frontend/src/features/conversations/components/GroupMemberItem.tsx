import { Crown, MessageSquare, ShieldOff, UserMinus, UserPlus } from "lucide-react";
import type { UserInfo } from "../../../shared/types";
import { useModal } from "../../../components/ModalProvider";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import { useContactsStore } from "../../userRelations/contactsStore";
import { selectGroupCreator, useActiveConversationStore } from "../activeConversationStore";
import { useAuthStore } from "../../auth/authStore";
import RemoveMemberModal from "./RemoveMemberModal";
import { Avatar, IconButton } from "../../../components/ui";

type GroupMemberItemProps = {
    member: UserInfo;
};

export default function GroupMemberItem({ member }: GroupMemberItemProps) {
    const { openModal, closeModal } = useModal();

    const me = useAuthStore((s) => s.user!);
    const isMe = member.userId === me.userId;

    const groupCreator = useActiveConversationStore(selectGroupCreator)!;
    const isCreator = member.userId === groupCreator.userId;

    const canRemoveMember = me.userId === groupCreator.userId;

    const isContact = useContactsStore((s) => !!s.contactsById[member.userId]);
    const isAdding = useContactsStore((s) => s.addingIds.has(member.userId));
    const isBlocked = useBlockedUsersStore((s) => !!s.blockedUsersById[member.userId]);
    const isBlockPending = useBlockedUsersStore((s) => s.pendingIds.has(member.userId));

    const addContact = useContactsStore((s) => s.addContact);
    const unblockUser = useBlockedUsersStore((s) => s.unblockUser);

    const openDirectConversation = useActiveConversationStore((s) => s.openDirectConversation);

    function handleOpenDirectConversation() {
        closeModal();
        openDirectConversation(member.userId);
    }

    return (
        <div className="group flex min-w-0 flex-col border-2 border-edge bg-pit p-3 shadow-hard-md transition-colors hover:border-edge-strong hover:bg-panel">
            {/* Identity */}
            <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={member.username} size="sm" className="group-hover:border-crimson-bright" />

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-sm font-bold">{member.username}</p>

                        {isMe && (
                            <span className="shrink-0 text-3xs font-bold tracking-label text-crimson">
                                // YOU
                            </span>
                        )}
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-3xs tracking-label">
                        {isCreator ? (
                            <span className="flex min-w-0 items-center gap-1 font-bold text-warn">
                                <Crown size={9} strokeWidth={2.4} className="shrink-0" />
                                ORIGINATOR
                            </span>
                        ) : (
                            <span className="text-faint">MEMBER</span>
                        )}

                        {!isMe && isContact && (
                            <>
                                <span className="text-edge">/</span>
                                <span className="truncate font-bold text-muted">CONTACT</span>
                            </>
                        )}

                        {!isMe && isBlocked && (
                            <>
                                <span className="text-edge">/</span>
                                <span className="truncate font-bold text-crimson-bright">BLOCKED</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!isMe && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-edge-soft pt-2.5">
                    {isBlocked ? (
                        <button
                            type="button"
                            disabled={isBlockPending}
                            onClick={() => unblockUser(member.userId)}
                            title="Unblock user"
                            aria-label={`Unblock ${member.username}`}
                            className={miniButton}
                        >
                            <ShieldOff size={11} strokeWidth={2.4} />
                            {isBlockPending ? "RELEASING..." : "UNBLOCK"}
                        </button>
                    ) : (
                        <>
                            <IconButton
                                size="sm"
                                onClick={handleOpenDirectConversation}
                                title={`Message ${member.username}`}
                                aria-label={`Message ${member.username}`}
                            >
                                <MessageSquare size={11} strokeWidth={2.4} />
                            </IconButton>

                            {isContact ? (
                                <div className="min-w-0 flex-1" />
                            ) : (
                                <button
                                    type="button"
                                    disabled={isAdding}
                                    onClick={() => addContact(member.userId)}
                                    title="Add contact"
                                    aria-label={`Add ${member.username} as contact`}
                                    className={miniButton}
                                >
                                    <UserPlus size={11} strokeWidth={2.4} className="shrink-0" />
                                    <span className="truncate">{isAdding ? "ADDING..." : "ADD"}</span>
                                </button>
                            )}
                        </>
                    )}

                    {canRemoveMember && (
                        <IconButton
                            variant="accent"
                            size="sm"
                            onClick={() => openModal(<RemoveMemberModal member={member} />)}
                            title="Remove from group"
                            aria-label={`Remove ${member.username} from group`}
                        >
                            <UserMinus size={11} strokeWidth={2.5} />
                        </IconButton>
                    )}
                </div>
            )}
        </div>
    );
}

/** Small full-width text button used in the member card's action row. */
const miniButton =
    "flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 border border-edge bg-pit px-2 text-3xs font-bold tracking-label text-muted transition-colors hover:border-crimson-bright hover:text-bone disabled:pointer-events-none disabled:opacity-40";
