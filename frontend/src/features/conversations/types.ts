import type { ChatMessage } from "../messages/types";

type ConversationSummaryBase = {
    id: string;
    membersPreview: string[];
    memberCount: number;
    lastReadMessageId: number | null;
    createdAt: string;
    lastMessage: ChatMessage | null;
};

export type DirectConversationSummary = ConversationSummaryBase & {
    type: "DIRECT";
    blockStatus: "NONE" | "BLOCKED_BY_ME" | "BLOCKED_ME";
};

export type GroupConversationSummary = ConversationSummaryBase & {
    type: "GROUP";
    isClosed: boolean;
    groupCreatorId: number;
};

export type ConversationSummary = DirectConversationSummary | GroupConversationSummary;