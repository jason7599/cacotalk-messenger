import { UserPlus, Users, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { EmptyState, SearchInput, Section, Spinner, cn, press } from "../../../components/ui";
import type { MemberSelection } from "../useMemberSelection";

type MemberPickerProps = {
    /** From useMemberSelection(). */
    selection: MemberSelection;
    /** How many must be picked. */
    min: number;
    /** How many can be picked. */
    max: number;
    /** Small explanation above the list of available users. */
    hint: ReactNode;
    /** Word after the counter, e.g. "12 / 99 MEMBERS". */
    countLabel: string;
};

/**
 * The shared "pick some souls" UI: 01 search, 02 available users grid, 03 selected chips.
 * Used by CreateGroupModal and InviteMembersModal.
 */
export default function MemberPicker({ selection, min, max, hint, countLabel }: MemberPickerProps) {
    const { users, selected, selectedUsers, loading, toggle } = selection;

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return users;
        }

        return users.filter((user) => user.username.toLowerCase().includes(normalized));
    }, [users, query]);

    const count = selected.size;
    const isValid = min <= count && count <= max;
    const isFull = count >= max;

    return (
        <>
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
                aside={!loading && <span className="caption">{filtered.length} FOUND</span>}
            >
                <p className="mb-3 text-xs font-bold leading-relaxed text-faint">{hint}</p>

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
                                        disabled={!checked && isFull}
                                        onClick={() => toggle(user.userId)}
                                        className={cn(
                                            "flex min-w-0 items-center gap-3 border-2 p-3 text-left shadow-hard-md",
                                            "disabled:cursor-not-allowed disabled:opacity-40",
                                            press,
                                            checked
                                                ? "border-crimson-bright bg-crimson-deep text-bone shadow-shade-crimson"
                                                : "border-edge bg-pit text-muted enabled:hover:border-crimson enabled:hover:bg-panel enabled:hover:text-bone",
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

                                        <span className="min-w-0 truncate text-xs font-bold">{user.username}</span>
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
                    <span className={cn("text-2xs font-bold tracking-label", isValid ? "text-crimson" : "text-faint")}>
                        {count} / {max} {countLabel}
                    </span>
                }
            >
                {!isValid && (
                    <p className="mb-3 text-xs font-bold text-faint">
                        {limitMessage(min, max)}
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
                                    onClick={() => toggle(user.userId)}
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
        </>
    );
}

function limitMessage(min: number, max: number) {
    if (max < min) {
        return "NO ROOM FOR MORE SOULS IN THIS CHANNEL.";
    }

    if (min === max) {
        return `Select ${min} ${min === 1 ? "soul" : "souls"}.`;
    }

    return `Select ${min}–${max} souls.`;
}
