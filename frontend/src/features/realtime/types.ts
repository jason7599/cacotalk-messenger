import type { ChatMessage } from "../messages/types";

export type RealtimeEvent = 
    | { type: "NEW_MESSAGE"; message: ChatMessage }
    | { type: "REMOVED_FROM_GROUP"; conversationId: string }
;