import type { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-void/70 p-4">
            <div
                className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-2 border-crimson bg-raised p-5 shadow-hard-xl shadow-void"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
