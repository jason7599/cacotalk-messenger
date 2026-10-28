// features/messages/components/ReactionPicker.tsx
import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "../../../components/ui";
import { REACTIONS, REACTION_TYPES, type ReactionType } from "../reactions";

type ReactionPickerProps = {
    /** The viewer's current reaction on this message, highlighted in the circle. */
    current: ReactionType | null;
    onSelect: (type: ReactionType) => void;
    onClose: () => void;
    /** The button the circle is summoned around; clicks on it aren't treated as "outside". */
    anchorRef: RefObject<HTMLElement | null>;
    className?: string;
};

/** Size of each reaction cell, in px. */
const CELL = 36;

type Point = { x: number; y: number };

function starPath(pts: Point[]): string {
    const n = pts.length;
    if (n < 3) return "";

    const seen = new Set<number>();
    let d = "";
    for (let s = 0; s < n; s++) {
        if (seen.has(s)) continue;
        let i = s;
        seen.add(i);
        d += `M${pts[i].x} ${pts[i].y}`;
        do {
            i = (i + 2) % n;
            seen.add(i);
            d += `L${pts[i].x} ${pts[i].y}`;
        } while (i !== s);
    }
    return d;
}

export default function ReactionPicker({ current, onSelect, onClose, anchorRef, className }: ReactionPickerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<ReactionType | null>(null);

    // close on outside click or Escape
    useEffect(() => {
        function onPointerDown(e: PointerEvent) {
            const target = e.target as Node;
            if (ref.current?.contains(target) || anchorRef.current?.contains(target)) return;
            onClose();
        }
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [anchorRef, onClose]);

    // geometry: reactions sit on a ring, first one at the bottom (inverted pentagram)
    const n = REACTION_TYPES.length;
    const radius = Math.max(60, Math.round((n * 44) / (2 * Math.PI)) + 6);
    const discR = radius + CELL / 2 + 4;
    const size = discR * 2.2;
    const c = size / 2;

    const points: Point[] = REACTION_TYPES.map((_, i) => {
        const a = Math.PI / 2 + (i * 2 * Math.PI) / n;
        return {
            x: Math.round((c + radius * Math.cos(a)) * 100) / 100,
            y: Math.round((c + radius * Math.sin(a)) * 100) / 100,
        };
    });

    const label = hovered ?? current;

    return (
        <div
            ref={ref}
            role="toolbar"
            aria-label="Pick a reaction"
            onMouseLeave={() => setHovered(null)}
            style={{ width: size, height: size }}
            className={cn(
                // centred on whatever relative box it's dropped into (the react button's wrapper)
                "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                className,
            )}
        >
            {/* the disc */}
            <div aria-hidden className="pointer-events-auto absolute inset-0 rounded-full bg-void/90 ring-1 ring-edge" />

            {/* the sigil */}
            <svg aria-hidden viewBox={`0 0 ${size} ${size}`} className="pointer-events-none absolute inset-0 h-full w-full">
                <circle cx={c} cy={c} r={radius} strokeWidth={1.3} className="fill-none stroke-crimson" />
                <path
                    d={starPath(points)}
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="fill-none stroke-crimson"
                />
            </svg>

            {/* the offerings, one on each point */}
            {REACTION_TYPES.map((type, i) => {
                const active = type === current;
                const p = points[i];

                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => { onSelect(type); onClose(); }}
                        onMouseEnter={() => setHovered(type)}
                        aria-label={type.toLowerCase()}
                        aria-pressed={active}
                        style={{ left: p.x, top: p.y, width: CELL, height: CELL }}
                        className={cn(
                            "pointer-events-auto absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-void text-lg leading-none outline-none ring-1 ring-edge hover:bg-panel hover:ring-crimson-bright",
                            active && "bg-crimson-deep ring-crimson-bright hover:bg-crimson-deep",
                        )}
                    >
                        {REACTIONS[type]}
                    </button>
                );
            })}

            {/* name plate under the circle */}
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap",
                    "border border-edge-strong bg-void px-2 py-0.5 text-2xs font-bold tracking-[0.25em] text-crimson-bright shadow-hard",
                    label ? "visible" : "invisible",
                )}
            >
                {label ? label.replace(/_/g, " ") : "\u00a0"}
            </div>
        </div>
    );
}