import { LockKeyhole, LogOut, UserPlus, X } from "lucide-react";
import { useModal } from "../../../components/ModalProvider";
import { useActiveConversationStore } from "../activeConversationStore";
import GroupMemberRow from "./GroupMemberItem";
import LeaveConversationModal from "./LeaveConversationModal";
import { useAuthStore } from "../../auth/authStore";

export default function GroupMembersModal() {
    const me = useAuthStore((s) => s.user!);
    const { openModal, closeModal } = useModal();

    const conversation = useActiveConversationStore((s) => s.conversation)!;
    const { otherMembers, meta } = conversation;

    if (meta.type !== "GROUP") {
        return null;
    }

    const amICreator = meta.groupCreator.userId === me.userId;

    const members = [me, ...otherMembers];

    return (
        <div className="w-170 max-w-[92vw] text-[#eee2d5]">
            {/* Header */}
            <header className="mb-5 border-b-2 border-[#64141b] pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-1.5 text-[10px] tracking-[0.2em] text-[#a71924]">
                            CHANNEL MANIFEST
                        </p>

                        <h2 className="text-2xl font-black tracking-[-0.03em]">
                            GROUP MEMBERS
                        </h2>

                        <p className="mt-1.5 text-[10px] tracking-[0.08em] text-[#9f8581]">
                            {members.length} SOULS CURRENTLY BOUND TO THIS CHANNEL.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close group members"
                        className="
                            grid h-9 w-9 shrink-0 place-items-center
                            border-2 border-[#4b1b1f]
                            bg-[#0c0506]
                            text-[#9f8581]
                            shadow-[2px_2px_0_#48090e]
                            transition
                            hover:border-[#e02632]
                            hover:text-[#e02632]
                            active:translate-x-0.5
                            active:translate-y-0.5
                            active:shadow-none
                        "
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <div className="flex flex-col gap-5">
                {/* Members */}
                <section>
                    <div className="mb-2.5 flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-[0.18em] text-[#a71924]">
                            01
                        </span>

                        <h3 className="text-xs font-bold tracking-[0.15em]">
                            BOUND SOULS
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                    </div>

                    <div className="max-h-104 overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
                            {members.map((member) => 
                                <GroupMemberRow
                                    key={member.userId}
                                    member={member}
                                />
                            )}
                        </div>
                    </div>
                </section>

                {/* Channel controls */}
                <section>
                    <div className="mb-2.5 flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-[0.18em] text-[#a71924]">
                            02
                        </span>

                        <h3 className="text-xs font-bold tracking-[0.15em]">
                            CHANNEL CONTROL
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                    </div>

                    {amICreator ? (
                        <>
                            {meta.isClosed ? (
                                <div
                                    className="
                                        border-2 border-[#4b1b1f]
                                        bg-[#0c0506]
                                        px-4 py-3
                                        text-center
                                        shadow-[3px_3px_0_#48090e]
                                    "
                                >
                                    <p className="text-xs font-bold tracking-[0.12em] text-[#9f8581]">
                                        CHANNEL SEALED
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#665054]">
                                        This channel has been condemned to silence.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        className="
                                            group flex items-center justify-center gap-2
                                            border-2 border-[#4b1b1f]
                                            bg-[#0c0506]
                                            px-3 py-2.5
                                            text-[10px] font-bold
                                            tracking-[0.12em]
                                            text-[#eee2d5]
                                            shadow-[3px_3px_0_#48090e]
                                            transition
                                            hover:border-[#e02632]
                                            hover:bg-[#190b0d]
                                            active:translate-x-0.5
                                            active:translate-y-0.5
                                            active:shadow-none
                                        "
                                    >
                                        <UserPlus
                                            size={14}
                                            strokeWidth={2.5}
                                            className="
                                                text-[#a71924]
                                                transition-colors
                                                group-hover:text-[#e02632]
                                            "
                                        />

                                        INVITE SOUL
                                    </button>

                                    <button
                                        type="button"
                                        className="
                                            flex items-center justify-center gap-2
                                            border-2 border-[#e02632]
                                            bg-[#a71924]
                                            px-3 py-2.5
                                            text-[10px] font-bold
                                            tracking-[0.12em]
                                            text-[#eee2d5]
                                            shadow-[3px_3px_0_#520a10]
                                            transition
                                            hover:bg-[#e02632]
                                            active:translate-x-0.5
                                            active:translate-y-0.5
                                            active:shadow-none
                                        "
                                    >
                                        <LockKeyhole size={14} strokeWidth={2.6} />
                                        CLOSE CHANNEL
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => openModal(<LeaveConversationModal />)}
                            className="
                                flex w-full items-center justify-center gap-2
                                border-2 border-[#64141b]
                                bg-[#190b0d]
                                px-4 py-2.5
                                text-xs font-bold
                                tracking-[0.15em]
                                text-[#eee2d5]
                                shadow-[3px_3px_0_#48090e]
                                transition
                                hover:border-[#e02632]
                                hover:bg-[#a71924]
                                active:translate-x-0.5
                                active:translate-y-0.5
                                active:shadow-none
                            "
                        >
                            <LogOut size={15} strokeWidth={2.5} />
                            LEAVE CHANNEL
                        </button>
                    )}
                </section>
            </div>
        </div>
    );
}