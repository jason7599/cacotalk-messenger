import { Ban, Lock, X, Users, ShieldAlert, LogOut, UserPlus } from "lucide-react";
import { useActiveConversationStore } from "../activeConversationStore";
import { useAuth } from "../../auth/AuthProvider";
import { useContactsStore } from "../../userRelations/contactsStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import LeaveConversationModal from "./LeaveConversationModal";
import { useModal } from "../../../components/ModalProvider";

export default function ConversationHeader() {
    const myId = useAuth().user!.userId;
    const { openModal } = useModal();

    const conversation = useActiveConversationStore((s) => s.conversation)!;
    const clearActiveConversation = useActiveConversationStore((s) => s.clearActiveConversation);

    const { otherMembers, meta } = conversation;

    const subjectUserId = meta.type === "DIRECT"
        ? otherMembers[0]!.userId
        : meta.groupCreatorId
        ;

    const createdByMe = meta.type === "GROUP" && meta.groupCreatorId === myId;

    // IF ws connection drops and reconnects mid session, or anything causes the store to be out of sync,
    // these data will be stale. But I'd say it's acceptable for now. Let's just be smart with reconnection later
    // the !createdByMe inside is just a lil hack to avoid unnecessary lookups
    const isSubjectUserInContacts = useContactsStore((s) =>
        !createdByMe && s.contacts.some((c) => c.userId === subjectUserId)
    );
    const isSubjectUserBlocked = useBlockedUsersStore((s) =>
        !createdByMe && s.blockedUsers.some((b) => b.userId === subjectUserId)
    );

    const addContact = useContactsStore((s) => s.addContact);
    const isAddingContact = useContactsStore((s) => s.addingIds.has(subjectUserId));

    const blockUser = useBlockedUsersStore((s) => s.blockUser);
    const unblockUser = useBlockedUsersStore((s) => s.unblockUser);
    const isBlockStatePending = useBlockedUsersStore((s) => s.pendingIds.has(subjectUserId));

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
                                <span
                                    className="
                                        flex items-center gap-1
                                        text-[9px]
                                        tracking-[0.16em]
                                        text-[#a71924]
                                    "
                                >
                                    <Users size={11} strokeWidth={2.3} />
                                    GROUP // {otherMembers.length + 1} SOULS
                                </span>

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
                                                    onClick={() => unblockUser(subjectUserId)}
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
                                onClick={() => addContact(subjectUserId)}
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
                                onClick={() => blockUser(subjectUserId)}
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
                                        onClick={() => unblockUser(subjectUserId)}
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
                                        <LeaveConversationModal 
                                            groupCreatorId={subjectUserId}
                                            groupCreatorBlocked={isSubjectUserBlocked}
                                        />)
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
            )}
        </header>
    );
}