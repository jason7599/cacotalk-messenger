import type { ReactNode } from "react";

type ActionCardProps = {
    title: ReactNode;
    description?: ReactNode;
    /** Stacked below the description, 16px apart (warnings, checkboxes, the action button...). */
    children?: ReactNode;
};

/** Bordered card with a bold title, a short description, and usually an action button. */
export default function ActionCard({ title, description, children }: ActionCardProps) {
    return (
        <div className="border-2 border-edge-strong bg-panel p-4 shadow-hard-lg">
            <p className="font-bold">{title}</p>

            {description && (
                <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
            )}

            {children && <div className="mt-4 flex flex-col gap-4">{children}</div>}
        </div>
    );
}
