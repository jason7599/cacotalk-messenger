import type { UserInfo } from "../../shared/types";
import type { ChatMessage } from "../messages/types";

export type RealtimeEvent = 
    | { type: "NEW_MESSAGE"; message: ChatMessage }
    | { type: "CONTACT_CHANGED"; subject: UserInfo; added: boolean }
    | { type: "BLOCK_CHANGED"; subject: UserInfo; added: boolean }
    | { type: "REMOVED_FROM_GROUP"; conversationId: string }
    | { type: "MEMBER_REMOVED";
        conversationId: string;
        subject: UserInfo;
        previewPatch: UserInfo[];
        newMemberCount: number; }
;