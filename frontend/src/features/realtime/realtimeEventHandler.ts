import type { UserInfo } from "../../shared/types";
import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";
import type { ChatMessage, EventData } from "../messages/types";
import { useBlockedUsersStore } from "../userRelations/blockedUsersStore";
import { useContactsStore } from "../userRelations/contactsStore";
import type { RealtimeEvent } from "./types";

export function handleRealtimeEvent(event: RealtimeEvent) {
    switch (event.type) {
        case "NEW_MESSAGE": return handleNewMessage(event.message);
        case "CONTACT_CHANGED": return handleContactChanged(event.subject, event.added);
        case "BLOCK_CHANGED": return handleBlockChanged(event.subject, event.added);
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

function handleEventMessage(event: EventData) {
    switch (event.type) {
    case "GROUP_CREATED": break; // nothing to do here, for now. conversationsStore#onNewMessage will handle it
    case "MEMBERS_INVITED":
        // TODO: 
        // If I'm one of the invited members: 
        //      do nothing. conversationsStore#onNewMessage will handle the query to fetch the initial convo summary
        // else:
        //      conversationsStore: update sidebar display. Display name, membercount etc
        //      activeConversationStore: if current conversation, append to member list 
        break;
    case "MEMBER_LEFT": // fallthru
    case "MEMBER_REMOVED":
        // TODO: 
        // If I'm the one who got removed:
        //      do nothing, the self-sync event REMOVED_FROM_GROUP will handle it
        // else: 
        //      conversationsStore: update sidebar display. Display name, membercount etc
        //      activeConversationStore: if current conversation, remove from member list 
        break;
    case "GROUP_CLOSED":
        // TODO:
        // conversationsStore: nothing to do. Unless I later want a visual indication on closed groups
        // activeConversationStore: if current convo, update meta.isClosed
        break;
    }
}

function handleContactChanged(subject: UserInfo, added: boolean) {
    if (added) {
        useContactsStore.getState().upsertLocal(subject);
    } else {
        useContactsStore.getState().removeLocal(subject.userId);
    }
}

function handleBlockChanged(subject: UserInfo, added: boolean) {
    if (added) {
        useBlockedUsersStore.getState().upsertLocal(subject);
    } else {
        useBlockedUsersStore.getState().removeLocal(subject.userId);
    }
}

function handleRemovedFromGroup(conversationId: string) {
    useConversationsStore.getState().removeLocal(conversationId);
    if (useActiveConversationStore.getState().conversation?.id === conversationId) {
        useActiveConversationStore.getState().clearActiveConversation();
    }
}
