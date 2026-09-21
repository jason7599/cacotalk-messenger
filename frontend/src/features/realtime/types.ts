import type { ChatMessage } from "../messages/types";

export type RealtimeEvent = 
    | { type: "NEW_MESSAGE"; message: ChatMessage }
    | { type: "BLOCK_STATUS_CHANGE"; blockerId: number; targetId: number; blocked: boolean };
;