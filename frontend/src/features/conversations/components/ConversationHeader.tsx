import { Ban, Lock, X, Users } from "lucide-react";
import { useActiveConversationStore } from "../activeConversationStore";
import { useAuth } from "../../auth/AuthProvider";
import { useContactsStore } from "../../userRelations/contactsStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import ConversationWarning from "./ConversationWarning";
import { useModal } from "../../../components/ModalProvider";
import GroupMembersModal from "./GroupMembersModal";

export default function ConversationHeader() {
    const myId = useAuth().user!.userId;
    const { openModal } = useModal();

    const conversation = useActiveConversationStore((s) => s.conversation)!;
    const clearActiveConversation = useActiveConversationStore((s) => s.clearActiveConversation);

    const { otherMembers, meta } = conversation;

    const createdByMe = meta.type === "GROUP" && meta.groupCreatorId === myId;

    const subjectUser = meta.type === "DIRECT"
        ? otherMembers[0]!
        : createdByMe ? { userId: myId, username: "YOU" } : otherMembers.find((m) => m.userId === meta.groupCreatorId)!
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

    let displayTitle: string;
    let creatorLabel: string | null = null;
    if (meta.type === "DIRECT") {
        displayTitle = otherMembers[0]!.username;
    } else {
        displayTitle = getGroupDisplayTitle();

        if (createdByMe) {
            creatorLabel = "YOU";
        } else {
            creatorLabel =
                otherMembers.find(
                    (member) => member.userId === meta.groupCreatorId
                )!.username
            ;
        }
    }

    return (
        <header
            className="
                flex shrink-0 flex-col
                border-b-2 border-[#4b1b1f]
                bg-[#100708]
            "
        >
            <div className="flex items-center gap-4 px-5 py-10">
                <div
                    className="
                        grid h-12 w-12 shrink-0 place-items-center
                        border-2 border-[#64141b]
                        bg-[#190b0d]
                        text-lg font-black
                        text-[#e02632]
                        shadow-[3px_3px_0_#48090e]
                    "
                >
                    {meta.type === "GROUP" ? (
                        <Users size={22} strokeWidth={2.3} />
                    ) : (
                        displayTitle.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-[#eee2d5]">
                        {displayTitle}
                    </p>

                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                        {meta.type === "GROUP" ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openModal(<GroupMembersModal groupCreator={subjectUser}/>)}
                                    className="
                                        flex items-center gap-1
                                        text-[9px]
                                        tracking-[0.16em]
                                        text-[#a71924]
                                        transition
                                        hover:text-[#e02632]
                                        hover:underline
                                        hover:decoration-dotted
                                        hover:underline-offset-3
                                    "
                                >
                                    <Users size={11} strokeWidth={2.3} />
                                    GROUP // {otherMembers.length + 1} SOULS
                                </button>

                                {creatorLabel && (
                                    <>
                                        <span className="text-[#4b1b1f]">//</span>

                                        <span
                                            className="
                                                min-w-0
                                                text-[9px]
                                                tracking-[0.16em]
                                                text-[#9f8581]
                                            "
                                        >
                                            CREATED BY:{" "}
                                            <span className="font-bold text-[#b99792]">
                                                {creatorLabel}
                                            </span>
                                        </span>
                                    </>
                                )}

                                <span className="text-[#4b1b1f]">//</span>

                                <span
                                    className="
                                        flex items-center gap-1
                                        text-[9px]
                                        tracking-[0.16em]
                                        text-[#7f6668]
                                    "
                                >
                                    {meta.isClosed && <Lock size={10} strokeWidth={2.3} />}
                                    {meta.isClosed ? "CHANNEL SEALED" : "CHANNEL OPEN"}
                                </span>
                            </>
                        ) : (
                            <>
                                <span
                                    className="
                                        text-[9px]
                                        tracking-[0.16em]
                                        text-[#a71924]
                                    "
                                >
                                    DIRECT TRANSMISSION
                                </span>

                                {(meta.blockedMe || isSubjectUserBlocked) && (
                                    <>
                                        <span className="text-[#4b1b1f]">//</span>

                                        <span
                                            className="
                                                flex items-center gap-1
                                                text-[9px]
                                                tracking-[0.16em]
                                                text-[#8f343b]
                                            "
                                        >
                                            <Ban size={10} strokeWidth={2.3} />
                                            {meta.blockedMe ? "LINK RESTRICTED" : "SOUL BLOCKED"}
                                        </span>

                                        {isSubjectUserBlocked && (
                                            <>
                                                <span className="text-[#4b1b1f]">//</span>
                                                <button
                                                    type="button"
                                                    disabled={isBlockStatePending}
                                                    onClick={() => unblockUser(subjectUser.userId)}
                                                    className="
                                                        text-[9px] font-bold tracking-[0.16em]
                                                        text-[#7f6668] underline decoration-dotted
                                                        transition
                                                        hover:text-[#eee2d5]
                                                        disabled:opacity-50
                                                    "
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
                        <button
                            type="button"
                            aria-label="View members"
                            onClick={() => openModal(<GroupMembersModal groupCreator={subjectUser}/>)}
                            className="
                                group relative grid h-12 w-12 place-items-center
                                border-2 border-[#4b1b1f]
                                bg-[#13090a]
                                text-[#8f5559]
                                shadow-[2px_2px_0_#321316]
                                transition
                                hover:-translate-y-px
                                hover:border-[#8f2830]
                                hover:bg-[#211012]
                                hover:text-[#d03a44]
                                hover:shadow-[3px_3px_0_#4b1b1f]
                                active:translate-y-0
                                active:shadow-none
                            "
                        >
                            <Users size={18} strokeWidth={2.5} />

                            <span
                                className="
                                    absolute inset-x-1 bottom-0.75
                                    h-px scale-x-0
                                    bg-[#a71924]
                                    transition-transform
                                    group-hover:scale-x-100
                                "
                            />
                        </button>
                    )}

                    <button
                        type="button"
                        aria-label="Close conversation"
                        onClick={clearActiveConversation}
                        className="
                            group relative grid h-12 w-12 place-items-center
                            border-2 border-[#64141b]
                            bg-[#1b090b]
                            text-[#a71924]
                            shadow-[2px_2px_0_#48090e]
                            transition
                            hover:-translate-y-px
                            hover:border-[#e02632]
                            hover:bg-[#2b0b0f]
                            hover:text-[#ff3b47]
                            hover:shadow-[3px_3px_0_#64141b]
                            active:shadow-none
                        "
                    >
                        <X size={18} strokeWidth={2.8} />

                        <span
                            className="
                                absolute inset-x-1 bottom-0.75
                                h-px scale-x-0
                                bg-[#e02632]
                                transition-transform
                                group-hover:scale-x-100
                            "
                        />
                    </button>
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