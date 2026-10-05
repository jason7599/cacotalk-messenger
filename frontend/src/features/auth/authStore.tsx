import { create } from "zustand";
import { apiGetAuthUser, apiLogin, apiLogout, apiRegister, type LoginRequest, type RegisterRequest } from "./authApi";
import type { UserInfo } from "../../shared/types";
import { ApiError, getErrorMessage } from "../../shared/apiError";

type AuthState = {
    user: UserInfo | null;
    loadingUser: boolean;
    error: string | null;

    init: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearSession: () => void;

    login: (request: LoginRequest) => Promise<void>;
    register: (request: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
};

/**
 * Tabs in the same browser share the session cookie
 * When one tab logs in/out, broadcast to thee others through this channel
 */
type SessionSyncMessage = "LOGGED_IN" | "LOGGED_OUT";
const channel = new BroadcastChannel("cacotalk-session");

channel.onmessage = (e: MessageEvent<SessionSyncMessage>) => {
    if (e.data === "LOGGED_IN") {
        useAuthStore.getState().init();
    } else {
        useAuthStore.getState().clearSession();
    }
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loadingUser: true,
    error: null,

    init: async () => {
        set({
            loadingUser: true,
            error: null
        });

        try {
            await get().refreshUser();
        } catch (err) {
            if (ApiError.is(err, "UNAUTHORIZED")) {
                set({ user: null });
                return;
            }
            
            // anything else means a server side error
            set({ user: null, error: getErrorMessage(err) });
        } finally {
            set({ loadingUser: false });
        }
    },

    refreshUser: async () => {
        set({ user: await apiGetAuthUser() });
    },

    clearSession: () => {
        set({ user: null });
    },

    login: async (request) => {
        await apiLogin(request);
        await get().refreshUser();
        channel.postMessage("LOGGED_IN" satisfies SessionSyncMessage);
    },

    register: async (request) => {
        await apiRegister(request); // also logs in (sets the cookie)
        await get().refreshUser();
        channel.postMessage("LOGGED_IN" satisfies SessionSyncMessage);
    },

    logout: async () => {
        await apiLogout();
        get().clearSession();
        channel.postMessage("LOGGED_OUT" satisfies SessionSyncMessage);
    },
}));