import { MessageSquare, Users, Settings } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useModal } from "./ModalProvider";
import SettingsModal from "./SettingsModal";
import cacotalkEmblem from "../assets/cacotalk-logo.png";
import ContactList from "../features/userRelations/components/ContactList";
import ConversationList from "../features/conversations/components/ConversationList";
import { useAuthStore } from "../features/auth/authStore";
import { Avatar, cn, press } from "./ui";

export default function Sidebar() {
    const [panel, setPanel] = useState<"contacts" | "conversations">("conversations");

    const { openModal } = useModal();
    const user = useAuthStore((s) => s.user!);

    return (
        <aside className="flex">
            {/* icon rail */}
            <nav className="flex w-20 flex-col items-center border-r-2 border-edge-strong bg-sunken py-4">
                <div className="mb-8 grid h-14 w-14 place-items-center border-2 border-edge-strong bg-panel shadow-hard-lg">
                    <img src={cacotalkEmblem} alt="" className="h-12 w-12 object-contain" />
                </div>

                <div className="flex w-full flex-col gap-3 px-2">
                    <NavButton
                        label="Conversations"
                        active={panel === "conversations"}
                        onClick={() => setPanel("conversations")}
                    >
                        <MessageSquare size={22} strokeWidth={2.4} />
                    </NavButton>

                    <NavButton
                        label="Contacts"
                        active={panel === "contacts"}
                        onClick={() => setPanel("contacts")}
                    >
                        <Users size={22} strokeWidth={2.4} />
                    </NavButton>
                </div>

                <div className="mt-auto w-full px-2">
                    <div className="mb-3 h-px bg-edge" />

                    <NavButton label="Settings" onClick={() => openModal(<SettingsModal />)}>
                        <Settings size={22} strokeWidth={2.4} />
                    </NavButton>
                </div>
            </nav>

            <section className="flex w-110 flex-col border-r-2 border-edge-strong bg-panel">
                <div className="min-h-0 flex-1">
                    {panel === "conversations"
                        ? <ConversationList />
                        : <ContactList />
                    }
                </div>

                {/* Current user */}
                <div className="relative overflow-hidden border-b-2 border-edge-strong bg-sunken p-4">
                    <div className="pointer-events-none absolute right-3 top-2 text-3xs font-bold tracking-caps text-edge-soft">
                        IDENTITY // VERIFIED
                    </div>

                    <div className="flex items-center gap-4">
                        <Avatar name={user.username} size="xl" tone="active">
                            <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border border-sunken bg-crimson-bright" />
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="text-3xs font-bold tracking-caps text-crimson">ACTIVE OPERATOR</p>

                            <p className="mt-0.5 truncate text-lg font-black tracking-tight">{user.username}</p>

                            <div className="mt-1 flex items-center gap-2 text-3xs tracking-label text-faint">
                                <span>STATUS</span>
                                <span className="h-px w-4 bg-edge" />
                                <span className="font-bold text-muted">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </aside>
    );
}

type NavButtonProps = {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
};

function NavButton({ label, active = false, onClick, children }: NavButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={cn(
                "relative grid h-12 w-full place-items-center border-2 shadow-hard-md transition-colors",
                press,
                active
                    ? "border-crimson-bright bg-crimson text-bone"
                    : "border-edge bg-panel text-muted hover:border-crimson hover:bg-raised hover:text-crimson-bright",
            )}
        >
            {active && <span className="absolute -left-2 top-2 h-7 w-1 bg-crimson-bright" />}
            {children}
        </button>
    );
}
