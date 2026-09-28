import { UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import type { UserInfo } from "../../../shared/types";
import { apiGetInvitableUsers } from "../../userRelations/userRelationsApi";
import { ApiError, getErrorMessage } from "../../../shared/apiError";
import { apiCreateGroupConversation } from "../conversationsApi";
import { useActiveConversationStore } from "../activeConversationStore";
import { Button, EmptyState, ErrorText, ModalFrame, ModalHeader, SearchInput, Section, Spinner, cn, press } from "../../../components/ui";

// excluding user.
const MIN_INVITE_COUNT = 2;
const MAX_INVITE_COUNT = 99;

export default function CreateGroupModal() {
    const { closeModal } = useModal();

    const setActiveConversation = useActiveConversationStore((s) => s.setActiveConversation);

    const [users, setUsers] = useState<UserInfo[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");

    const canCreate =
        MIN_INVITE_COUNT <= selected.size &&
        selected.size <= MAX_INVITE_COUNT
    ;

    async function loadInvitableUsers() {
        const nextUsers = await apiGetInvitableUsers();
        setUsers(nextUsers);

        const validIds = new Set(
            nextUsers.map((user) => user.userId)
        );

        setSelected((current) => {
            const next = new Set(
                [...current].filter((id) => validIds.has(id))
            );

            return next;
        });
    }

    useEffect(() => {
        async function load() {
            setError(null);

            try {
                await loadInvitableUsers();
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }

        load();
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
        setError(null);

        try {
            const id = await apiCreateGroupConversation(
                Array.from(selected)
            );

            await setActiveConversation(id);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        
            if (ApiError.is(err, "MEMBERS_NOT_INVITABLE")) {
                try {
                    await loadInvitableUsers();
                } catch {
                    // Preserve the original create error.
                }
            }
        } finally {
            setCreating(false);
        }
    }

    return (
        <ModalFrame size="lg">
            <ModalHeader
                eyebrow="ESTABLISH NEW CHANNEL"
                title="GROUP TRANSMISSION"
                subtitle="ASSEMBLE THE SOULS TO BE BOUND TO THIS CHANNEL."
                onClose={closeModal}
                closeDisabled={creating}
            />

            {error && <ErrorText className="mb-6">{error}</ErrorText>}

            <div className="flex flex-col gap-6 short:gap-4">
                <Section index={1} title="LOCATE SOULS">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="SEARCH SOULS..."
                        trailing={query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                                className="shrink-0 text-faint hover:text-crimson-bright"
                            >
                                <X size={15} strokeWidth={2.4} />
                            </button>
                        )}
                    />
                </Section>

                <Section
                    index={2}
                    title="AVAILABLE SOULS"
                    aside={!loading && (
                        <span className="caption">{filtered.length} FOUND</span>
                    )}
                >
                    <p className="mb-3 text-xs font-bold leading-relaxed text-faint">
                        Your contacts eligible for this group are shown below.
                        Contacts who have blocked you are excluded.
                    </p>

                    <div className="max-h-72 overflow-y-auto border-2 border-edge bg-void p-3 short:max-h-44">
                        {loading ? (
                            <div className="flex min-h-40 items-center justify-center gap-3 text-xs tracking-label text-muted">
                                <Spinner className="text-crimson" />
                                SEARCHING THE PIT...
                            </div>
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={<Users size={22} strokeWidth={2.2} />}
                                title="NO SOULS FOUND"
                                subtitle="THE SUMMONING CIRCLE YIELDS NOTHING."
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {filtered.map((user) => {
                                    const checked = selected.has(user.userId);

                                    return (
                                        <button
                                            key={user.userId}
                                            type="button"
                                            aria-pressed={checked}
                                            onClick={() => toggleUser(user.userId)}
                                            className={cn(
                                                "flex min-w-0 items-center gap-3 border-2 p-3 text-left shadow-hard-md",
                                                press,
                                                checked
                                                    ? "border-crimson-bright bg-crimson-deep text-bone shadow-shade-crimson"
                                                    : "border-edge bg-pit text-muted hover:border-crimson hover:bg-panel hover:text-bone",
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "grid h-8 w-8 shrink-0 place-items-center border",
                                                    checked
                                                        ? "border-crimson-bright bg-crimson text-bone"
                                                        : "border-edge-strong bg-panel text-crimson",
                                                )}
                                            >
                                                <UserPlus size={15} strokeWidth={2.4} />
                                            </div>

                                            <span className="min-w-0 truncate text-xs font-bold">
                                                {user.username}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Section>

                <Section
                    index={3}
                    title="BOUND SOULS"
                    aside={
                        <span className={cn("text-2xs font-bold tracking-label", canCreate ? "text-crimson" : "text-faint")}>
                            {selected.size} / {MAX_INVITE_COUNT} MEMBERS
                        </span>
                    }
                >
                    {!canCreate && (
                        <p className="mb-3 text-xs font-bold text-faint">
                            Select {MIN_INVITE_COUNT}–{MAX_INVITE_COUNT} souls.
                        </p>
                    )}

                    <div className="max-h-28 min-h-16 overflow-y-auto border-2 border-edge bg-pit p-3 short:max-h-20">
                        {selectedUsers.length === 0 ? (
                            <p className="flex min-h-10 items-center justify-center text-2xs tracking-label text-dim">
                                NO SOULS HAVE BEEN BOUND.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((user) => (
                                    <button
                                        key={user.userId}
                                        type="button"
                                        onClick={() => toggleUser(user.userId)}
                                        className="flex min-w-0 items-center gap-2 border border-edge-strong bg-panel px-2.5 py-1.5 text-xs font-bold text-ash hover:border-crimson-bright hover:text-bone"
                                    >
                                        <span className="max-w-40 truncate">{user.username}</span>
                                        <X size={13} strokeWidth={2.5} className="shrink-0 text-crimson" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>

                <Button
                    disabled={!canCreate || creating}
                    loading={creating}
                    onClick={handleCreate}
                    icon={<Users size={17} strokeWidth={2.5} />}
                    className="w-full"
                >
                    {creating ? "OPENING CHANNEL..." : "CREATE GROUP TRANSMISSION"}
                </Button>
            </div>
        </ModalFrame>
    );
}
