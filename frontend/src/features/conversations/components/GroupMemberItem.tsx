import { Crown, MessageSquare, ShieldOff, UserMinus, UserPlus } from "lucide-react";
import type { UserInfo } from "../../../shared/types";
import { useModal } from "../../../components/ModalProvider";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import { useContactsStore } from "../../userRelations/contactsStore";
import { selectGroupCreator, useActiveConversationStore } from "../activeConversationStore";
import { useAuthStore } from "../../auth/authStore";

type GroupMemberItemProps = {
    member: UserInfo;
};

export default function GroupMemberItem({ member }: GroupMemberItemProps) {
    const { closeModal } = useModal();

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
        <div
            className="
                group relative
                flex min-w-0 flex-col
                border-2 border-[#4b1b1f]
                bg-[#0c0506]
                p-3
                shadow-[3px_3px_0_#48090e]
                transition
                hover:border-[#64141b]
                hover:bg-[#190b0d]
            "
        >
            {/* Identity */}
            <div className="flex min-w-0 items-center gap-2.5">
                {/* Avatar */}
                <div
                    className="
                        grid h-9 w-9 shrink-0 place-items-center
                        border-2 border-[#64141b]
                        bg-[#190b0d]
                        text-xs font-black
                        text-[#e02632]
                        shadow-[2px_2px_0_#48090e]
                        transition
                        group-hover:border-[#e02632]
                    "
                >
                    {member.username.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-[#eee2d5]">
                            {member.username}
                        </p>

                        {isMe && (
                            <span className="shrink-0 text-[8px] font-bold tracking-[0.12em] text-[#a71924]">
                                // YOU
                            </span>
                        )}
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                        {isCreator ? (
                            <span
                                className="
                                    flex min-w-0 items-center gap-1
                                    text-[8px] font-bold
                                    tracking-[0.12em]
                                    text-[#b47b32]
                                "
                            >
                                <Crown
                                    size={9}
                                    strokeWidth={2.4}
                                    className="shrink-0"
                                />
                                ORIGINATOR
                            </span>
                        ) : (
                            <span
                                className="
                                    text-[8px]
                                    tracking-[0.12em]
                                    text-[#665054]
                                "
                            >
                                MEMBER
                            </span>
                        )}

                        {!isMe && isContact && (
                            <>
                                <span className="text-[#4b1b1f]">/</span>

                                <span
                                    className="
                                        truncate
                                        text-[8px] font-bold
                                        tracking-widest
                                        text-[#9f8581]
                                    "
                                >
                                    CONTACT
                                </span>
                            </>
                        )}

                        {!isMe && isBlocked && (
                            <>
                                <span className="text-[#4b1b1f]">/</span>

                                <span
                                    className="
                                        truncate
                                        text-[8px] font-bold
                                        tracking-widest
                                        text-[#e02632]
                                    "
                                >
                                    BLOCKED
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!isMe && (
                <div
                    className="
                        mt-3 flex items-center gap-1.5
                        border-t border-[#321316]
                        pt-2.5
                    "
                >
                    {isBlocked ? (
                        <button
                            type="button"
                            disabled={isBlockPending}
                            onClick={() => unblockUser(member.userId)}
                            title="Unblock user"
                            aria-label={`Unblock ${member.username}`}
                            className="
                                flex h-7 flex-1 items-center
                                justify-center gap-1.5
                                border border-[#4b1b1f]
                                bg-[#0c0506]
                                px-2
                                text-[8px] font-bold
                                tracking-widest
                                text-[#9f8581]
                                transition
                                hover:border-[#e02632]
                                hover:text-[#eee2d5]
                                disabled:pointer-events-none
                                disabled:opacity-40
                            "
                        >
                            <ShieldOff size={11} strokeWidth={2.4} />

                            {isBlockPending ? "RELEASING..." : "UNBLOCK"}
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleOpenDirectConversation}
                                title={`Message ${member.username}`}
                                aria-label={`Message ${member.username}`}
                                className="
                                    grid h-7 w-7 shrink-0 place-items-center
                                    border border-[#4b1b1f]
                                    bg-[#0c0506]
                                    text-[#9f8581]
                                    transition
                                    hover:border-[#e02632]
                                    hover:bg-[#190b0d]
                                    hover:text-[#eee2d5]
                                "
                            >
                                <MessageSquare
                                    size={11}
                                    strokeWidth={2.4}
                                />
                            </button>

                            {!isContact && (
                                <button
                                    type="button"
                                    disabled={isAdding}
                                    onClick={() =>
                                        addContact(member.userId)
                                    }
                                    title="Add contact"
                                    aria-label={`Add ${member.username} as contact`}
                                    className="
                                        flex h-7 min-w-0 flex-1
                                        items-center justify-center gap-1.5
                                        border border-[#4b1b1f]
                                        bg-[#0c0506]
                                        px-2
                                        text-[8px] font-bold
                                        tracking-widest
                                        text-[#9f8581]
                                        transition
                                        hover:border-[#e02632]
                                        hover:text-[#eee2d5]
                                        disabled:pointer-events-none
                                        disabled:opacity-40
                                    "
                                >
                                    <UserPlus
                                        size={11}
                                        strokeWidth={2.4}
                                        className="shrink-0"
                                    />

                                    <span className="truncate">
                                        {isAdding ? "ADDING..." : "ADD"}
                                    </span>
                                </button>
                            )}

                            {isContact && (
                                <div className="min-w-0 flex-1" />
                            )}
                        </>
                    )}

                    {canRemoveMember && (
                        <button
                            type="button"
                            aria-label={`Remove ${member.username} from group`}
                            title="Remove from group"
                            className="
                                grid h-7 w-7 shrink-0 place-items-center
                                border border-[#64141b]
                                bg-[#190b0d]
                                text-[#a71924]
                                transition
                                hover:border-[#e02632]
                                hover:bg-[#a71924]
                                hover:text-[#eee2d5]
                            "
                        >
                            <UserMinus
                                size={11}
                                strokeWidth={2.5}
                            />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}