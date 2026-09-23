import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";
import type { ChatMessage, EventData } from "../messages/types";
import type { RealtimeEvent } from "./types";

export function handleRealtimeEvent(event: RealtimeEvent) {
    switch (event.type) {
        case "NEW_MESSAGE": return handleNewMessage(event.message);
        case "REMOVED_FROM_GROUP": return handleRemovedFromGroup(event.conversationId);
        default:
            console.log(event);
    }
}

function handleNewMessage(message: ChatMessage) {
    // this itself checks if the conversation id matches, so we can just call it
    useActiveConversationStore.getState().upsertMessage(message);
    useConversationsStore.getState().onNewMessage(message);

    if (message.type === "EVENT") {
        handleEventMessage(message.event);
    }
}

// TODO:
function handleEventMessage(event: EventData) {
    switch (event.type) {
    case "GROUP_CREATED":
        break;
    case "MEMBERS_INVITED":
        break;
    case "MEMBER_LEFT":
        break;
    case "MEMBER_REMOVED":
        break;
    case "GROUP_CLOSED":
        break;
    }
}

function handleRemovedFromGroup(conversationId: string) {
    console.log(`removed from convo ${conversationId}`);
}
