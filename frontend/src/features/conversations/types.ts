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

type DirectConversation = ConversationBase & {
    type: "DIRECT";
    blockStatus: "NONE" | "BLOCKED_BY_ME" | "BLOCKED_ME";
};

type GroupConversation = ConversationBase & {
    type: "GROUP";
    isClosed: boolean;
    groupCreatorId: number;
};

export type ConversationSummary = DirectConversation | GroupConversation;