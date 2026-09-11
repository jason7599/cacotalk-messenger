import { Ban, UserMinus, X } from "lucide-react";
import type { UserResponse } from "../../../shared/types";
import { useBlockedUsersStore } from "../blockedUsersStore";
import { useContactsStore } from "../contactsStore";
import { useModal } from "../../../components/ModalProvider";
import { useState } from "react";
import { getErrorMessage } from "../../../shared/apiClient";

type ContactActionsModalProps = {
    contact: UserResponse;
};

export default function ContactActionsModal({ contact }: ContactActionsModalProps) {
    const { closeModal } = useModal();

    const blockUser = useBlockedUsersStore((state) => state.blockUser);
    const blockingIds = useBlockedUsersStore((state) => state.pendingIds);

    const removeContact = useContactsStore((state) => state.removeContact);

    const isBlocking = blockingIds.has(contact.userId);

    const [isRemoving, setIsRemoving] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [confirmBlock, setConfirmBlock] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isBusy = isBlocking || isRemoving;

    async function handleRemove() {
        if (isBusy) {
            return;
        }

        setError(null);
        setIsRemoving(true);

        try {
            await removeContact(contact.userId);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsRemoving(false);
        }
    }

    async function handleBlock() {
        if (isBusy) return;

        setError(null);

        try {
            await blockUser(contact.userId);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }

    return (
        <div className="w-105 max-w-[90vw] text-[#eee2d5]">
            <header className="mb-6 border-b-2 border-[#64141b] pb-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 text-xs tracking-[0.2em] text-[#a71924]">
                            CONTACT CONTROL
                        </p>

                        <h2 className="text-2xl font-black">
                            {contact.username}
                        </h2>

                        <p className="mt-2 text-xs tracking-[0.08em] text-[#9f8581]">
                            ALTER THIS SOUL'S ACCESS.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={isBusy}
                        aria-label="Close contact actions"
                        className="
                            grid h-10 w-10 place-items-center
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
                            RELATION
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                    </div>

                    <div
                        className="
                            border-2 border-[#4b1b1f]
                            bg-[#190b0d]
                            p-4
                            shadow-[4px_4px_0_#48090e]
                        "
                    >
                        <p className="font-bold">
                            SEVER CONTACT
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-[#9f8581]">
                            Remove this soul from your directory.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                if (!confirmRemove) {
                                    setConfirmRemove(true);
                                } else {
                                    handleRemove();
                                }
                            }}
                            disabled={isBusy}
                            className={`
                                mt-4 flex w-full items-center justify-center gap-2
                                border-2
                                px-5 py-3
                                font-bold tracking-[0.15em]
                                text-[#d7b9b4]
                                active:translate-x-0.75
                                active:translate-y-0.75
                                disabled:pointer-events-none
                                disabled:opacity-40

                                ${confirmRemove
                                    ? `
                                        border-[#b32632]
                                        bg-[#541218]
                                        text-[#f0d8d4]
                                        shadow-[4px_4px_0_#30080c]
                                        hover:bg-[#6a161d]
                                    `
                                    : `
                                        border-[#64141b]
                                        bg-[#2b0e12]
                                        shadow-[4px_4px_0_#48090e]
                                        hover:border-[#a71924]
                                        hover:bg-[#4b1717]
                                        hover:text-[#eee2d5]
                                    `
                                }

                                active:shadow-[1px_1px_0_#48090e]
                            `}
                        >
                            {isRemoving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7b9b4] border-t-transparent" />
                                    SEVERING...
                                </>
                            ) : (
                                <>
                                    <UserMinus size={17} strokeWidth={2.5} />

                                    {confirmRemove
                                        ? "ARE YOU SURE?"
                                        : "REMOVE CONTACT"
                                    }
                                </>
                            )}
                        </button>
                    </div>
                </section>

                <section>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-[#a71924]">
                            02
                        </span>

                        <h3 className="text-sm font-bold tracking-[0.15em]">
                            RESTRICTION
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
                            CONDEMN TO SILENCE
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-[#9f8581]">
                            Sever direct contact with this user.
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
                                <p>// The condemned soul will not be notified.</p>
                                <p>// Removed from your contacts.</p>
                                <p>// Direct messages are sealed for both parties.</p>
                                <p>// Group invitations are blocked.</p>
                                <p>// Existing group conversations remain untouched.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (!confirmBlock) {
                                    setConfirmBlock(true);
                                } else {
                                    handleBlock();
                                }
                            }}
                            disabled={isBusy}
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

                                ${confirmBlock
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
                            {isBlocking ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#eee2d5] border-t-transparent" />
                                    CONDEMNING...
                                </>
                            ) : (
                                <>
                                    <Ban size={17} strokeWidth={2.5} />

                                    {confirmBlock
                                        ? "ARE YOU SURE?"
                                        : "BANISH SOUL"
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