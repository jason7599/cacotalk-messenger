import { useBootstrap } from "../app/BootstrapProvider";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/Sidebar";
import ConversationView from "../features/conversations/components/ConversationView";

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
        <div className="flex h-dvh min-h-0">
            <Sidebar />
            <ConversationView />
        </div>
    )
}
