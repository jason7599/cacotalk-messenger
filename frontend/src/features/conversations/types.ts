import type { ChatMessage } from "../messages/types";

type ConversationBase = {
    id: string;
    membersPreview: string[];
    memberCount: number;
    lastSeq: number;
    lastReadSeq: number;
    createdAt: string;
    lastMessage: ChatMessage | null;
};

export type ConversationSummary =
    | ConversationBase & { type: "DIRECT" }
    | ConversationBase & { type: "GROUP", groupCreatorId: number }
;