import type { ReactNode } from "react";

type SectionProps = {
    /** Shown as "01", "02", ... */
    index: number;
    title: ReactNode;
    /** Optional small content at the right end of the heading line (e.g. a count). */
    aside?: ReactNode;
    children: ReactNode;
};

/** A numbered section:  01  TITLE ─────────── aside */
export default function Section({ index, title, aside, children }: SectionProps) {
    return (
        <section>
            <div className="mb-3 flex items-center gap-3">
                <span className="text-xs font-bold tracking-caps text-crimson">
                    {String(index).padStart(2, "0")}
                </span>

                <h3 className="text-sm font-bold tracking-caps">{title}</h3>

                <div className="h-px flex-1 bg-edge" />

                {aside}
            </div>

            {children}
        </section>
    );
}
