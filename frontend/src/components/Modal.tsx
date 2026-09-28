import type { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-void/70">
            <div
                className="border-2 border-crimson bg-raised p-5 shadow-hard-xl shadow-void"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
