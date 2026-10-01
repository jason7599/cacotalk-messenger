import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import type { RealtimeEvent } from "./types";

const WS_URL = import.meta.env.VITE_WS_URL;

class WsClient {
    private client: Client;

    private isLive = false;
    private isIntentionalDisconnect = false; // we need to distinguish between intentional disconnects: e.g., logout

    private connectPromise: Promise<void> | null = null; // singleton pattern
    private subscription: StompSubscription | null = null;

    private buffer: RealtimeEvent[] = []; // events that arrived before bootstrap completes

    private realtimeEventHandler: ((event: RealtimeEvent) => void) | null = null;
    private disconnectHandler: (() => void) | null = null;

    constructor() {
        this.client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 0, // 0 means no auto-reconnect. Because we will be managing reconnections manually
            onWebSocketClose: async () => {
                this.subscription = null;
                this.connectPromise = null;

                this.isLive = false;

                if (!this.isIntentionalDisconnect) {
                    await this.client.deactivate();
                    this.disconnectHandler!();
                }
            }
        });
    }

    setDisconnectHandler(handler: (() => void) | null) {
        this.disconnectHandler = handler;
    }

    // Singleton
    connect(): Promise<void> {
        if (this.connectPromise) return this.connectPromise;

        this.isIntentionalDisconnect = false;

        this.connectPromise = new Promise((resolve, reject) => {
            this.client.onConnect = () => {
                // defensive
                this.subscription?.unsubscribe();

                this.subscription = this.client.subscribe(
                    `/user/queue/events`,
                    (frame) => this.handleFrame(frame)
                );
                resolve(); // done
            }

            this.client.onWebSocketError = (err) => {
                this.connectPromise = null;
                reject(err);
            };

            this.client.onStompError = (frame) => {
                this.connectPromise = null;
                reject(frame);
            };

            this.client.activate();
        });

        return this.connectPromise;
    }

    private handleFrame(frame: IMessage) {
        const event: RealtimeEvent = JSON.parse(frame.body);

        if (this.isLive) {
            this.realtimeEventHandler!(event);
        } else {
            this.buffer.push(event);
        }
    }

    goLive(handler: (event: RealtimeEvent) => void) {
        this.realtimeEventHandler = handler;
        
        const queue = this.buffer;
        this.buffer = [];

        this.isLive = true;

        queue.forEach(handler);
    }

    // intentional disconnect, doesn't invoke disconnectHandler.
    async disconnect() {
        this.isIntentionalDisconnect = true;

        this.subscription?.unsubscribe();
        this.subscription = null;

        this.connectPromise = null; // For future connections, reset the singleton state
        this.isLive = false;

        this.buffer = [];
        this.realtimeEventHandler = null;
        
        await this.client.deactivate();
    }

    // TODO: cleanup
    // kill socket without marking intentional
    DEV__dropWs() {
        this.client.forceDisconnect();
    }
};

export const wsClient = new WsClient();

// TODO: cleanup
if (import.meta.env.DEV) {
    (window as any).__dropWs = () => {
        wsClient.DEV__dropWs();
    };
}