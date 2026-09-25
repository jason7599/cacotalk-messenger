import { MessageSquare, Users, Settings, } from "lucide-react";
import { useState } from "react";
import { useModal } from "./ModalProvider";
import SettingsModal from "./SettingsModal";
import cacotalkEmblem from "../assets/cacotalk-logo.png";
import ContactList from "../features/userRelations/components/ContactList";
import ConversationList from "../features/conversations/components/ConversationList";
import { useAuth } from "../features/auth/AuthProvider";

export default function Sidebar() {
    const [panel, setPanel] = useState<"contacts" | "conversations">("conversations");

    const { openModal } = useModal();
    const { user } = useAuth();

    if (!user) return;

    const navButton = `
        relative grid h-12 w-full place-items-center
        border-2
        shadow-[3px_3px_0_#48090e]
        active:translate-x-0.75
        active:translate-y-0.75
        active:shadow-[1px_1px_0_#48090e]
    `;

    const activeButton = `
        border-[#e02632]
        bg-[#a71924]
        text-[#eee2d5]
    `;

    const inactiveButton = `
        border-[#4b1b1f]
        bg-[#190b0d]
        text-[#9f8581]
        hover:border-[#a71924]
        hover:bg-[#2b0e12]
        hover:text-[#e02632]
    `;

    return (
        <aside className="flex">
            {/* icon rail */}
            <nav
                className="
                    flex w-20 flex-col items-center
                    border-r-2 border-[#64141b]
                    bg-[#100708]
                    py-4
                "
            >
                <div
                    className="
                        mb-8 grid h-14 w-14 place-items-center
                        border-2 border-[#64141b]
                        bg-[#190b0d]
                        shadow-[4px_4px_0_#48090e]
                    "
                >
                    <img
                        src={cacotalkEmblem}
                        alt=""
                        className="h-12 w-12 object-contain"
                    />
                </div>

                <div className="flex w-full flex-col gap-3 px-2">
                    <button
                        type="button"
                        onClick={() => setPanel("conversations")}
                        aria-label="Conversations"
                        className={`${navButton} ${panel === "conversations"
                            ? activeButton
                            : inactiveButton
                            }`}
                    >
                        {panel === "conversations" && (
                            <span className="absolute -left-2 top-2 h-7 w-1 bg-[#e02632]" />
                        )}

                        <MessageSquare size={22} strokeWidth={2.4} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setPanel("contacts")}
                        aria-label="Contacts"
                        className={`${navButton} ${panel === "contacts"
                            ? activeButton
                            : inactiveButton
                            }`}
                    >
                        {panel === "contacts" && (
                            <span className="absolute -left-2 top-2 h-7 w-1 bg-[#e02632]" />
                        )}

                        <Users size={22} strokeWidth={2.4} />
                    </button>
                </div>

                <div className="mt-auto w-full px-2">
                    <div className="mb-3 h-px bg-[#4b1b1f]" />

                    <button
                        type="button"
                        onClick={() => openModal(<SettingsModal />)}
                        className={`${navButton} ${inactiveButton}`}
                        aria-label="Settings"
                    >
                        <Settings size={22} strokeWidth={2.4} />
                    </button>
                </div>
            </nav>

            <section
                className="
                    flex w-110 flex-col
                    border-r-2 border-[#64141b]
                    bg-[#190b0d]
                    text-[#eee2d5]
                "
            >
                <div className="min-h-0 flex-1">
                    {panel === "conversations"
                        ? <ConversationList />
                        : <ContactList />
                    }
                </div>

                {/* Current user */}
                <div
                    className="
                        relative overflow-hidden
                        border-b-2 border-[#64141b]
                        bg-[#100708]
                        px-4 py-4
                    "
                >
                    <div
                        className="
                            pointer-events-none absolute
                            right-3 top-2
                            text-[8px] font-bold
                            tracking-[0.18em]
                            text-[#321316]
                        "
                    >
                        IDENTITY // VERIFIED
                    </div>

                    <div className="flex items-center gap-4">
                        <div
                            className="
                                relative grid h-14 w-14 shrink-0 place-items-center
                                border-2 border-[#a71924]
                                bg-[#190b0d]
                                text-xl font-black
                                text-[#e02632]
                                shadow-[4px_4px_0_#48090e]
                            "
                        >
                            {user.username.charAt(0).toUpperCase()}

                            <span
                                className="
                                    absolute -bottom-1 -right-1
                                    h-2.5 w-2.5
                                    border border-[#100708]
                                    bg-[#e02632]
                                "
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p
                                className="
                                    text-[9px] font-bold
                                    tracking-[0.18em]
                                    text-[#a71924]
                                "
                            >
                                ACTIVE OPERATOR
                            </p>

                            <p
                                className="
                                    mt-0.5 truncate
                                    text-lg font-black
                                    tracking-[-0.02em]
                                    text-[#eee2d5]
                                "
                            >
                                {user.username}
                            </p>

                            <div
                                className="
                                    mt-1 flex items-center gap-2
                                    text-[9px]
                                    tracking-[0.12em]
                                    text-[#665054]
                                "
                            >
                                <span>STATUS</span>
                                <span className="h-px w-4 bg-[#4b1b1f]" />
                                <span className="font-bold text-[#9f8581]">
                                    CONNECTED
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </aside >
    );
}