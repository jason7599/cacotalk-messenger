import type { ReactNode } from "react";

type SidebarListProps = {
    eyebrow: ReactNode;
    title: ReactNode;
    /** Small text at the right of the title, e.g. "UNIT 01". */
    meta?: ReactNode;
    /** Bar under the header (search box, create button...). */
    toolbar?: ReactNode;
    footer: ReactNode;
    /** The scrolling list. */
    children: ReactNode;
};

/** Layout for the sidebar's list panels: header, toolbar, scrolling list, footer. */
export default function SidebarList({ eyebrow, title, meta, toolbar, footer, children }: SidebarListProps) {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="border-b-2 border-edge bg-sunken px-5 py-4">
                <p className="eyebrow mb-1">{eyebrow}</p>

                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl font-black tracking-tight">{title}</h2>
                    {meta && <div className="caption flex items-center gap-2">{meta}</div>}
                </div>
            </header>

            {toolbar && <div className="border-b-2 border-edge bg-panel p-3">{toolbar}</div>}

            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

            <footer className="caption border-t border-edge bg-sunken px-4 py-2">{footer}</footer>
        </div>
    );
}
