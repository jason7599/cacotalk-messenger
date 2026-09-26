import { create } from "zustand";
import { apiGetAuthUser, apiLogout } from "./authApi";
import type { UserInfo } from "../../shared/types";

type AuthState = {
    user: UserInfo | null;
    loadingUser: boolean;

    init: () => Promise<void>;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loadingUser: true,

    init: async () => {
        try {
            await useAuthStore.getState().refreshUser();
        } finally {
            set({ loadingUser: false });
        }
    },

    refreshUser: async () => {
        set({ user: await apiGetAuthUser() });
    },

    logout: async () => {
        await apiLogout();
        set({ user: null });
    }
}));