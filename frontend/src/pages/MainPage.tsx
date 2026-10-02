import { useBootstrap } from "../shared/BootstrapProvider";
import LoadingScreen from "../components/LoadingScreen";
import SidebarPanel from "../components/SidebarPanel";
import ConversationPanel from "../features/conversations/components/ConversationPanel";
import ErrorScreen from "../components/ErrorScreen";
import ConnectionBanner from "../components/ConnectionBanner";
import { useActiveConversationStore } from "../features/conversations/activeConversationStore";
import { cn } from "../components/ui";

export default function MainPage() {
    const { bootstrapStatus } = useBootstrap();

    // Phones/tablets (below lg) show one pane at a time: the list, or the open chat.
    // Desktop (lg and up) always shows both side by side.
    const isChatOpen = useActiveConversationStore((s) => s.status === "LOADING" || s.conversation !== null);

    if (bootstrapStatus === "LOADING") {
        return <LoadingScreen title="SUMMONING YOUR CHAOS"/>
    }

    if (bootstrapStatus === "ERROR") {
        return <ErrorScreen title="THE PIT HAS GONE COLD" />;
    }

    return (
        <div className="flex h-dvh w-screen overflow-hidden">
            <div className={cn("lg:flex lg:w-auto", isChatOpen ? "hidden" : "flex w-full")}>
                <SidebarPanel />
            </div>

            <div className={cn("min-w-0 flex-1 lg:flex", isChatOpen ? "flex" : "hidden")}>
                <ConversationPanel />
            </div>

            <ConnectionBanner />
        </div>
    )
}
