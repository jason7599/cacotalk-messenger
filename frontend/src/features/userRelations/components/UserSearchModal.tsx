import { Search, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useContactsStore } from "../contactsStore";
import { apiSearchUsers } from "../userRelationsApi";
import { useModal } from "../../../components/ModalProvider";
import { getErrorMessage } from "../../../shared/apiClient";
import type { UserSearchResponse } from "../types";

const SEARCH_QUERY_MIN_LENGTH = 3;
const SEARCH_QUERY_MAX_LENGTH = 32;
const SEARCH_DEBOUNCE_MS = 350;

export default function UserSearchModal() {
    const { closeModal } = useModal();

    const addContact = useContactsStore((state) => state.addContact);
    const addingIds = useContactsStore((state) => state.addingIds);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserSearchResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // stale result guard
    const searchIdRef = useRef(0);

    useEffect(() => {
        const trimmed = query.trim();

        // invalidate any previous request
        const searchId = ++searchIdRef.current;

        if (trimmed.length < SEARCH_QUERY_MIN_LENGTH) {
            setResults([]);
            setError(null);
            setIsSearching(false);
            setHasSearched(false);
            return;
        }

        if (trimmed.length > SEARCH_QUERY_MAX_LENGTH) {
            setResults([]);
            setError(
                `USERNAME MUST BE ${SEARCH_QUERY_MIN_LENGTH}-${SEARCH_QUERY_MAX_LENGTH} CHARACTERS.`
            );
            setIsSearching(false);
            setHasSearched(false);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            setError(null);
            setIsSearching(true);

            try {
                const users = await apiSearchUsers(trimmed);

                // Query changed while this request was running.
                if (searchId !== searchIdRef.current) {
                    return;
                }

                setResults(users);
                setHasSearched(true);
            } catch (err) {
                if (searchId !== searchIdRef.current) {
                    return;
                }

                setResults([]);
                setError(getErrorMessage(err));
                setHasSearched(true);
            } finally {
                if (searchId === searchIdRef.current) {
                    setIsSearching(false);
                }
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [query]);

    async function handleAdd(user: UserSearchResponse) {
        try {
            await addContact(user.userId);

            setResults((current) =>
                current.map((result) =>
                    result.userId === user.userId
                        ? { ...result, relation: "CONTACT" }
                        : result
                )
            );
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }

    return (
        <div className="w-130 max-w-[90vw] text-[#eee2d5]">

            <header className="mb-6 border-b-2 border-[#64141b] pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 text-xs tracking-[0.2em] text-[#a71924]">
                            SOUL ACQUISITION
                        </p>

                        <h2 className="text-2xl font-black">
                            SEARCH THE DAMNED
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close user search"
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
                        "
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <label
                className="
                    mb-5 flex items-center gap-2
                    border-2 border-[#4b1b1f]
                    bg-[#0c0506]
                    px-3
                    focus-within:border-[#e02632]
                "
            >
                <Search
                    size={17}
                    strokeWidth={2.3}
                    className="shrink-0 text-[#7f6668]"
                />

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    maxLength={SEARCH_QUERY_MAX_LENGTH}
                    autoFocus
                    placeholder="USERNAME..."
                    className="
                        min-w-0 flex-1
                        bg-transparent
                        py-3
                        text-sm
                        outline-none
                        placeholder:text-[#5f4548]
                    "
                />

                {isSearching && (
                    <span className="h-4 w-4 animate-spin border-2 border-[#e02632] border-t-transparent" />
                )}
            </label>

            {error && (
                <p className="mb-4 border-l-2 border-[#ff4b55] pl-3 text-sm text-[#ff7b73]">
                    {error}
                </p>
            )}

            <div
                className="
                    min-h-40 max-h-96
                    overflow-y-auto
                    border-2 border-[#4b1b1f]
                    bg-[#100708]
                "
            >
                {results.length === 0 && !isSearching ? (
                    <div className="px-4 py-8 text-center text-xs text-[#7f6668]">
                        {hasSearched
                            ? "NO SOULS LOCATED."
                            : `ENTER AT LEAST ${SEARCH_QUERY_MIN_LENGTH} CHARACTERS.`
                        }
                    </div>
                ) : (
                    results.map((user) => {
                        const isAdding = addingIds.has(user.userId);

                        return (
                            <div
                                key={user.userId}
                                className="
                                    flex items-center gap-3
                                    border-b border-[#4b1b1f]
                                    px-4 py-3
                                    last:border-b-0
                                "
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold">
                                        {user.username}
                                    </p>
                                </div>

                                {user.relation === "NONE" && (
                                    <button
                                        type="button"
                                        onClick={() => handleAdd(user)}
                                        disabled={isAdding}
                                        className="
                                            flex items-center gap-2
                                            border-2 border-[#64141b]
                                            bg-[#190b0d]
                                            px-3 py-2
                                            text-xs font-bold
                                            text-[#a71924]
                                            hover:border-[#e02632]
                                            hover:bg-[#a71924]
                                            hover:text-[#eee2d5]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        <UserPlus size={15} />

                                        {isAdding ? "ADDING..." : "ADD"}
                                    </button>
                                )}

                                {user.relation === "CONTACT" && (
                                    <span className="text-[10px] tracking-[0.14em] text-[#9f8581]">
                                        CONTACT
                                    </span>
                                )}

                                {user.relation === "BLOCKED" && (
                                    <span className="text-[10px] tracking-[0.14em] text-[#e02632]">
                                        BLOCKED
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}