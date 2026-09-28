import { Search, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useContactsStore } from "../contactsStore";
import { useBlockedUsersStore } from "../blockedUsersStore";
import { apiSearchUsers } from "../userRelationsApi";
import { useModal } from "../../../components/ModalProvider";
import { getErrorMessage } from "../../../shared/apiError";
import type { UserInfo } from "../../../shared/types";
import { Avatar, Button, EmptyState, ErrorText, ModalFrame, ModalHeader, SearchInput, Spinner } from "../../../components/ui";

const SEARCH_QUERY_MIN_LENGTH = 3;
const SEARCH_QUERY_MAX_LENGTH = 32;
const SEARCH_DEBOUNCE_MS = 350;

export default function UserSearchModal() {
    const { closeModal } = useModal();

    const contactsById = useContactsStore((s) => s.contactsById);
    const addingIds = useContactsStore((s) => s.addingIds);
    const addContact = useContactsStore((s) => s.addContact);

    const blockedUsersById = useBlockedUsersStore((s) => s.blockedUsersById);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserInfo[]>([]);
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

    async function handleAdd(userId: number) {
        try {
            await addContact(userId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }

    return (
        <ModalFrame size="md">
            <ModalHeader
                eyebrow="SOUL ACQUISITION"
                title="SEARCH THE DAMNED"
                onClose={closeModal}
            />

            <SearchInput
                value={query}
                onChange={setQuery}
                maxLength={SEARCH_QUERY_MAX_LENGTH}
                autoFocus
                placeholder="USERNAME..."
                trailing={isSearching && <Spinner className="text-crimson-bright" />}
                className="mb-5"
            />

            {error && <ErrorText className="mb-4">{error}</ErrorText>}

            <div className="max-h-96 min-h-40 overflow-y-auto border-2 border-edge bg-sunken">
                {results.length === 0 && !isSearching ? (
                    <EmptyState
                        icon={<Search size={22} strokeWidth={2.2} />}
                        title={hasSearched ? "NO SOULS LOCATED." : `ENTER AT LEAST ${SEARCH_QUERY_MIN_LENGTH} CHARACTERS.`}
                    />
                ) : (
                    results.map((user) => {
                        const isContact = !!contactsById[user.userId];
                        const isBlocked = !!blockedUsersById[user.userId];
                        
                        const isAdding = addingIds.has(user.userId);

                        return (
                            <div
                                key={user.userId}
                                className="flex items-center gap-3 border-b border-edge bg-panel px-4 py-3 last:border-b-0 hover:bg-panel-hover"
                            >
                                <Avatar name={user.username} />

                                <p className="min-w-0 flex-1 truncate text-sm font-bold">
                                    {user.username}
                                </p>

                                {!isContact && !isBlocked && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleAdd(user.userId)}
                                        disabled={isAdding}
                                        icon={<UserPlus size={14} strokeWidth={2.5} />}
                                    >
                                        {isAdding ? "ADDING..." : "ADD"}
                                    </Button>
                                )}

                                {isContact && (
                                    <span className="text-2xs tracking-label text-muted">CONTACT</span>
                                )}

                                {isBlocked && (
                                    <span className="text-2xs tracking-label text-crimson-bright">BLOCKED</span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </ModalFrame>
    );
}
