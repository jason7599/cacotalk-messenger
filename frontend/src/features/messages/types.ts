type MessageBase = {
    id: number;
    conversationId: string;
    createdAt: string;
};

export type UserMessage = MessageBase & {
    type: "USER";
    senderId: number;
    content: string;
    clientId: string;
};

export type EventMessageType =
    | "GROUP_CREATED"
    | "USER_INVITED"
    | "USER_LEFT"
    | "USER_REMOVED"
    | "GROUP_CLOSED"
;

export type EventMessage = MessageBase & {
    type: "EVENT";
    eventType: EventMessageType;
    eventData: unknown | null;
};

export type ChatMessage = UserMessage | EventMessage;