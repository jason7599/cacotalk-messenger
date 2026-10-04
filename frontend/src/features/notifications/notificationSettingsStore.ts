import { create } from "zustand";
import { persist } from "zustand/middleware";

type NotificationSettingsState = {
    soundEnabled: boolean;
    /** The user's choice. Desktop alerts also need browser permission, see desktopNotifications.ts */
    desktopEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    setDesktopEnabled: (enabled: boolean) => void;
};

/** Per-browser preferences, saved in localStorage. */
export const useNotificationSettingsStore = create<NotificationSettingsState>()(
    persist(
        (set) => ({
            soundEnabled: true,
            desktopEnabled: false,
            setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
            setDesktopEnabled: (desktopEnabled) => set({ desktopEnabled }),
        }),
        { name: "cacotalk-notifications" },
    ),
);
