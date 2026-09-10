import type { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
    return (
        <div
            className="
				fixed inset-0 z-50
				grid place-items-center
				bg-black/70
			"
        >
            <div
                className="
					min-w-80
					border-2 border-red-800
					bg-[#2a1616]
					p-5
					text-red-100
					shadow-[6px_6px_0_#120606]
				"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}