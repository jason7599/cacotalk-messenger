/**
 * Joins class names, skipping falsy values:
 *   cn("a", isOn && "b", undefined) -> "a b"
 *
 * Note: this does NOT resolve Tailwind conflicts (e.g. "bg-pit" + "bg-panel").
 * The ui components only accept layout-ish extras (margins, width, etc.) via className.
 */
export function cn(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
