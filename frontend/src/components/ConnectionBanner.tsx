import { RotateCw, Skull, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useBootstrap } from "../shared/BootstrapProvider";
import { Button, Spinner, cn } from "./ui";

// wait a bit after drop before showing the banner 
const SHOW_RECONNECTING_AFTER_MS = 1500;
// how long to show the "restored" message after resolved
const RESTORED_VISIBLE_MS = 2500;

/**
 * Floating connection status pill at the top of the screen, above everything
 * (modals included). Hidden while connected.
 */
export default function ConnectionBanner() {
    const { connectionStatus, failedAttempts, nextRetryAt, retryNow } = useBootstrap();

    const [graceOver, setGraceOver] = useState(false);
    const [showRestored, setShowRestored] = useState(false);
    // Did the user actually see a problem since the last time we were connected?
    const [sawProblem, setSawProblem] = useState(false);
    const [prevStatus, setPrevStatus] = useState(connectionStatus);
    const [now, setNow] = useState(() => Date.now());

    const isReconnecting = connectionStatus === "RECONNECTING" && (graceOver || failedAttempts > 0);
    const isOffline = connectionStatus === "OFFLINE";

    if (prevStatus !== connectionStatus) {
        setPrevStatus(connectionStatus);
        setGraceOver(false);

        // Only say "restored" if the user saw something was wrong.
        setShowRestored(connectionStatus === "CONNECTED" && sawProblem);
        if (connectionStatus === "CONNECTED") {
            setSawProblem(false);
        }
    }

    if ((isReconnecting || isOffline) && !sawProblem) {
        setSawProblem(true);
    }

    // Grace period before showing the first "reconnecting".
    useEffect(() => {
        if (connectionStatus !== "RECONNECTING") return;

        const id = window.setTimeout(() => setGraceOver(true), SHOW_RECONNECTING_AFTER_MS);
        return () => window.clearTimeout(id);
    }, [connectionStatus]);

    // Hide "restored" after a moment.
    useEffect(() => {
        if (!showRestored) return;

        const id = window.setTimeout(() => setShowRestored(false), RESTORED_VISIBLE_MS);
        return () => window.clearTimeout(id);
    }, [showRestored]);

    // Keep the countdown ticking while a retry is scheduled.
    useEffect(() => {
        if (nextRetryAt === null) return;

        const id = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(id);
    }, [nextRetryAt]);

    if (!isReconnecting && !isOffline && !showRestored) {
        return null;
    }

    const secondsLeft = nextRetryAt === null ? 0 : Math.max(0, Math.ceil((nextRetryAt - now) / 1000));

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "fixed left-1/2 top-3 z-60 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 border-2 px-4 py-2 text-2xs font-bold tracking-caps shadow-hard-lg",
                isOffline
                    ? "border-crimson-bright bg-raised text-bone shadow-shade-crimson"
                    : "border-edge-strong bg-panel text-muted",
            )}
        >
            {showRestored && !isReconnecting && !isOffline ? (
                <>
                    <Zap size={14} strokeWidth={2.5} className="shrink-0 text-crimson-bright" />
                    LINK RESTORED
                </>
            ) : isReconnecting ? (
                <>
                    <Spinner size="sm" className="text-crimson" />
                    <span>
                        LINK LOST <span className="text-edge">//</span> RECONNECTING...
                    </span>
                </>
            ) : (
                <>
                    <Skull size={14} strokeWidth={2.5} className="shrink-0 animate-pulse text-crimson-bright" />

                    <span className="truncate">
                        THE UNDERWORLD SEEMS DOWN"
                        <span className="text-edge-strong">//</span>{" "}
                        <span className="text-muted">RETRYING IN {secondsLeft}s</span>
                    </span>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={retryNow}
                        icon={<RotateCw size={12} strokeWidth={2.5} />}
                        className="ml-1 shrink-0"
                    >
                        RETRY NOW
                    </Button>
                </>
            )}
        </div>
    );
}
