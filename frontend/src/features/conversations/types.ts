import type { UserInfo } from "../../shared/types";
import type { ChatMessage } from "../messages/types";

type SummaryBase = {
    id: string;
    membersPreview: UserInfo[];
    memberCount: number;
    lastReadSeq: number;
    createdAt: string;
    lastMessage: ChatMessage | null;
};

export type ConversationType = "DIRECT" | "GROUP";

export type ConversationSummary =
    | SummaryBase & { type: "DIRECT"; }
    | SummaryBase & { type: "GROUP"; groupCreatorId: number; }
;

// The full DTO shape from the
export type ConversationDetail = {
    id: string;
    type: ConversationType;
    otherMembers: UserInfo[];
    blockedMe: boolean;
    groupCreatorId: number | null;
    isClosed: boolean;
    lastSeqSnapshot: number;
    myLastReadSeq: number;
    createdAt: string;
};

export type ConversationMeta = 
    { createdAt: string } & (
        | { type: "DIRECT"; blockedMe: boolean; }
        | { type: "GROUP"; groupCreator: UserInfo; isClosed: boolean; }
    )
;

export type ActiveConversation = {
    id: string;
    otherMembers: UserInfo[]; // excludes user
    meta: ConversationMeta;
    messages: ChatMessage[];
    lastSeqSnapshot: number; // the last message seq at the time of DB fetch. this is used to discern whether to show the unread divider
    myLastReadSeq: number; // where the user left off, also for the divider logic
    hasOlder: boolean;
    loadingOlder: boolean;
    loadOlderError: string | null;
    ackedSeq: number; // highest seq confirmed acked (marked as read)
};