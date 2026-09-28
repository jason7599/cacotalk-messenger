import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";
import { press } from "./styles";

const variants = {
    /** Grey icon, border + icon turn red on hover. Close/back buttons. */
    default: "border-edge bg-pit text-muted hover:border-crimson-bright hover:text-crimson-bright",
    /** Crimson icon, fills crimson on hover. */
    accent: "border-edge-strong bg-sunken text-crimson hover:border-crimson-bright hover:bg-crimson hover:text-bone",
};

const sizes = {
    sm: "h-7 w-7 border",
    md: "h-8 w-8 border",
    lg: `h-10 w-10 border-2 shadow-hard-md ${press}`,
    xl: `h-11 w-11 border-2 shadow-hard-md ${press}`,
};

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    /** Required, since the button has no visible text. */
    "aria-label": string;
};

/** Square button holding just an icon. */
export default function IconButton({
    variant = "default",
    size = "lg",
    type = "button",
    className,
    children,
    ...rest
}: IconButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                "grid shrink-0 place-items-center transition-colors",
                "disabled:pointer-events-none disabled:opacity-40",
                variants[variant],
                sizes[size],
                className,
            )}
            {...rest}
        >
            {children}
        </button>
    );
}
