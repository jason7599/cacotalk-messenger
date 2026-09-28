import type { ReactNode } from "react";
import { cn } from "./cn";

const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-lg",
    xl: "h-14 w-14 text-xl",
};

const tones = {
    accent: "border-edge-strong text-crimson-bright",
    muted: "border-edge text-faint",
    active: "border-crimson-bright text-crimson-bright",
};

type AvatarProps = {
    /** Shows the first letter. Ignored when `icon` is given. */
    name?: string;
    icon?: ReactNode;
    size?: keyof typeof sizes;
    tone?: keyof typeof tones;
    /** Extra classes, e.g. "group-hover:border-crimson-bright". */
    className?: string;
    /** Overlays, e.g. a status dot. */
    children?: ReactNode;
};

/** Square letter (or icon) avatar. */
export default function Avatar({ name, icon, size = "md", tone = "accent", className, children }: AvatarProps) {
    return (
        <div
            className={cn(
                "relative grid shrink-0 place-items-center border-2 bg-sunken font-black shadow-hard-sm transition-colors",
                sizes[size],
                tones[tone],
                className,
            )}
        >
            {icon || name?.charAt(0).toUpperCase()}
            {children}
        </div>
    );
}
