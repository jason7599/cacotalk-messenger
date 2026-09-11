import { ArrowLeft, Search, ShieldBan, Unlock, X } from "lucide-react";
import SettingsModal from "../../../components/SettingsModal";
import { useBlockedUsersStore } from "../blockedUsersStore";
import { useModal } from "../../../components/ModalProvider";
import { useMemo, useState } from "react";

export default function BlockedUsersModal() {
    const { openModal, closeModal } = useModal();

    const blockedUsers = useBlockedUsersStore((state) => state.blockedUsers);
    const pendingIds = useBlockedUsersStore((state) => state.pendingIds);
    const unblockUser = useBlockedUsersStore((state) => state.unblockUser);

    async function handleUnblock(userId: number) {
        await unblockUser(userId);
    }

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return blockedUsers;
        }

        return blockedUsers.filter((u) => u.username.toLowerCase().includes(normalized));
    }, [blockedUsers, query]);

    return (
        <div className="w-115 max-w-[90vw] text-[#eee2d5]">
            <header className="mb-6 border-b-2 border-[#64141b] pb-5">

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={() => openModal(<SettingsModal />)}
                            aria-label="Back to settings"
                            className="
                                mt-0.5 grid h-10 w-10 place-items-center
                                border-2 border-[#4b1b1f]
                                bg-[#0c0506]
                                text-[#9f8581]
                                shadow-[3px_3px_0_#48090e]
                                hover:border-[#e02632]
                                hover:text-[#e02632]
                                active:translate-x-0.75
                                active:translate-y-0.75
                                active:shadow-none
                            "
                        >
                            <ArrowLeft size={18} strokeWidth={2.5} />
                        </button>

                        <div>
                            <p className="mb-2 text-xs tracking-[0.2em] text-[#a71924]">
                                BLACKLIST // ACTIVE
                            </p>

                            <h2 className="text-3xl font-black tracking-[-0.03em]">
                                BANISHED SOULS
                            </h2>

                            <p className="mt-2 text-xs tracking-[0.08em] text-[#9f8581]">
                                REVIEW THOSE CAST INTO SILENCE.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close blocked users"
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
                        "
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <label
                className="
                    mb-4 flex items-center gap-2
                    border-2 border-[#4b1b1f]
                    bg-[#0c0506]
                    px-3
                    focus-within:border-[#e02632]
                "
            >
                <Search
                    size={16}
                    strokeWidth={2.3}
                    className="shrink-0 text-[#7f6668]"
                />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH THE BANISHED..."
                    className="
                        min-w-0 flex-1
                        bg-transparent
                        py-2.5
                        text-xs
                        text-[#eee2d5]
                        outline-none
                        placeholder:text-[#5f4548]
                    "
                />
            </label>

            <div
                className="
                    max-h-96 overflow-y-auto
                    border-2 border-[#4b1b1f]
                    bg-[#100708]
                "
            >
                {filtered.length === 0 ? (
                    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
                        <ShieldBan
                            size={28}
                            strokeWidth={2}
                            className="mb-3 text-[#64141b]"
                        />

                        <p className="text-sm font-bold text-[#9f8581]">
                            {blockedUsers.length === 0
                                ? "THE BLACKLIST IS EMPTY"
                                : "NO MATCHING SOULS"}
                        </p>
                    </div>
                ) : (
                    filtered.map((user) => {
                        const pending = pendingIds.has(user.userId);

                        return (
                            <div
                                key={user.userId}
                                className="
                                    flex items-center gap-3
                                    border-b border-[#4b1b1f]
                                    bg-[#190b0d]
                                    px-4 py-3
                                    last:border-b-0
                                    hover:bg-[#240d10]
                                "
                            >
                                <div
                                    className="
                                        grid h-10 w-10 shrink-0 place-items-center
                                        border-2 border-[#64141b]
                                        bg-[#100708]
                                        text-sm font-black
                                        text-[#e02632]
                                        shadow-[2px_2px_0_#48090e]
                                    "
                                >
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">
                                        {user.username}
                                    </p>

                                    <p className="mt-1 text-[10px] tracking-[0.14em] text-[#7f6668]">
                                        CONDEMNED TO SILENCE
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleUnblock(user.userId)}
                                    disabled={pending}
                                    className="
                                        flex items-center gap-2
                                        border-2 border-[#64141b]
                                        bg-[#190b0d]
                                        px-3 py-2
                                        text-xs font-bold
                                        text-[#a71924]
                                        shadow-[2px_2px_0_#48090e]
                                        hover:border-[#e02632]
                                        hover:bg-[#a71924]
                                        hover:text-[#eee2d5]
                                        active:translate-x-0.5
                                        active:translate-y-0.5
                                        active:shadow-none
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                        disabled:pointer-events-none
                                    "
                                >
                                    <Unlock size={14} strokeWidth={2.5} />

                                    {pending ? "RELEASING..." : "RELEASE"}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <footer
                className="
                    mt-4 border-t border-[#4b1b1f]
                    pt-3
                    text-[9px]
                    tracking-[0.16em]
                    text-[#7f6668]
                "
            >
                BLACKLIST RECORDS // LOCAL RELATION STATE
            </footer>
        </div>
    );
}