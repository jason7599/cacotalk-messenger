import type { UserInfo } from "../../shared/types";
import { useAuthStore } from "../auth/authStore";
import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useConversationsStore } from "../conversations/conversationsStore";
import { useMessageSendStore } from "../messages/messageSendStore";
import type { ChatMessage } from "../messages/types";
import { useBlockedUsersStore } from "../userRelations/blockedUsersStore";
import { useContactsStore } from "../userRelations/contactsStore";
import type { RealtimeEvent } from "./types";

export function handleRealtimeEvent(event: RealtimeEvent) {
    switch (event.type) {
        case "NEW_MESSAGE": return handleNewMessage(event.message, event.clientId);
        case "CONTACT_CHANGED": return handleContactChanged(event.subject, event.added);
        case "BLOCK_CHANGED": return handleBlockChanged(event.subject, event.added);
        case "REMOVED_FROM_GROUP": return handleRemovedFromGroup(event.conversationId);
        case "MEMBERS_ADDED": return handleMembersAdded(event.conversationId, event.newMembers);
        case "MEMBER_REMOVED": return handleMemberRemoved(event);
        case "GROUP_CLOSED": return handleGroupClosed(event.conversationId);
        case "MARKED_AS_READ": return handleMarkedAsRead(event.conversationId, event.seq);
    }
}

function handleNewMessage(message: ChatMessage, clientId?: string) {
    // remove from pending queue if this client had this message in the queue.
    // This happens if this WS event arrives earlier than the sendMessage API response.
    // Removing it from pending fixes a UI flicker issue where otherwise
    // you could see the message in both states - one persisted, one pending.
    if (message.type === "USER" && message.senderId === useAuthStore.getState().user!.userId && clientId) {
        // I could make this resolveByClientId method return a boolean, whether this message was
        // indeed sitting in the pending queue or not.
        // The idea being, if it were not, we would assume the API response came first and
        // the upserts happened already. So if it returns false, we would terminate early.
        // However, it will also return false on multi-session/tab user scenarios.
        // In which case, we do need the upserts.
        // So, no fancy tricks here.
        // The below upserts are idempotent, so it won't hurt anyway.
        useMessageSendStore.getState().resolveByClientId(message.conversationId, clientId);

        // Interestingly, this technically isn't an "optimistic" UI update.
        // The backend updates the user's last_read_seq automatically upon message insertion,
        // so here we can be sure this happened without waiting for the WS MARKED_AS_READ event.
        useConversationsStore.getState().updateLastReadSeq(message.conversationId, message.seq);
    }

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

function handleMembersAdded(conversationId: string, newMembers: UserInfo[]) {
    useConversationsStore.getState().onMembersAdded(conversationId, newMembers)
    if (useActiveConversationStore.getState().conversation?.id === conversationId) {
        useActiveConversationStore.getState().onMembersAdded(newMembers);
    }
}

function handleMemberRemoved(event: Extract<RealtimeEvent, { type: "MEMBER_REMOVED" }>) {
    const { conversationId, subject, previewPatch, newMemberCount } = event;

    useConversationsStore.getState().onMemberRemoved(conversationId, previewPatch, newMemberCount);
    if (useActiveConversationStore.getState().conversation?.id === conversationId) {
        useActiveConversationStore.getState().onMemberRemoved(subject.userId);
    }
}

function handleGroupClosed(conversationId: string) {
    if (useActiveConversationStore.getState().conversation?.id === conversationId) {
        useActiveConversationStore.getState().onGroupClosed();
    }
}

function handleMarkedAsRead(conversationId: string, seq: number) {
    useConversationsStore.getState().updateLastReadSeq(conversationId, seq);
    if (useActiveConversationStore.getState().conversation?.id === conversationId) {
        useActiveConversationStore.getState().onAckConfirmed(seq);
    }
}