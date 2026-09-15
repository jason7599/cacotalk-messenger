import { useActiveConversationStore } from "../activeConversationStore";
import ConversationEmptyState from "./ConversationEmptyState";
import ConversationLoadingState from "./ConversationLoadingState";

export default function ConversationView() {
    const activeConversationId = useActiveConversationStore((s) => s.activeConversationId);
    const status = useActiveConversationStore((s) => s.status);
    
    // TODO: error state

    return (
        <main className="h-full min-h-0 min-w-0 flex-1 bg-[#0c0506]">
            { status === "LOADING" ? (
                <ConversationLoadingState />
            ) : !activeConversationId ? (
                <ConversationEmptyState />
            ) : (
                <>hi</>
            )}
        </main>
    );
}