import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "./buttonStyles";
import Spinner from "./Spinner";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
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
            className={buttonClassName(variant, size, className)}
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
