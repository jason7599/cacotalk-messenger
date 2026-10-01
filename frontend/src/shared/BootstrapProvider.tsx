import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useContactsStore } from "../features/userRelations/contactsStore";
import { useBlockedUsersStore } from "../features/userRelations/blockedUsersStore";
import { useConversationsStore } from "../features/conversations/conversationsStore";
import { getErrorMessage } from "./apiError";
import { useActiveConversationStore } from "../features/conversations/activeConversationStore";
import { wsClient } from "../features/realtime/wsClient";
import { useMessageSendStore } from "../features/messages/messageSendStore";
import { apiGetBlockedUsers, apiGetContacts } from "../features/userRelations/userRelationsApi";
import { apiGetConversationSummaries } from "../features/conversations/conversationsApi";
import { handleRealtimeEvent } from "../features/realtime/realtimeEventHandler";

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
        let disposed = false;
        let isSyncing = false;

        async function sync() {
            // prevent multiple simultaneous bootstrap/resync flows
            if (isSyncing || disposed) {
                return;
            }

            isSyncing = true;
            setStatus("LOADING");
            setError(null);

            try {
                // connect Ws first, so events arriving before the api responses are buffered
                await wsClient.connect();

                const [
                    contacts,
                    blockedUsers,
                    conversations
                ] = await Promise.all([
                    apiGetContacts(),
                    apiGetBlockedUsers(),
                    apiGetConversationSummaries()
                ]);

                if (disposed) return;
                
                useContactsStore.getState().setContacts(contacts);
                useBlockedUsersStore.getState().setBlockedUsers(blockedUsers);
                useConversationsStore.getState().setConversations(conversations);

                // flush buffered ws events and switch to live mode
                wsClient.goLive(handleRealtimeEvent);

                setStatus("READY");
            } catch (err) {
                if (disposed) return;

                setStatus("ERROR");
                setError(getErrorMessage(err));
            } finally {
                isSyncing = false;
            }
        }

        wsClient.setDisconnectHandler(() => {
            sync();
        });

        // init bootstrap
        sync();

        return () => {
            disposed = true;

            // remove callback first so teardown doesn't cause another sync
            wsClient.setDisconnectHandler(null);
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