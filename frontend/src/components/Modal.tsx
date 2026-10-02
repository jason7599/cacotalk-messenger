import type { ReactNode } from "react";

/**
 * Desktop: a centered box. Phones (below md): a full-width sheet that slides up from the bottom.
 */
export default function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-void/70 md:grid md:place-items-center md:justify-normal md:p-4">
            <div
                className="max-h-[92dvh] w-full animate-sheet-up overflow-y-auto border-t-2 border-crimson bg-raised p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:max-h-[calc(100dvh-2rem)] md:w-auto md:animate-none md:border-2 md:shadow-hard-xl md:shadow-void"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
