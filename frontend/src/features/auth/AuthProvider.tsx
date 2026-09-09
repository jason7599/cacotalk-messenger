import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthUser, type AuthUserResponse } from "./authApi";

type AuthContextValue = {
    user: AuthUserResponse | null;
    loadingUser: boolean;
    refreshUser: () => Promise<void>;
    setUser: (user: AuthUserResponse | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUserResponse | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    async function refreshUser() {
        try {
            setUser((await getAuthUser()));
        } catch (err) {
            console.log(err);
            throw err;
        }
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
                setUser,
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
