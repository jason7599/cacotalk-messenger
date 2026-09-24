import { Crown, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { useActiveConversationStore } from "../activeConversationStore";
import { useModal } from "../../../components/ModalProvider";
import { useContactsStore } from "../../userRelations/contactsStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";

export default function GroupMembersModal() {
    const myId = useAuth().user!.userId;
    const { closeModal } = useModal();

    const conversation = useActiveConversationStore((s) => s.conversation)!;
    const { otherMembers, meta } = conversation;
    
    // shouldn't happen but we need the linter happy
    if (meta.type !== "GROUP") {
        return null; 
    }

    const members = [
        {
            userId: myId,
            username: "YOU",
        },
        ...otherMembers,
    ];

    return (
        <div
            className="
                w-[min(92vw,30rem)]
                border-2 border-[#64141b]
                bg-[#100708]
                shadow-[6px_6px_0_#48090e]
            "
        >
            {/* Header */}
            <div
                className="
                    flex items-center gap-4
                    border-b-2 border-[#4b1b1f]
                    bg-[#16090a]
                    px-5 py-4
                "
            >
                <div
                    className="
                        grid h-10 w-10 shrink-0 place-items-center
                        border border-[#64141b]
                        bg-[#1b090b]
                        text-[#d62834]
                    "
                >
                    <Users size={18} strokeWidth={2.4} />
                </div>

                <div className="min-w-0 flex-1">
                    <p
                        className="
                            text-xs font-black
                            tracking-[0.18em]
                            text-[#eee2d5]
                        "
                    >
                        CHANNEL SOULS
                    </p>

                    <p
                        className="
                            mt-1 text-[9px]
                            tracking-[0.18em]
                            text-[#7f6668]
                        "
                    >
                        {members.length} ENTITIES CONNECTED
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Close"
                    onClick={closeModal}
                    className="
                        grid h-9 w-9 place-items-center
                        border border-[#4b1b1f]
                        text-[#8f5559]
                        transition
                        hover:border-[#a71924]
                        hover:bg-[#250b0e]
                        hover:text-[#ef3945]
                    "
                >
                    <X size={16} strokeWidth={2.6} />
                </button>
            </div>

            {/* Members */}
            <div className="max-h-96 overflow-y-auto">
                {members.map((member, index) => {
                    const isMe = member.userId === myId;
                    const isCreator = member.userId === meta.groupCreatorId;

                    return (
                        <div
                            key={member.userId}
                            className={`
                                group flex items-center gap-4
                                px-5 py-4
                                transition
                                hover:bg-[#18090b]
                                ${index !== members.length - 1
                                    ? "border-b border-[#321316]"
                                    : ""
                                }
                            `}
                        >
                            {/* Initial */}
                            <div
                                className="
                                    grid h-10 w-10 shrink-0 place-items-center
                                    border border-[#522026]
                                    bg-[#190b0d]
                                    text-sm font-black
                                    text-[#bb2933]
                                    transition
                                    group-hover:border-[#76212a]
                                "
                            >
                                {member.username.charAt(0).toUpperCase()}
                            </div>

                            {/* Identity */}
                            <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                    <p
                                        className="
                                            truncate
                                            text-sm font-bold
                                            text-[#d9c9c3]
                                        "
                                    >
                                        {member.username}
                                    </p>

                                    {isMe && (
                                        <span
                                            className="
                                                shrink-0
                                                text-[8px] font-black
                                                tracking-[0.16em]
                                                text-[#8f5559]
                                            "
                                        >
                                            // YOU
                                        </span>
                                    )}
                                </div>

                                <div className="mt-1 flex items-center gap-2">
                                    {isCreator ? (
                                        <span
                                            className="
                                                flex items-center gap-1
                                                text-[8px] font-bold
                                                tracking-[0.16em]
                                                text-[#b47b32]
                                            "
                                        >
                                            <Crown size={9} strokeWidth={2.4} />
                                            ORIGINATOR
                                        </span>
                                    ) : (
                                        <span
                                            className="
                                                text-[8px]
                                                tracking-[0.16em]
                                                text-[#665054]
                                            "
                                        >
                                            CHANNEL MEMBER
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Future member actions */}
                            {!isMe && (
                                <button
                                    type="button"
                                    className="
                                        opacity-0
                                        text-[8px] font-black
                                        tracking-[0.15em]
                                        text-[#75565a]
                                        transition
                                        hover:text-[#d9b9b4]
                                        group-hover:opacity-100
                                    "
                                >
                                    VIEW
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {!meta.isClosed && (
                <div
                    className="
                        border-t-2 border-[#4b1b1f]
                        bg-[#130809]
                        p-4
                    "
                >
                    <button
                        type="button"
                        className="
                            group flex w-full items-center justify-center gap-2
                            border border-[#64141b]
                            bg-[#1a090b]
                            px-4 py-3
                            text-[9px] font-black
                            tracking-[0.18em]
                            text-[#a71924]
                            transition
                            hover:border-[#a71924]
                            hover:bg-[#290c10]
                            hover:text-[#ed3945]
                        "
                    >
                        <UserPlus
                            size={13}
                            strokeWidth={2.5}
                            className="
                                transition-transform
                                group-hover:scale-110
                            "
                        />

                        INVITE SOUL
                    </button>
                </div>
            )}
        </div>
    );
}