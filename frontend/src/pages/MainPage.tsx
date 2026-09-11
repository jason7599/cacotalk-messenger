import { useBootstrap } from "../app/BootstrapProvider";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/Sidebar";

export default function MainPage() {
    const { status } = useBootstrap();

    if (status === "loading") {
        return <LoadingScreen title="SUMMONING YOUR CHAOS"/>
    }

    // TODO: idk?
    if (status === "error") {
        return <div>WTF?</div>
    }

    return (
        <div>
            <Sidebar />
        </div>
    )
}
