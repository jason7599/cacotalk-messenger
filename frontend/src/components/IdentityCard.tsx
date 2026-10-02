import { useAuthStore } from "../features/auth/authStore";
import { Avatar, cn } from "./ui";

/** "ACTIVE OPERATOR" card for the logged-in user. Bottom of the sidebar on desktop, the Self tab on mobile. */
export default function IdentityCard({ className }: { className?: string }) {
    const user = useAuthStore((s) => s.user!);

    return (
        <div className={cn("relative overflow-hidden border-b-2 border-edge-strong bg-sunken p-4", className)}>
            <div className="pointer-events-none absolute right-3 top-2 text-3xs font-bold tracking-caps text-edge-soft">
                IDENTITY // VERIFIED
            </div>

            <div className="flex items-center gap-4">
                <Avatar name={user.username} size="xl" tone="active">
                    <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border border-sunken bg-crimson-bright" />
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p className="text-3xs font-bold tracking-caps text-crimson">ACTIVE OPERATOR</p>

                    <p className="mt-0.5 truncate text-lg font-black tracking-tight">{user.username}</p>

                    <div className="mt-1 flex items-center gap-2 text-3xs tracking-label text-faint">
                        <span>STATUS</span>
                        <span className="h-px w-4 bg-edge" />
                        <span className="font-bold text-muted">CONNECTED</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
