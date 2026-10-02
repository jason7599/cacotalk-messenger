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
        // min-w-0: without it this box grows to fit its widest content (e.g. a long
        // group title), pushing the chat off-screen instead of letting the title truncate.
        <div className="flex h-full min-w-0 flex-1 flex-col bg-sunken">
            {content}
        </div>
    );
}