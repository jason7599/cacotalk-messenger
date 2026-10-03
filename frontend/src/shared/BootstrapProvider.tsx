import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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

type ConnectionStatus = "CONNECTED" | "RECONNECTING" | "OFFLINE";

type BootstrapContextValue = {
    bootstrapStatus: BootstrapStatus;
    connectionStatus: ConnectionStatus;
    error: string | null;
    /** Reconnect attempts that failed in a row. 0 while connected. */
    failedAttempts: number;
    /** When the next automatic reconnect attempt happens (ms timestamp), or null if none is scheduled. */
    nextRetryAt: number | null;
    /** Try to reconnect right now instead of waiting for the next scheduled attempt. */
    retryNow: () => void;
};

// exponential reconnect backoff: 1s, 2s, 4s, 8s, 16s, then every 30s.
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;

function retryDelay(failedAttempts: number) {
    return Math.min(RETRY_BASE_MS * 2 ** (failedAttempts - 1), RETRY_MAX_MS);
}

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {

    const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>("LOADING");
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("CONNECTED");
    const [error, setError] = useState<string | null>(null);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [nextRetryAt, setNextRetryAt] = useState<number | null>(null);

    // Lets retryNow() (outside the effect) reach the reconnect logic inside it.
    const retryNowRef = useRef<() => void>(() => {});

    // on MainPage render
    useEffect(() => {
        let disposed = false;
        let isSyncing = false;

        // true while the ws is up and the stores are synced
        let isConnected = false;
        // reconnect attempts that failed in a row
        let failures = 0;
        let retryTimer: number | undefined;

        function clearScheduledRetry() {
            window.clearTimeout(retryTimer);
            retryTimer = undefined;
            setNextRetryAt(null);
        }

        function scheduleRetry() {
            const delay = retryDelay(failures);
            setNextRetryAt(Date.now() + delay);

            retryTimer = window.setTimeout(() => {
                retryTimer = undefined;
                sync(true);
            }, delay);
        }

        async function sync(isReconnect: boolean) {
            // prevent multiple simultaneous bootstrap/resync flows
            if (isSyncing || disposed) {
                return;
            }

            isSyncing = true;
            clearScheduledRetry();
            setError(null);

            if (isReconnect) {
                setConnectionStatus("RECONNECTING");
            } else {
                // Initial app bootstrap
                setBootstrapStatus("LOADING");
            }

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

                // reconnection while conversation was open, have to catch up.
                const active = useActiveConversationStore.getState().conversation;
                if (isReconnect && active) {
                    useActiveConversationStore.getState().setActiveConversation(active.id, true);
                }

                // flush buffered ws events and switch to live mode
                wsClient.goLive(handleRealtimeEvent);

                isConnected = true;
                failures = 0;
                setFailedAttempts(0);

                setBootstrapStatus("READY");
                setConnectionStatus("CONNECTED");
            } catch (err) {
                if (disposed) return;

                setError(getErrorMessage(err));

                if (isReconnect) {
                    failures++;
                    setFailedAttempts(failures);
                    setConnectionStatus("OFFLINE");
                    scheduleRetry();
                } else {
                    setBootstrapStatus("ERROR");
                }
            } finally {
                isSyncing = false;
            }
        }

        function retryNow() {
            if (isConnected || isSyncing || disposed) return;
            sync(true);
        }
        retryNowRef.current = retryNow;

        wsClient.setDisconnectHandler(() => {
            // Only react when a live connection drops. A failed reconnect attempt
            // also closes the socket and lands here, but that one is already
            // handled by the retry schedule. Without this check, every failed
            // attempt would instantly start another one, skipping the backoff.
            if (!isConnected) return;

            isConnected = false;
            sync(true);
        });

        // While offline, try again right away when the browser says the network is
        // back, or when the user returns to the tab: good moments for a retry to work.
        const retryIfOffline = () => {
            if (failures > 0) retryNow();
        };
        const retryIfVisible = () => {
            if (document.visibilityState === "visible") retryIfOffline();
        };

        window.addEventListener("online", retryIfOffline);
        document.addEventListener("visibilitychange", retryIfVisible);

        // init bootstrap
        sync(false);

        return () => {
            disposed = true;

            window.clearTimeout(retryTimer);
            window.removeEventListener("online", retryIfOffline);
            document.removeEventListener("visibilitychange", retryIfVisible);

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

    const retryNow = useCallback(() => retryNowRef.current(), []);

    return (
        <BootstrapContext.Provider
            value={{
                bootstrapStatus,
                connectionStatus,
                error,
                failedAttempts,
                nextRetryAt,
                retryNow
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