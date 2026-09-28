import { Ban, Lock, X, Users } from "lucide-react";
import { useActiveConversationStore } from "../activeConversationStore";
import { useContactsStore } from "../../userRelations/contactsStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import ConversationWarning from "./ConversationWarning";
import { useModal } from "../../../components/ModalProvider";
import GroupMembersModal from "./GroupMembersModal";
import { useAuthStore } from "../../auth/authStore";
import { Avatar, IconButton } from "../../../components/ui";

export default function ConversationHeader() {
    const me = useAuthStore((s) => s.user!);
    const { openModal } = useModal();

    const conversation = useActiveConversationStore((s) => s.conversation)!;
    const clearActiveConversation = useActiveConversationStore((s) => s.clearActiveConversation);

    const { otherMembers, meta } = conversation;

    const createdByMe = meta.type === "GROUP" && meta.groupCreator.userId === me.userId;

    const subjectUser = meta.type === "DIRECT"
        ? otherMembers[0]!
        : meta.groupCreator
    ;

    // IF ws connection drops and reconnects mid session, or anything causes the store to be out of sync,
    // these data will be stale. But I'd say it's acceptable for now. Let's just be smart with reconnection later
    const isSubjectUserInContacts = useContactsStore((s) => !createdByMe && !!s.contactsById[subjectUser.userId]);
    const isSubjectUserBlocked = useBlockedUsersStore((s) => !!s.blockedUsersById[subjectUser.userId]);

    const isAddingContact = useContactsStore((s) => s.addingIds.has(subjectUser.userId));

    const unblockUser = useBlockedUsersStore((s) => s.unblockUser);
    const isBlockStatePending = useBlockedUsersStore((s) => s.pendingIds.has(subjectUser.userId));

    // Show warning when:
    // Direct: the other person is not in contacts and NOT blocked by me
    // Group: I'm not the creator, and the creator is either not in my contacts or is blocked
    const showWarning =
        (meta.type === "DIRECT" && (!meta.blockedMe && !isSubjectUserInContacts && !isSubjectUserBlocked))
        || (meta.type === "GROUP" && !createdByMe && (!isSubjectUserInContacts || isSubjectUserBlocked))
    ;

    function getGroupDisplayTitle() {
        const names = otherMembers.map(({ username }) =>
            username.length > 16
                ? `${username.slice(0, 13)}...`
                : username
        );

        if (names.length === 0) {
            return "EMPTY CHANNEL";
        }

        if (names.length <= 3) {
            return names.join(", ");
        }

        return `${names.slice(0, 3).join(", ")} +${names.length - 3}`;
    }

    const displayTitle = meta.type === "DIRECT" 
        ? otherMembers[0]!.username 
        : getGroupDisplayTitle()
    ;

    return (
        <header className="flex shrink-0 flex-col border-b-2 border-edge bg-sunken">
            <div className="flex items-center gap-4 px-5 py-10 short:py-4">
                <Avatar
                    name={displayTitle}
                    icon={meta.type === "GROUP" ? <Users size={22} strokeWidth={2.3} /> : undefined}
                    size="lg"
                />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black">{displayTitle}</p>

                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-3xs tracking-caps">
                        {meta.type === "GROUP" ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openModal(<GroupMembersModal/>)}
                                    className="flex items-center gap-1 text-crimson transition-colors hover:text-crimson-bright hover:underline hover:decoration-dotted hover:underline-offset-3"
                                >
                                    <Users size={11} strokeWidth={2.3} />
                                    GROUP // {otherMembers.length + 1} SOULS
                                </button>

                                <Slash />

                                <span className="min-w-0 text-muted">
                                    CREATED BY:{" "}
                                    <span className="font-bold text-ash">{meta.groupCreator.username}</span>
                                </span>

                                <Slash />

                                <span className="flex items-center gap-1 text-faint">
                                    {meta.isClosed && <Lock size={10} strokeWidth={2.3} />}
                                    {meta.isClosed ? "CHANNEL SEALED" : "CHANNEL OPEN"}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-crimson">DIRECT TRANSMISSION</span>

                                {(meta.blockedMe || isSubjectUserBlocked) && (
                                    <>
                                        <Slash />

                                        <span className="flex items-center gap-1 text-crimson">
                                            <Ban size={10} strokeWidth={2.3} />
                                            {meta.blockedMe ? "LINK RESTRICTED" : "SOUL BLOCKED"}
                                        </span>

                                        {isSubjectUserBlocked && (
                                            <>
                                                <Slash />
                                                <button
                                                    type="button"
                                                    disabled={isBlockStatePending}
                                                    onClick={() => unblockUser(subjectUser.userId)}
                                                    className="font-bold text-faint underline decoration-dotted transition-colors hover:text-bone disabled:opacity-50"
                                                >
                                                    {isBlockStatePending ? "UNBLOCKING..." : "UNBLOCK?"}
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-5">
                    {meta.type === "GROUP" && (
                        <IconButton
                            size="xl"
                            aria-label="View members"
                            onClick={() => openModal(<GroupMembersModal/>)}
                        >
                            <Users size={18} strokeWidth={2.5} />
                        </IconButton>
                    )}

                    <IconButton
                        variant="accent"
                        size="xl"
                        aria-label="Close conversation"
                        onClick={clearActiveConversation}
                    >
                        <X size={18} strokeWidth={2.8} />
                    </IconButton>
                </div>
            </div>

            {showWarning && (
                <ConversationWarning
                    meta={meta}
                    subjectUser={subjectUser}
                    isSubjectUserBlocked={isSubjectUserBlocked}
                    isAddingContact={isAddingContact}
                    isBlockStatePending={isBlockStatePending}
                />
            )}
        </header>
    );
}

function Slash() {
    return <span className="text-edge">//</span>;
}
