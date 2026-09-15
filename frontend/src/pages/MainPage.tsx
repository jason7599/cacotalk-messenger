import { useBootstrap } from "../app/BootstrapProvider";
import LoadingScreen from "../components/LoadingScreen";
import SidebarPanel from "../components/SidebarPanel";
import ConversationPanel from "../features/conversations/components/ConversationPanel";

export default function MainPage() {
    const { status } = useBootstrap();

    if (status === "LOADING") {
        return <LoadingScreen title="SUMMONING YOUR CHAOS"/>
    }

    // TODO: idk?
    if (status === "ERROR") {
        return <div>WTF?</div>
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <SidebarPanel />
            <ConversationPanel />
        </div>
    )
}
