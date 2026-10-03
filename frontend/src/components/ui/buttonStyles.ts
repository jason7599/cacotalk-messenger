import { cn } from "./cn";
import { press } from "./styles";

export const variants = {
    /** Solid crimson. The main call to action. */
    primary: "border-crimson-bright bg-crimson text-bone shadow-shade-crimson hover:bg-crimson-bright",
    /** Brighter red. Used for the armed "ARE YOU SURE?" state. */
    danger: "border-crimson-hot bg-crimson-bright text-bone shadow-shade-crimson hover:bg-crimson-hot",
    /** Dark with crimson text, fills crimson on hover. */
    secondary: "border-edge-strong bg-raised text-crimson hover:border-crimson-bright hover:bg-crimson hover:text-bone",
    /** Dark and quiet, border lights up on hover. */
    outline: "border-edge bg-pit text-bone hover:border-crimson-bright hover:bg-panel",
};

export const sizes = {
    sm: "gap-2 px-3 py-2 text-2xs tracking-label shadow-hard-sm",
    md: "gap-2 px-5 py-3 tracking-caps shadow-hard-lg",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

/** Button styling as a class string, for things that must be a different element (e.g. an <a> link). */
export function buttonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
    return cn(
        "flex items-center justify-center border-2 font-bold transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        press,
        variants[variant],
        sizes[size],
        className,
    );
}
