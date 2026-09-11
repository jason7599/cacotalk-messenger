import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGetAuthUser, apiLogout, type AuthUserResponse } from "./authApi";

type AuthContextValue = {
    user: AuthUserResponse | null;
    loadingUser: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode })  {
    const [user, setUser] = useState<AuthUserResponse | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    async function refreshUser() {
        try {
            setUser((await apiGetAuthUser()));
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async function logout() {
        await apiLogout();
        setUser(null);
    }

    // init load
    useEffect(() => {
        async function loadAuthUser() {
            try {
                await refreshUser();
            } finally {
                setLoadingUser(false);
            }
        }

        loadAuthUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loadingUser,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
    return ctx;
}
