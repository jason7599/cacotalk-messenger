// features/messages/components/ReactionList.tsx
import { cn } from "../../../../components/ui";
import type { MessageReaction } from "../../types";
import { REACTIONS, REACTION_TYPES, type ReactionType } from "../reactions";

type ReactionListProps = {
    reactions: MessageReaction[];
    myId: number;
    onToggle: (type: ReactionType) => void;
    /** Locked conversations: still show reactions, but they can't be changed. */
    disabled: boolean;
    onShowAll: () => void;
    align: "start" | "end";
    className?: string;
};

/** How many names a row shows before collapsing into "and N more". */
const MAX_NAMES = 3;

/** "Bella, Chella, Aella, and 3 more". One leftover is just named instead of "and 1 more". */
function formatNames(names: string[]): { shown: string; more: number } {
    if (names.length <= MAX_NAMES + 1) return { shown: names.join(", "), more: 0 };
    return { shown: names.slice(0, MAX_NAMES).join(", "), more: names.length - MAX_NAMES };
}

export default function ReactionList({ reactions, myId, onToggle, disabled, onShowAll, align, className }: ReactionListProps) {
    const groups = REACTION_TYPES
        .map((type, order) => ({ type, order, users: reactions.filter((r) => r.type === type) }))
        .filter((g) => g.users.length > 0)
        // most reacted first; ties keep the enum order so rows don't swap places randomly
        .sort((a, b) => b.users.length - a.users.length || a.order - b.order);

    if (groups.length === 0) return null;

    // only offer "see all" when some row actually collapsed into "and N more"
    const hasHidden = groups.some((g) => g.users.length > MAX_NAMES + 1);

    return (
        <ul
            className={cn(
                "-mt-px flex px-3",
                align === "end" ? "justify-end" : "justify-start",
                className,
            )}
        >
            <ul
                className={cn(
                    // a tray hanging off the bottom of the bubble: boxed, tucked up under it
                    "relative flex min-w-0 flex-col divide-y divide-edge",
                    "border-2 border-t-0 border-edge bg-pit shadow-hard",
                )}
            >
                {groups.map(({ type, users }) => {
                    const mine = users.some((u) => u.userId === myId);
                    const { shown, more } = formatNames(users.map((u) => u.username));

                    return (
                        <li key={type}>
                            <button
                                type="button"
                                onClick={() => onToggle(type)}
                                disabled={disabled}
                                aria-pressed={mine}
                                aria-label={`${type.toLowerCase()}, ${users.length}: ${users.map((u) => u.username).join(", ")}`}
                                className={cn(
                                    "flex w-full min-w-0 items-center gap-2 py-1 pl-1.5 pr-2.5 text-left text-xs",
                                    // your reaction gets a crimson mark on the edge
                                    "border-l-2",
                                    mine ? "border-crimson-bright" : "border-transparent",
                                    mine ? "bg-crimson-bright" : "hover:bg-crimson",
                                    "disabled:pointer-events-none",
                                )}
                            >
                                <span className="w-5 shrink-0 text-center text-sm leading-none">{REACTIONS[type]}</span>
                                <span className="min-w-0 truncate">
                                    <span className={mine ? "text-bone" : "text-muted"}>{shown}</span>
                                    {more > 0 && <span className="text-faint">, and {more} more</span>}
                                </span>
                            </button>
                        </li>
                    );
                })}

                {/* viewing is always allowed, even when the conversation is locked */}
                {hasHidden && (
                    <li>
                        <button
                            type="button"
                            onClick={onShowAll}
                            className="w-full border-l-2 border-transparent py-1 pl-1.5 pr-2.5 text-left text-3xs font-bold tracking-label text-faint hover:bg-panel hover:text-crimson-bright"
                        >
                            SEE ALL REACTIONS
                        </button>
                    </li>
                )}
            </ul>
        </ul>
    );
}