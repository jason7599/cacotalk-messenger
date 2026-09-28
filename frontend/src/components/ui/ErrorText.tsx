import type { ReactNode } from "react";
import { cn } from "./cn";

/** Red-ruled error line. */
export default function ErrorText({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p role="alert" className={cn("border-l-2 border-crimson-hot pl-3 text-sm text-error", className)}>
            {children}
        </p>
    );
}
