import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGetBlockedUsers, apiGetContacts } from "../features/userRelations/userRelationsApi";
import { useContactsStore } from "../features/userRelations/contactsStore";
import { useBlockedUsersStore } from "../features/userRelations/blockedUsersStore";

type BootstrapStatus = "loading" | "ready" | "error";

type BootstrapContextValue = {
    status: BootstrapStatus;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {

    const [status, setStatus] = useState<BootstrapStatus>("loading");

    // on MainPage render
    useEffect(() => {
        async function bootstrap() {
            try {
                // TODO: connect websocket

                const [
                    contacts,
                    blockedUsers,
                ] = await Promise.all([
                    apiGetContacts(),
                    apiGetBlockedUsers(),
                ]);
                
                useContactsStore.getState().setContacts(contacts);
                useBlockedUsersStore.getState().setBlockedUsers(blockedUsers);

                setStatus("ready");
            } catch (err) {
                // TODO: gotta differentiate between websocket error and api error
                setStatus("error");
            }
        }

        bootstrap();
    }, []);

    return (
        <BootstrapContext.Provider
            value={{
                status
            }}
        >
            {children}
        </BootstrapContext.Provider>
    )
};

export function useBootstrap() {
    const ctx = useContext(BootstrapContext);
    if (!ctx) throw new Error("useBootstrap must be used inside a BootstrapProvider");
    return ctx;
}