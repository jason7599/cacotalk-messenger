import type { ConversationSummary } from "./types";

/** "lucifer, baal, mammon" for groups, the other person's name for directs. */
export function getConversationDisplayName(conversation: ConversationSummary) {
    if (conversation.membersPreview.length === 0) {
        return "EMPTY CHANNEL";
    }

    return conversation.membersPreview.map((m) => m.username).join(", ");
}
