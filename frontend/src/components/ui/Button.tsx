import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";
import { press } from "./styles";
import Spinner from "./Spinner";

const variants = {
    /** Solid crimson. The main call to action. */
    primary: "border-crimson-bright bg-crimson text-bone shadow-shade-crimson hover:bg-crimson-bright",
    /** Brighter red. Used for the armed "ARE YOU SURE?" state. */
    danger: "border-crimson-hot bg-crimson-bright text-bone shadow-shade-crimson hover:bg-crimson-hot",
    /** Dark with crimson text, fills crimson on hover. */
    secondary: "border-edge-strong bg-raised text-crimson hover:border-crimson-bright hover:bg-crimson hover:text-bone",
    /** Dark and quiet, border lights up on hover. */
    outline: "border-edge bg-pit text-bone hover:border-crimson-bright hover:bg-panel",
};

const sizes = {
    sm: "gap-2 px-3 py-2 text-2xs tracking-label shadow-hard-sm",
    md: "gap-2 px-5 py-3 tracking-caps shadow-hard-lg",
};

export type ButtonVariant = keyof typeof variants;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: keyof typeof sizes;
    /** Icon shown before the label. Replaced by a spinner while loading. */
    icon?: ReactNode;
    loading?: boolean;
};

export default function Button({
    variant = "primary",
    size = "md",
    icon,
    loading = false,
    type = "button",
    className,
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                "flex items-center justify-center border-2 font-bold transition-colors",
                "disabled:pointer-events-none disabled:opacity-50",
                press,
                variants[variant],
                sizes[size],
                className,
            )}
            {...rest}
        >
            {loading ? <Spinner /> : icon}
            {children}
        </button>
    );
}

type ConfirmButtonProps = Omit<ButtonProps, "onClick" | "variant"> & {
    /** Called on the second click. */
    onConfirm: () => void;
    /** Look before it's armed. Once armed it always turns "danger". */
    variant?: Exclude<ButtonVariant, "danger">;
    confirmLabel?: ReactNode;
    /** Label while loading. Defaults to the normal label. */
    loadingLabel?: ReactNode;
};

/** A button that needs two clicks: first click arms it ("ARE YOU SURE?"), second click confirms. */
export function ConfirmButton({
    onConfirm,
    variant = "primary",
    confirmLabel = "ARE YOU SURE?",
    loading,
    loadingLabel,
    children,
    ...rest
}: ConfirmButtonProps) {
    const [armed, setArmed] = useState(false);

    let label = children;
    if (loading) {
        label = loadingLabel ?? children;
    } else if (armed) {
        label = confirmLabel;
    }

    return (
        <Button
            variant={armed ? "danger" : variant}
            loading={loading}
            onClick={() => (armed ? onConfirm() : setArmed(true))}
            {...rest}
        >
            {label}
        </Button>
    );
}
