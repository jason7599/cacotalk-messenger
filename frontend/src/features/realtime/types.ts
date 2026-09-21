import type { ChatMessage } from "../messages/types";

export type RealtimeEvent = 
    | { type: "NEW_MESSAGE"; message: ChatMessage }
;