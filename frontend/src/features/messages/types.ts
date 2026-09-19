import type { UserInfo } from "../../shared/types";

type MessageBase = {
    conversationId: string;
    seq: number;
    createdAt: string;
};

export type UserMessage = MessageBase & {
    type: "USER";
    senderId: number;
    senderName: string;
    content: string;
};

export type EventData =
    | { type: "GROUP_CREATED"; initMembers: UserInfo[] }
    | { type: "USER_INVITED"; subject: UserInfo }
    | { type: "USER_LEFT"; subject: UserInfo }
    | { type: "USER_REMOVED"; subject: UserInfo }
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