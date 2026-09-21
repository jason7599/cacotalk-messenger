import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";
import type { ChatMessage } from "../messages/types";
import type { RealtimeEvent } from "./types";

export function handleRealtimeEvent(event: RealtimeEvent) {
    switch (event.type) {
        case "NEW_MESSAGE": return handleNewMessage(event.message);
        case "BLOCK_STATUS_CHANGE": return handleBlockStatusChange(event.blockerId, event.targetId, event.blocked);
        default:
            console.log(event);
    }
}

function handleNewMessage(message: ChatMessage) {
    // this itself checks if the conversation id matches, so we can just call it
    useActiveConversationStore.getState().upsertMessage(message);
    useConversationsStore.getState().onNewMessage(message);
}

function handleBlockStatusChange(blockerId: number, targetId: number, blocked: boolean) {
    useActiveConversationStore.getState().updateBlockStatus(blockerId, targetId, blocked);
}