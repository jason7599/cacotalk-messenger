import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGetBlockedUsers, apiGetContacts } from "../features/userRelations/userRelationsApi";
import { useContactsStore } from "../features/userRelations/contactsStore";
import { useBlockedUsersStore } from "../features/userRelations/blockedUsersStore";
import { apiGetConversationSummaries } from "../features/conversations/conversationsApi";
import { useConversationsStore } from "../features/conversations/conversationsStore";
import { getErrorMessage } from "../shared/apiClient";
import { useActiveConversationStore } from "../features/conversations/activeConversationStore";
import { wsClient } from "../features/realtime/wsClient";
import { handleRealtimeEvent } from "../features/realtime/realtimeEventHandler";
import { useMessageSendStore } from "../features/messages/messageSendStore";

type BootstrapStatus = "LOADING" | "READY" | "ERROR";

type BootstrapContextValue = {
    status: BootstrapStatus;
    error: string | null;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {

    const [status, setStatus] = useState<BootstrapStatus>("LOADING");
    const [error, setError] = useState<string | null>(null);

    // on MainPage render
    useEffect(() => {
        async function bootstrap() {
            try {
                // Connect websocket first before http bootstrap, as to not lose any events
                await wsClient.connect();

                const [
                    contacts,
                    blockedUsers,
                    conversations,
                ] = await Promise.all([
                    apiGetContacts(),
                    apiGetBlockedUsers(),
                    apiGetConversationSummaries()
                ]);
                
                useContactsStore.getState().setContacts(contacts);
                useBlockedUsersStore.getState().setBlockedUsers(blockedUsers);
                useConversationsStore.getState().setConversations(conversations);

                wsClient.goLive(handleRealtimeEvent);

                setStatus("READY");
            } catch (err) {
                setStatus("ERROR");
                setError(getErrorMessage(err));
            }
        }

        bootstrap();

        return () => {
            wsClient.disconnect();
            
            useContactsStore.getState().reset();
            useBlockedUsersStore.getState().reset();
            useConversationsStore.getState().reset();
            useMessageSendStore.getState().reset();
            useActiveConversationStore.getState().clearActiveConversation();
        };
    }, []);

    return (
        <BootstrapContext.Provider
            value={{
                status,
                error
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