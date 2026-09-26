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

export type ConversationDetail = {
    id: string;
    type: ConversationType;
    otherMembers: UserInfo[];
    blockedMe: boolean;
    groupCreatorId: number | null;
    isClosed: boolean;
    lastSeq: number;
    prevLastReadSeq: number;
    createdAt: string;
};

export type ConversationMeta = 
    { createdAt: string } & (
        | { type: "DIRECT"; blockedMe: boolean; }
        | { type: "GROUP"; groupCreatorId: number; isClosed: boolean; }
    )
;

export type ActiveConversation = {
    id: string;
    otherMembers: UserInfo[];
    meta: ConversationMeta;
    messages: ChatMessage[];
    hasOlder: boolean;
    lastSeq: number;
    prevLastReadSeq: number;
};