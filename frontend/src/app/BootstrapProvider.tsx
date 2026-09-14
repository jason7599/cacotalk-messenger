import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGetBlockedUsers, apiGetContacts } from "../features/userRelations/userRelationsApi";
import { useContactsStore } from "../features/userRelations/contactsStore";
import { useBlockedUsersStore } from "../features/userRelations/blockedUsersStore";
import { apiGetConversations } from "../features/conversations/conversationsApi";
import { useConversationsStore } from "../features/conversations/conversationsStore";

type BootstrapStatus = "LOADING" | "READY" | "ERROR";

type BootstrapContextValue = {
    status: BootstrapStatus;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {

    const [status, setStatus] = useState<BootstrapStatus>("LOADING");

    // on MainPage render
    useEffect(() => {
        async function bootstrap() {
            try {
                // TODO: connect websocket

                const [
                    contacts,
                    blockedUsers,
                    conversations,
                ] = await Promise.all([
                    apiGetContacts(),
                    apiGetBlockedUsers(),
                    apiGetConversations()
                ]);
                
                useContactsStore.getState().setContacts(contacts);
                useBlockedUsersStore.getState().setBlockedUsers(blockedUsers);
                useConversationsStore.getState().setConversations(conversations);

                setStatus("READY");
            } catch (err) {
                // TODO: gotta differentiate between websocket error and api error
                setStatus("ERROR");
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