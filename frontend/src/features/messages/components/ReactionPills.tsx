// features/messages/components/ReactionPills.tsx
import { cn } from "../../../components/ui";
import { REACTIONS, REACTION_TYPES, type ReactionType } from "../reactions";
import type { MessageReaction } from "../types"; // ← whatever you named the { userId, username, type } shape

type ReactionPillsProps = {
    reactions: MessageReaction[];
    myId: number;
    onToggle: (type: ReactionType) => void;
    /** Locked conversations: still show reactions, but they can't be changed. */
    disabled?: boolean;
    /** Positioning/alignment only. */
    className?: string;
};

/**
 * Hand-hewn edges: each reaction gets its own slightly lopsided rounding,
 * so the pills look carved rather than machined. Same type → same shape, always.
 */
const SHAPES = [
    "14px 9px 13px 8px / 11px 14px 9px 13px",
    "9px 15px 8px 13px / 14px 9px 13px 10px",
    "13px 11px 15px 7px / 9px 13px 11px 14px",
    "8px 13px 10px 15px / 13px 10px 14px 9px",
    "15px 8px 12px 11px / 10px 14px 8px 13px",
];

export default function ReactionPills({ reactions, myId, onToggle, disabled, className }: ReactionPillsProps) {
    // fixed enum order, so pills never shuffle around as people react
    const groups = REACTION_TYPES
        .map((type, i) => ({ type, shape: SHAPES[i % SHAPES.length], users: reactions.filter((r) => r.type === type) }))
        .filter((g) => g.users.length > 0);

    if (groups.length === 0) return null;

    return (
        <div className={cn("mt-1.5 flex flex-wrap gap-1.5", className)}>
            {groups.map(({ type, shape, users }) => {
                const mine = users.some((u) => u.userId === myId);
                const names = users.map((u) => (u.userId === myId ? "you" : u.username)).join(", ");

                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onToggle(type)}
                        disabled={disabled}
                        title={names}
                        aria-label={`${type.toLowerCase()}: ${names}`}
                        aria-pressed={mine}
                        style={{ borderRadius: shape }}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 text-xs ring-2",
                            // small hard drop shadow, same family as the rest of the app
                            "shadow-[2px_2px_0_0_rgba(0,0,0,0.6)]",
                            "disabled:pointer-events-none",
                            mine
                                ? "bg-crimson-deep text-bone ring-crimson-bright"
                                : "bg-pit text-muted ring-edge hover:text-bone hover:ring-crimson",
                        )}
                    >
                        <span className="text-sm leading-none">{REACTIONS[type]}</span>
                        <span className="font-bold tabular-nums tracking-wider">{users.length}</span>
                    </button>
                );
            })}
        </div>
    );
}