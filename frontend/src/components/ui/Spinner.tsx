import { cn } from "./cn";

const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-9 w-9",
};

type SpinnerProps = {
    size?: keyof typeof sizes;
    className?: string;
};

/** Spinning ring. Takes the current text color, so color it with text-*. */
export default function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
                sizes[size],
                className,
            )}
        />
    );
}
