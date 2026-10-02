import { ArrowLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";
import IconButton from "./IconButton";

// Phones: always full width (the modal is a bottom sheet there).
const widths = {
    sm: "w-full md:w-115 md:max-w-[90vw]",
    md: "w-full md:w-130 md:max-w-[90vw]",
    lg: "w-full md:w-180 md:max-w-[92vw]",
};

type ModalFrameProps = {
    size?: keyof typeof widths;
    children: ReactNode;
};

/** Sets the width of a modal's content. Wrap every modal's content in this. */
export function ModalFrame({ size = "sm", children }: ModalFrameProps) {
    return <div className={cn(widths[size], "text-bone")}>{children}</div>;
}

type ModalHeaderProps = {
    /** Small red label above the title. */
    eyebrow?: ReactNode;
    title: ReactNode;
    /** Hover tooltip for the title (useful when it may be truncated). */
    titleTooltip?: string;
    /** Small dim text next to the title, e.g. a count. */
    meta?: ReactNode;
    subtitle?: ReactNode;
    onClose: () => void;
    closeDisabled?: boolean;
    /** Shows a back arrow on the left when given. */
    onBack?: () => void;
};

export function ModalHeader({
    eyebrow,
    title,
    titleTooltip,
    meta,
    subtitle,
    onClose,
    closeDisabled,
    onBack,
}: ModalHeaderProps) {
    return (
        <header className="mb-6 border-b-2 border-edge-strong pb-5 short:mb-4 short:pb-3">
            <div className="flex items-start gap-4">
                {onBack && (
                    <IconButton onClick={onBack} aria-label="Back">
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </IconButton>
                )}

                <div className="min-w-0 flex-1">
                    {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}

                    <div className="flex items-end gap-3">
                        <h2 className="truncate text-2xl font-black tracking-tight" title={titleTooltip}>
                            {title}
                        </h2>

                        {meta && <span className="caption shrink-0 pb-1">{meta}</span>}
                    </div>

                    {subtitle && (
                        <p className="mt-2 text-xs tracking-widest text-muted">{subtitle}</p>
                    )}
                </div>

                <IconButton onClick={onClose} disabled={closeDisabled} aria-label="Close">
                    <X size={18} strokeWidth={2.5} />
                </IconButton>
            </div>
        </header>
    );
}
