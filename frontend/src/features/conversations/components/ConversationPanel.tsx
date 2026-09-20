import MessageComposer from "../../messages/components/MessageComposer";
import MessageList from "../../messages/components/MessageList/MessageList";
import { useActiveConversationStore } from "../activeConversationStore";
import ConversationEmptyState from "./ConversationEmptyState";
import ConversationHeader from "./ConversationHeader";
import ConversationLoadingState from "./ConversationLoadingState";

export default function ConversationPanel() {
    const conversation = useActiveConversationStore((s) => s.conversation);
    const status = useActiveConversationStore((s) => s.status);
    
    let content;
    if (status === "LOADING") {
        content = <ConversationLoadingState />;
    } else if (!conversation) {
        content = <ConversationEmptyState />;
    } else {
        content = <>
            <ConversationHeader />
            <MessageList />
            <MessageComposer />
        </>;
    }

    return (
        <div className="flex flex-1 h-full flex-col bg-[#100708]">
            {content}
        </div>
    );
}