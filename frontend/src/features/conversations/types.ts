import type { UserInfo } from "../../shared/types";
import type { ChatMessage } from "../messages/types";

type SummaryBase = {
    id: string;
    membersPreview: string[];
    memberCount: number;
    lastSeq: number;
    lastReadSeq: number;
    createdAt: string;
    lastMessage: ChatMessage | null;
};

export type ConversationType = "DIRECT" | "GROUP";

export type ConversationSummary =
    | SummaryBase & { type: "DIRECT"; }
    | SummaryBase & { type: "GROUP"; groupCreatorId: number; }
;

export type BlockStatus = "NONE" | "BLOCKED_BY_ME" | "BLOCKED_ME";

export type ConversationDetail = {
    id: string;
    type: ConversationType;
    members: UserInfo[];
    blockStatus: BlockStatus;
    groupCreatorId: number | null;
    isClosed: boolean;
    lastSeq: number;
    prevLastReadSeq: number;
    createdAt: string;
};

export type ConversationMeta = 
    { createdAt: string } & (
        | { type: "DIRECT"; blockStatus: BlockStatus; }
        | { type: "GROUP"; groupCreatorId: number; isClosed: boolean; }
    )
;

export type ActiveConversation = {
    id: string;
    members: UserInfo[];
    meta: ConversationMeta;
    messages: ChatMessage[];
    hasOlder: boolean;
    lastSeq: number;
    prevLastReadSeq: number;
};