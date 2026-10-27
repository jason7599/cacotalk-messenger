import { useActiveConversationStore } from "../conversations/activeConversationStore";
import { useBlockedUsersStore } from "../userRelations/blockedUsersStore";

/**
 * Why the active conversation can't receive new messages, or null if it can.
 * Shared by the composer (locked banner) and message items (hide the reply button).
 */
export function useComposerLockedReason(): string | null {
    const meta = useActiveConversationStore((s) => s.conversation!.meta);
    const otherMembers = useActiveConversationStore((s) => s.conversation!.otherMembers);

    const blockedByMe = useBlockedUsersStore((s) =>
        meta.type === "DIRECT" && !!s.blockedUsersById[otherMembers[0].userId]
    );

    if (meta.type === "GROUP") {
        return meta.isClosed ? "CHANNEL SEALED // NO NEW TRANSMISSIONS" : null;
    }
    // blockedByMe takes precedence over blockedMe
    if (blockedByMe) return "LINK SEVERED // YOU BANISHED THIS SOUL";
    if (meta.blockedMe) return "LINK DENIED // THIS SOUL REJECTS YOUR SIGNAL";
    return null;
}
