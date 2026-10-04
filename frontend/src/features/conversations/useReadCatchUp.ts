import { useEffect } from "react";
import { isAttending } from "../../shared/attention";
import { useActiveConversationStore } from "./activeConversationStore";
import { closeDesktopNotifications } from "../notifications/desktopNotifications";

/**
 * Messages that arrive while the window is unfocused stay unread (see upsertMessage).
 * This marks them read the moment the user comes back, and clears any desktop
 * notifications that are now stale. Mount once, in MainPage.
 */
export function useReadCatchUp() {
    useEffect(() => {
        const onAttentionChange = () => {
            if (!isAttending()) return;

            useActiveConversationStore.getState().catchUpReads();
            closeDesktopNotifications();
        };

        window.addEventListener("focus", onAttentionChange);
        document.addEventListener("visibilitychange", onAttentionChange);

        return () => {
            window.removeEventListener("focus", onAttentionChange);
            document.removeEventListener("visibilitychange", onAttentionChange);
        };
    }, []);
}
