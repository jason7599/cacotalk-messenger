import { useBootstrap } from "../shared/BootstrapProvider";
import LoadingScreen from "../components/LoadingScreen";
import SidebarPanel from "../components/SidebarPanel";
import ConversationPanel from "../features/conversations/components/ConversationPanel";
import ErrorScreen from "../components/ErrorScreen";
import ConnectionBanner from "../components/ConnectionBanner";

export default function MainPage() {
    const { bootstrapStatus } = useBootstrap();

    if (bootstrapStatus === "LOADING") {
        return <LoadingScreen title="SUMMONING YOUR CHAOS"/>
    }

    if (bootstrapStatus === "ERROR") {
        return <ErrorScreen title="THE PIT HAS GONE COLD" />;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <SidebarPanel />
            <ConversationPanel />
            <ConnectionBanner />
        </div>
    )
}
