import type { UserInfo } from "../../shared/types";
import type { ReactionType } from "./reactions";

type MessageBase = {
    conversationId: string;
    seq: number;
    createdAt: string;
};

export type ReplyTo = {
    seq: number;
    senderName: string;
    content: string;
};

export type MessageReaction = {
    userId: number;
    username: string;
    type: ReactionType;
};

export type UserMessage = MessageBase & {
    type: "USER";
    senderId: number;
    senderName: string;
    content: string;
    replyTo: ReplyTo | null;
    reactions: MessageReaction[];
};

// for conversation summary
export type LastMessage =
    | Omit<UserMessage, "conversationId" | "senderId" | "replyTo" | "reactions">
    | Omit<EventMessage, "conversationId">
;

export type EventData =
    | { type: "GROUP_CREATED"; initMembers: UserInfo[] }
    | { type: "MEMBERS_INVITED"; members: UserInfo[] }
    | { type: "MEMBER_LEFT"; subject: UserInfo }
    | { type: "MEMBER_REMOVED"; subject: UserInfo }
    | { type: "GROUP_CLOSED"; }
;

export type EventMessage = MessageBase & {
    type: "EVENT";
    event: EventData;
};

export type ChatMessage = UserMessage | EventMessage;

export type MessagePage = {
    messages: ChatMessage[];
    hasOlder: boolean;
};