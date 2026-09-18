import { Search, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import type { UserInfo } from "../../../shared/types";
import { apiGetInvitableUsers } from "../../userRelations/userRelationsApi";
import { getErrorMessage } from "../../../shared/apiClient";
import { apiCreateGroupConversation } from "../conversationsApi";

// excluding user.
const MIN_INVITE_COUNT = 2;
const MAX_INVITE_COUNT = 99;

export default function CreateGroupModal() {
    const { closeModal } = useModal();

    const [users, setUsers] = useState<UserInfo[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");

    const canCreate = MIN_INVITE_COUNT <= selected.size && selected.size <= MAX_INVITE_COUNT;

    useEffect(() => {
        async function loadUsers() {
            setError(null);
            try {
                setUsers((await apiGetInvitableUsers()));
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return users;
        }

        return users.filter((user) =>
            user.username.toLowerCase().includes(normalized)
        );
    }, [users, query]);

    const selectedUsers = useMemo(() => {
        return users.filter((user) => selected.has(user.userId));
    }, [users, selected]);

    function toggleUser(userId: number) {
        setSelected((current) => {
            const next = new Set(current);

            if (next.has(userId)) {
                next.delete(userId);
            } else if (next.size < MAX_INVITE_COUNT) {
                next.add(userId);
            }

            return next;
        });
    }

    async function handleCreate() {
        if (!canCreate || creating) {
            return;
        }

        setCreating(true);

        try {
            await apiCreateGroupConversation(Array.from(selected));
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="w-180 max-w-[92vw] text-[#eee2d5]">

            <header className="mb-6 border-b-2 border-[#64141b] pb-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-2 text-xs tracking-[0.2em] text-[#a71924]">
                            ESTABLISH NEW CHANNEL
                        </p>

                        <h2 className="text-3xl font-black tracking-[-0.03em]">
                            GROUP TRANSMISSION
                        </h2>

                        <p className="mt-2 text-xs tracking-[0.08em] text-[#9f8581]">
                            ASSEMBLE THE SOULS TO BE BOUND TO THIS CHANNEL.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={creating}
                        aria-label="Close create group modal"
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
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                        "
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            {error && (
                <div
                    className="
                        mb-6
                        border-2 border-[#a71924]
                        bg-[#2b0e12]
                        px-4 py-3
                        text-xs
                        text-[#e8b6b2]
                        shadow-[3px_3px_0_#48090e]
                    "
                >
                    <p className="font-bold tracking-[0.12em] text-[#e02632]">
                        TRANSMISSION ERROR
                    </p>

                    <p className="mt-1 leading-relaxed">
                        {error}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-6">
                <section>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-[#a71924]">
                            01
                        </span>

                        <h3 className="text-sm font-bold tracking-[0.15em]">
                            LOCATE SOULS
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                    </div>

                    <label
                        className="
                            flex items-center gap-3
                            border-2 border-[#4b1b1f]
                            bg-[#0c0506]
                            px-4
                            focus-within:border-[#a71924]
                        "
                    >
                        <Search
                            size={17}
                            strokeWidth={2.3}
                            className="shrink-0 text-[#7f6668]"
                        />

                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="SEARCH SOULS..."
                            className="
                                min-w-0 flex-1
                                bg-transparent
                                py-3
                                text-xs
                                text-[#eee2d5]
                                outline-none
                                placeholder:text-[#5f4548]
                            "
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="
                                    shrink-0
                                    text-[#7f6668]
                                    hover:text-[#e02632]
                                "
                            >
                                <X size={15} strokeWidth={2.4} />
                            </button>
                        )}
                    </label>
                </section>

                <section>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-[#a71924]">
                            02
                        </span>

                        <h3 className="text-sm font-bold tracking-[0.15em]">
                            AVAILABLE SOULS
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />

                        {!loading && (
                            <span className="text-[10px] tracking-[0.14em] text-[#7f6668]">
                                {filtered.length} FOUND
                            </span>
                        )}
                    </div>

                    <p className="mb-3 font-bold text-[11px] leading-relaxed text-[#7f6668]">
                        Your contacts eligible for this group are shown below.
                        Contacts who have blocked you are excluded.
                    </p>

                    <div
                        className="
                            max-h-72 overflow-y-auto
                            border-2 border-[#4b1b1f]
                            bg-[#080304]
                            p-3
                        "
                    >
                        {loading ? (
                            <div className="flex min-h-40 items-center justify-center">
                                <div className="flex items-center gap-3 text-xs tracking-[0.14em] text-[#9f8581]">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#a71924] border-t-transparent" />
                                    SEARCHING THE PIT...
                                </div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex min-h-40 flex-col items-center justify-center text-center">
                                <Users
                                    size={28}
                                    strokeWidth={1.8}
                                    className="mb-3 text-[#64141b]"
                                />

                                <p className="text-xs font-bold tracking-[0.12em] text-[#9f8581]">
                                    NO SOULS FOUND
                                </p>

                                <p className="mt-1 text-[10px] text-[#7f6668]">
                                    THE SUMMONING CIRCLE YIELDS NOTHING.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {filtered.map((user) => {
                                    const checked = selected.has(user.userId);

                                    return (
                                        <button
                                            key={user.userId}
                                            type="button"
                                            onClick={() => toggleUser(user.userId)}
                                            className={`
                                                group min-w-0
                                                border-2
                                                p-3
                                                text-left
                                                transition-none
                                                ${checked
                                                    ? `
                                                        border-[#e02632]
                                                        bg-[#3a1014]
                                                        text-[#eee2d5]
                                                        shadow-[3px_3px_0_#520a10]
                                                        `
                                                    : `
                                                        border-[#4b1b1f]
                                                        bg-[#0c0506]
                                                        text-[#b99792]
                                                        shadow-[3px_3px_0_#25080b]
                                                        hover:border-[#a71924]
                                                        hover:bg-[#190b0d]
                                                        hover:text-[#eee2d5]
                                                        `
                                                }
                                                active:translate-x-0.5
                                                active:translate-y-0.5
                                                active:shadow-none
                                            `}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`
                                                        grid h-8 w-8 shrink-0 place-items-center
                                                        border
                                                        ${checked
                                                            ? "border-[#e02632] bg-[#a71924] text-[#eee2d5]"
                                                            : "border-[#64141b] bg-[#190b0d] text-[#a71924]"
                                                        }
                                                    `}
                                                >
                                                    <UserPlus
                                                        size={15}
                                                        strokeWidth={2.4}
                                                    />
                                                </div>

                                                <span className="min-w-0 truncate text-xs font-bold">
                                                    {user.username}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-[#a71924]">
                            03
                        </span>

                        <h3 className="text-sm font-bold tracking-[0.15em]">
                            BOUND SOULS
                        </h3>

                        <div className="h-px flex-1 bg-[#4b1b1f]" />
                        <span
                            className={`
                                text-[10px] font-bold tracking-[0.14em]
                                ${canCreate
                                    ? "text-[#a71924]"
                                    : "text-[#7f6668]"
                                }
                            `}
                        >
                            {selected.size} / {MAX_INVITE_COUNT} MEMBERS
                        </span>
                    </div>

                    {!canCreate && (
                        <p className="mb-3 text-bold text-[11px] text-[#7f6668]">
                            Select {MIN_INVITE_COUNT}–{MAX_INVITE_COUNT} souls.
                        </p>
                    )}

                    <div
                        className="
                            min-h-16
                            border-2 border-[#4b1b1f]
                            bg-[#0c0506]
                            p-3
                        "
                    >
                        {selectedUsers.length === 0 ? (
                            <div className="flex min-h-10 items-center justify-center">
                                <p className="text-[10px] tracking-[0.12em] text-[#5f4548]">
                                    NO SOULS HAVE BEEN BOUND.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((user) => (
                                    <button
                                        key={user.userId}
                                        type="button"
                                        onClick={() => toggleUser(user.userId)}
                                        className="
                                            flex min-w-0 items-center gap-2
                                            border border-[#64141b]
                                            bg-[#190b0d]
                                            px-2.5 py-1.5
                                            text-[11px] font-bold
                                            text-[#d7b9b4]
                                            hover:border-[#e02632]
                                            hover:text-[#eee2d5]
                                        "
                                    >
                                        <span className="max-w-40 truncate">
                                            {user.username}
                                        </span>

                                        <X
                                            size={13}
                                            strokeWidth={2.5}
                                            className="shrink-0 text-[#a71924]"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <button
                    type="button"
                    disabled={!canCreate || creating}
                    onClick={handleCreate}
                    className="
                        flex w-full items-center justify-center gap-2
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
                        disabled:border-[#4b1b1f]
                        disabled:bg-[#190b0d]
                        disabled:text-[#5f4548]
                        disabled:shadow-[4px_4px_0_#25080b]
                    "
                >
                    {creating ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#eee2d5] border-t-transparent" />
                            OPENING CHANNEL...
                        </>
                    ) : (
                        <>
                            <Users size={17} strokeWidth={2.5} />
                            CREATE GROUP TRANSMISSION
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}