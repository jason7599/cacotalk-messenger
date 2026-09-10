import { ChevronRight, LogOut, ShieldBan, X } from "lucide-react";
import { useAuth } from "../features/auth/AuthProvider";
import { useModal } from "./ModalProvider";
import { useState } from "react";

export default function SettingsModal() {
    const { logout } = useAuth();
    const { closeModal } = useModal();

    const [confirmLogout, setConfirmLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        try {
            await logout();
            closeModal();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <div className="w-115 max-w-[90vw] text-[#eee2d5]">
            <header className="mb-7 border-b-2 border-[#64141b] pb-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 text-xs tracking-[0.2em] text-[#a71924]">
                            INFERNAL CONTROL PANEL
                        </p>

                        <h2 className="text-3xl font-black tracking-[-0.03em]">
                            SETTINGS
                        </h2>

                        <p className="mt-2 text-xs tracking-[0.08em] text-[#9f8581]">
                            TAMPER WITH YOUR LOCAL DAMNATION.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={loggingOut}
                        aria-label="Close settings"
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
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                            disabled:hover:border-[#4b1b1f]
                            disabled:hover:text-[#9f8581]
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
                            BLACKLIST
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                    </div>


                    <button
                        type="button"
                        disabled={loggingOut}
                        onClick={() => {
                            // TODO: open blocked users view
                        }}
                        className="
                            group flex w-full items-center gap-4
                            border-2 border-[#4b1b1f]
                            bg-[#0c0506]
                            p-4
                            text-left
                            shadow-[4px_4px_0_#48090e]
                            hover:border-[#e02632]
                            hover:bg-[#190b0d]
                            active:translate-x-0.75
                            active:translate-y-0.75
                            active:shadow-[1px_1px_0_#48090e]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            disabled:pointer-events-none
                        "
                    >
                        <div
                            className="
                                grid h-10 w-10 shrink-0 place-items-center
                                border border-[#64141b]
                                bg-[#190b0d]
                                text-[#e02632]
                                group-hover:border-[#e02632]
                            "
                        >
                            <ShieldBan size={20} strokeWidth={2.2} />
                        </div>

                        <div className="flex-1">
                            <p className="font-bold text-[#eee2d5]">
                                BLOCKED USERS
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-[#9f8581]">
                                Inspect and release souls condemned to silence.
                            </p>
                        </div>

                        <ChevronRight
                            size={18}
                            strokeWidth={2.4}
                            className="
                                text-[#a71924]
                                transition-transform
                                group-hover:text-[#e02632]
                            "
                        />
                    </button>

                </section>

                <section>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-[#a71924]">
                            02
                        </span>

                        <h3 className="text-sm font-bold tracking-[0.15em]">
                            SESSION
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
                            TERMINATE CURRENT SESSION
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-[#9f8581]">
                            Destroy this session and return to the authentication gate.
                        </p>

                        <button
                            type="button"
                            disabled={loggingOut}
                            onClick={() => {
                                if (!confirmLogout) {
                                    setConfirmLogout(true);
                                } else {
                                    handleLogout();
                                }
                            }}
                            className="
                                mt-4 flex w-full items-center justify-center gap-2
                                border-2 border-[#e02632]
                                bg-[#a71924]
                                px-5 py-3
                                font-bold tracking-[0.15em]
                                text-[#eee2d5]
                                shadow-[4px_4px_0_#520a10]
                                hover:bg-[#e02632]
                                active:translate-x-0.75
                                active:translate-y-0.75
                                active:shadow-[1px_1px_0_#520a10]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {loggingOut ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#eee2d5] border-t-transparent" />
                                    ESCAPING THE PIT...
                                </>
                            ) : (
                                <>
                                    <LogOut size={17} strokeWidth={2.5} />
                                    {confirmLogout ? "ARE YOU SURE?" : "ABANDON THE PIT"}
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
