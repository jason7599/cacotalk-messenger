import { Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: string;
    onChange: (value: string) => void;
    /** Extra content at the right end (clear button, spinner...). */
    trailing?: ReactNode;
    /** Classes for the outer box (e.g. margins). */
    className?: string;
};

/** Text input with a magnifier icon. */
export default function SearchInput({ value, onChange, trailing, className, ...inputProps }: SearchInputProps) {
    return (
        <label className={cn("field flex items-center gap-2 px-3", className)}>
            <Search size={16} strokeWidth={2.3} className="shrink-0 text-faint" />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-xs outline-none"
                {...inputProps}
            />

            {trailing}
        </label>
    );
}
