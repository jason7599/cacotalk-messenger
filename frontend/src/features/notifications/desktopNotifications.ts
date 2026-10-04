/**
 * OS-level popups via the browser Notification API.
 *
 * Limits worth knowing:
 * - Needs permission, and the permission prompt must come from a click (Settings does that).
 * - Needs HTTPS or localhost.
 * - Only works while a CacoTalk tab is open. Closed-tab notifications would need Web Push
 *   (service worker + backend sending pushes), which this doesn't do.
 * - Android Chrome refuses `new Notification()` (it wants a service worker), iOS only allows
 *   it for home-screen installed apps. On those, this quietly does nothing.
 */

export type DesktopPermission = NotificationPermission | "unsupported";

export function getDesktopPermission(): DesktopPermission {
    return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export async function requestDesktopPermission(): Promise<DesktopPermission> {
    if (typeof Notification === "undefined") return "unsupported";

    try {
        return await Notification.requestPermission();
    } catch {
        return Notification.permission;
    }
}

// Open notifications, so they can be cleared when the user comes back
const open = new Set<Notification>();

type DesktopNotificationInput = {
    title: string;
    body: string;
    /** Same tag replaces the previous popup instead of stacking (one per conversation). */
    tag: string;
    onClick: () => void;
};

export function showDesktopNotification({ title, body, tag, onClick }: DesktopNotificationInput) {
    if (getDesktopPermission() !== "granted") return;

    try {
        const n = new Notification(title, { body, tag, icon: "/favicon.png" });
        open.add(n);

        n.onclick = () => {
            window.focus();
            onClick();
            n.close();
        };
        n.onclose = () => open.delete(n);
    } catch {
        // Android Chrome & friends, see above.
    }
}

export function closeDesktopNotifications() {
    for (const n of open) n.close();
    open.clear();
}
