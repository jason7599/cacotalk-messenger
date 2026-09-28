import type { ReactNode } from "react";

type EmptyStateProps = {
    icon: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
};

/** Centered "nothing here" block with a boxed icon. */
export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
    return (
        <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center border-2 border-edge-strong bg-sunken text-crimson shadow-hard-md">
                {icon}
            </div>

            <p className="text-xs font-bold tracking-label text-muted">{title}</p>

            {subtitle && <p className="mt-1 text-2xs text-faint">{subtitle}</p>}
        </div>
    );
}
