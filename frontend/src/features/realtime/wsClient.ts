import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import type { RealtimeEvent } from "./types";

const WS_URL = import.meta.env.VITE_WS_URL;

class WsClient {
    private client: Client;
    private isLive = false;
    private connectPromise: Promise<void> | null = null; // singleton pattern
    private subscription: StompSubscription | null = null;
    private buffer: RealtimeEvent[] = []; // events that arrived before bootstrap completes
    private handler: ((event: RealtimeEvent) => void) | null = null;

    constructor() {
        this.client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 0 // For now, reconnectDelay of 0 means no auto-reconnect
        });
    }

    // Singleton
    connect(): Promise<void> {
        if (this.connectPromise) return this.connectPromise;

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

            // throw on error for now
            this.client.onWebSocketError = reject;
            this.client.onStompError = reject;

            this.client.activate();
        });

        return this.connectPromise;
    }

    private handleFrame(frame: IMessage) {
        const event: RealtimeEvent = JSON.parse(frame.body);

        if (this.isLive) {
            this.handler!(event);
        } else {
            this.buffer.push(event);
        }
    }

    goLive(handler: (event: RealtimeEvent) => void) {
        this.handler = handler;
        
        const queue = this.buffer;
        this.buffer = [];

        this.isLive = true;

        queue.forEach(handler);
    }

    disconnect() {
        this.subscription?.unsubscribe();
        this.subscription = null;
        this.client.deactivate();
        this.connectPromise = null; // For future connections, reset the singleton state
        this.isLive = false;
        this.buffer = [];
        this.handler = null;
    }
};

export const wsClient = new WsClient();