import type { BlockStatus } from "../conversations/types";
import type { ChatMessage } from "../messages/types";

export type RealtimeEvent = 
    | { type: "NEW_MESSAGE"; message: ChatMessage }
    | { type: "BLOCK_STATUS_CHANGE"; subjectUserId: number; blockStatus: BlockStatus };
;