import { create } from "zustand";
import { apiGetAuthUser, apiLogout } from "./authApi";
import type { UserInfo } from "../../shared/types";
import { ApiError, getErrorMessage } from "../../shared/apiError";

type AuthState = {
    user: UserInfo | null;
    loadingUser: boolean;
    error: string | null;

    init: () => Promise<void>;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loadingUser: true,
    error: null,

    init: async () => {
        set({
            loadingUser: true,
            error: null
        });

        try {
            await useAuthStore.getState().refreshUser();
        } catch (err) {
            if (ApiError.is(err, "UNAUTHORIZED")) {
                set({ user: null });
                return;
            }

            set({
                user: null,
                error: getErrorMessage(err)
            });
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