import { Settings } from "lucide-react";
import { useModal } from "./ModalProvider";
import SettingsModal from "./SettingsModal";
import IdentityCard from "./IdentityCard";
import { Button, SidebarList } from "./ui";

/** Mobile-only "Self" tab: who you are + a way into settings. */
export default function SelfPanel() {
    const { openModal } = useModal();

    return (
        <SidebarList
            eyebrow="IDENTITY // VERIFIED"
            title="SELF"
            meta="UNIT 03"
            footer="SOUL RECORD // LOCAL SESSION"
        >
            <div className="flex flex-col gap-4 p-4">
                <IdentityCard className="border-2" />

                <Button
                    variant="outline"
                    onClick={() => openModal(<SettingsModal />)}
                    icon={<Settings size={17} strokeWidth={2.4} />}
                    className="w-full"
                >
                    OPEN SETTINGS
                </Button>
            </div>
        </SidebarList>
    );
}
