import { MessageSquare, Users, Settings, Skull } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useModal } from "./ModalProvider";
import SettingsModal from "./SettingsModal";
import cacotalkEmblem from "../assets/cacotalk-emblem.webp";
import ContactList from "../features/userRelations/components/ContactList";
import ConversationList from "../features/conversations/components/ConversationList";
import { cn, press } from "./ui";
import IdentityCard from "./IdentityCard";
import SelfPanel from "./SelfPanel";

export default function Sidebar() {
    // "self" only exists on mobile (bottom tab bar); desktop has the identity card + settings button instead.
    const [panel, setPanel] = useState<"contacts" | "conversations" | "self">("conversations");

    const { openModal } = useModal();

    return (
        <aside className="flex w-full flex-col lg:w-auto lg:flex-row">
            {/* icon rail (desktop) */}
            <nav className="hidden w-20 flex-col items-center border-r-2 border-edge-strong bg-sunken py-4 lg:flex">
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

            <section className="flex min-h-0 w-full flex-1 flex-col bg-panel lg:w-96 lg:flex-initial lg:border-r-2 lg:border-edge-strong 2xl:w-110">
                <div className="min-h-0 flex-1">
                    {panel === "conversations" && <ConversationList />}
                    {panel === "contacts" && <ContactList />}
                    {panel === "self" && <SelfPanel />}
                </div>

                {/* Current user (desktop) */}
                <IdentityCard className="hidden lg:block" />
            </section>

            {/* bottom tab bar (mobile) */}
            <nav className="flex shrink-0 border-t-2 border-edge-strong bg-sunken pb-[env(safe-area-inset-bottom)] lg:hidden">
                <TabButton
                    label="TRANSMISSIONS"
                    active={panel === "conversations"}
                    onClick={() => setPanel("conversations")}
                    icon={<MessageSquare size={20} strokeWidth={2.4} />}
                />
                <TabButton
                    label="SOULS"
                    active={panel === "contacts"}
                    onClick={() => setPanel("contacts")}
                    icon={<Users size={20} strokeWidth={2.4} />}
                />
                <TabButton
                    label="SELF"
                    active={panel === "self"}
                    onClick={() => setPanel("self")}
                    icon={<Skull size={20} strokeWidth={2.4} />}
                />
            </nav>
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

type TabButtonProps = {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: ReactNode;
};

function TabButton({ label, active, onClick, icon }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "relative flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 text-3xs font-bold tracking-caps transition-colors",
                active ? "bg-panel text-crimson-bright" : "text-faint",
            )}
        >
            {active && <span className="absolute inset-x-6 top-0 h-0.5 bg-crimson-bright" />}
            {icon}
            {label}
        </button>
    );
}
