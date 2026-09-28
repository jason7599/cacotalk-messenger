import type { ReactNode } from "react";

type CheckboxCardProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    title: ReactNode;
    /** Description under the title. */
    children: ReactNode;
};

/** A whole card that acts as a checkbox, with a square custom tick. */
export default function CheckboxCard({ checked, onChange, disabled, title, children }: CheckboxCardProps) {
    return (
        <label className="flex cursor-pointer items-start gap-3 border-2 border-edge bg-sunken p-4 transition-colors hover:border-edge-strong hover:bg-panel">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
            />

            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 border-edge-strong bg-pit shadow-hard-sm transition-colors peer-checked:border-crimson-bright peer-checked:bg-crimson peer-checked:shadow-shade-crimson peer-disabled:opacity-40">
                {checked && <span className="h-2 w-2 bg-bone" />}
            </span>

            <span className="min-w-0">
                <span className="block text-xs font-bold tracking-label text-ash">{title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-faint">{children}</span>
            </span>
        </label>
    );
}
