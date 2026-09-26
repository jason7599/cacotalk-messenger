import { LogOut, X } from "lucide-react";
import { useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import { getErrorMessage } from "../../../shared/apiClient";
import { selectGroupCreator, useActiveConversationStore } from "../activeConversationStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";

export default function LeaveConversationModal() {
    const { closeModal } = useModal();

    const groupCreator = useActiveConversationStore(selectGroupCreator)!;
    
    const leaveConversation = useActiveConversationStore((s) => s.leaveConversation);
    const blockUser = useBlockedUsersStore((s) => s.blockUser);

    const [confirmLeave, setConfirmLeave] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blockCreator, setBlockCreator] = useState(false);

    const hasBlockedCreator = useBlockedUsersStore((s) => !!s.blockedUsersById[groupCreator.userId]);

    async function handleLeave() {
        if (isLeaving) return;

        setError(null);
        setIsLeaving(true);

        try {
            if (!hasBlockedCreator && blockCreator) {
                await blockUser(groupCreator.userId);
            }

            await leaveConversation();

            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLeaving(false);
        }
    }

    return (
        <div className="w-105 max-w-[90vw] text-[#eee2d5]">
            <header className="mb-6 border-b-2 border-[#64141b] pb-5">
                <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="mb-2 text-xl font-bold tracking-[0.2em] text-[#a71924]">
                            CHANNEL CONTROL
                        </h2>

                        <p className="mt-2 text-xs tracking-[0.08em] text-[#9f8581]">
                            TERMINATE YOUR PRESENCE IN THIS CHANNEL.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={isLeaving}
                        aria-label="Close leave conversation modal"
                        className="
                            grid h-10 w-10 shrink-0 place-items-center
                            border-2 border-[#4b1b1f]
                            bg-[#0c0506]
                            text-[#9f8581]
                            shadow-[3px_3px_0_#48090e]
                            hover:border-[#e02632]
                            hover:text-[#e02632]
                            active:translate-x-0.75
                            active:translate-y-0.75
                            active:shadow-none
                            disabled:pointer-events-none
                            disabled:opacity-30
                        "
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <div className="flex flex-col gap-6">
                <section>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-[#a71924]">
                            01
                        </span>

                        <h3 className="text-sm font-bold tracking-[0.15em]">
                            DEPARTURE
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                    </div>

                    <div
                        className="
                            border-2 border-[#64141b]
                            bg-[#190b0d]
                            p-4
                            shadow-[4px_4px_0_#48090e]
                        "
                    >
                        <p className="font-bold">
                            ABANDON CHANNEL
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-[#9f8581]">
                            Sever your connection to this conversation.
                        </p>

                        <div
                            className="
                                mt-4
                                border-l-2 border-[#a71924]
                                bg-[#100708]
                                px-4 py-3
                            "
                        >
                            <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-[#a71924]">
                                CONSEQUENCES
                            </p>

                            <div className="space-y-1.5 text-xs leading-relaxed text-[#9f8581]">
                                <p>// You will leave this channel.</p>
                                <p>// New transmissions will no longer reach you.</p>
                                <p>// You will not see this conversation in your list. </p>
                            </div>
                        </div>

                        {!hasBlockedCreator && (
                            <label
                                className="
                                    mt-4 flex cursor-pointer items-start gap-3
                                    border-2 border-[#4b1b1f]
                                    bg-[#120809]
                                    p-4
                                    transition
                                    hover:border-[#64141b]
                                    hover:bg-[#190b0d]
                                "
                            >
                                <input
                                    type="checkbox"
                                    checked={blockCreator}
                                    disabled={isLeaving}
                                    onChange={(e) => setBlockCreator(e.target.checked)}
                                    className="peer sr-only"
                                />

                                <span
                                    className="
                                        mt-0.5 grid h-5 w-5 shrink-0 place-items-center
                                        border-2 border-[#64141b]
                                        bg-[#0c0506]
                                        shadow-[2px_2px_0_#48090e]
                                        transition
                                        peer-checked:border-[#e02632]
                                        peer-checked:bg-[#a71924]
                                        peer-checked:shadow-[2px_2px_0_#520a10]
                                        peer-disabled:opacity-40
                                    "
                                >
                                    {blockCreator && (
                                        <span className="h-2 w-2 bg-[#eee2d5]" />
                                    )}
                                </span>
                                <span className="min-w-0">
                                    <span
                                        className="
                                            block text-xs font-bold
                                            tracking-[0.14em]
                                            text-[#d7b9b4]
                                        "
                                    >
                                        SEAL THE SOURCE
                                    </span>

                                    <span
                                        className="
                                            mt-1 block text-[11px]
                                            leading-relaxed
                                            text-[#8f7370]
                                        "
                                    >
                                        Also block{" "}
                                        <span className="font-bold text-[#d7b9b4]">
                                            {groupCreator.username}
                                        </span>
                                        , the creator of this channel. This prevents future invitations from
                                        this soul.
                                    </span>
                                </span>
                            </label>
                        )}

                        <button
                            type="button"
                            disabled={isLeaving}
                            onClick={() => {
                                if (!confirmLeave) {
                                    setConfirmLeave(true);
                                } else {
                                    handleLeave();
                                }
                            }}
                            className={`
                                mt-4 flex w-full items-center justify-center gap-2
                                border-2
                                px-5 py-3
                                font-bold tracking-[0.15em]
                                text-[#eee2d5]
                                active:translate-x-0.75
                                active:translate-y-0.75
                                disabled:pointer-events-none
                                disabled:opacity-60

                                ${confirmLeave
                                    ? `
                                        border-[#ff4b55]
                                        bg-[#e02632]
                                        shadow-[4px_4px_0_#7a0c14]
                                        hover:bg-[#ff3340]
                                    `
                                    : `
                                        border-[#e02632]
                                        bg-[#a71924]
                                        shadow-[4px_4px_0_#520a10]
                                        hover:bg-[#e02632]
                                    `
                                }

                                active:shadow-[1px_1px_0_#520a10]
                            `}
                        >
                            {isLeaving ? (
                                <>
                                    <span
                                        className="
                                            h-4 w-4 animate-spin rounded-full
                                            border-2 border-[#eee2d5]
                                            border-t-transparent
                                        "
                                    />

                                    DEPARTING...
                                </>
                            ) : (
                                <>
                                    <LogOut size={17} strokeWidth={2.5} />

                                    {confirmLeave
                                        ? "ARE YOU SURE?"
                                        : "ABANDON CHANNEL"
                                    }
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {error && (
                    <p className="border-l-2 border-[#ff4b55] pl-3 text-sm text-[#ff7b73]">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}