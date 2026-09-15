import { useActiveConversationStore } from "../activeConversationStore";
import ConversationEmptyState from "./ConversationEmptyState";
import ConversationLoadingState from "./ConversationLoadingState";

export default function ConversationPanel() {
    const activeConversationId = useActiveConversationStore((s) => s.activeConversationId);
    const status = useActiveConversationStore((s) => s.status);
    
    let content;
    if (status === "LOADING") {
        content = <ConversationLoadingState />;
    } else if (!activeConversationId) {
        content = <ConversationEmptyState />;
    } else {
        content = <>
            hi
        </>;
    }

    return (
        <div className="flex flex-1 h-full flex-col bg-[#100708]">
            {content}
        </div>
    );
}