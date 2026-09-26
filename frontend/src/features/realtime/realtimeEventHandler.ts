import type { UserInfo } from "../../shared/types";
import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";
import type { ChatMessage } from "../messages/types";
import { useBlockedUsersStore } from "../userRelations/blockedUsersStore";
import { useContactsStore } from "../userRelations/contactsStore";
import type { RealtimeEvent } from "./types";

export function handleRealtimeEvent(event: RealtimeEvent) {
    switch (event.type) {
        case "NEW_MESSAGE": return handleNewMessage(event.message);
        case "CONTACT_CHANGED": return handleContactChanged(event.subject, event.added);
        case "BLOCK_CHANGED": return handleBlockChanged(event.subject, event.added);
        case "REMOVED_FROM_GROUP": return handleRemovedFromGroup(event.conversationId);
        case "MEMBER_REMOVED": return handleMemberRemoved(event);
    }
}

function handleNewMessage(message: ChatMessage) {
    useConversationsStore.getState().onNewMessage(message);
    if (useActiveConversationStore.getState().conversation?.id === message.conversationId) {
        useActiveConversationStore.getState().upsertMessage(message);
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

function handleMemberRemoved(event: Extract<RealtimeEvent, { type: "MEMBER_REMOVED" }>) {
    const { conversationId, subject, previewPatch, newMemberCount } = event;

    useConversationsStore.getState().patchMembers(conversationId, previewPatch, newMemberCount);
    if (useActiveConversationStore.getState().conversation?.id === conversationId) {
        useActiveConversationStore.getState().onMemberRemoved(subject.userId);
    }
}