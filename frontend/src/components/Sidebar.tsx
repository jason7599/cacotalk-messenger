import {
    MessageSquare,
    Users,
    Settings,
} from "lucide-react";

import { useState } from "react";
import { useModal } from "./ModalProvider";
import SettingsModal from "./SettingsModal";
import cacotalkEmblem from "../assets/cacotalk-logo.png";

export default function Sidebar() {
    const [panel, setPanel] =
        useState<"contacts" | "conversations">("conversations");

    const { openModal } = useModal();

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
        <aside className="flex h-screen">
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
                        className={`${navButton} ${
                            panel === "conversations"
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
                        className={`${navButton} ${
                            panel === "contacts"
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

            {/* active subsystem */}
            <section
                className="
                    flex w-80 flex-col
                    border-r-2 border-[#64141b]
                    bg-[#190b0d]
                    text-[#eee2d5]
                "
            >
                <header
                    className="
                        border-b-2 border-[#4b1b1f]
                        bg-[#100708]
                        px-5 py-4
                    "
                >
                    <p className="mb-1 text-[10px] tracking-[0.22em] text-[#a71924]">
                        COMMUNICATIONS // ACTIVE
                    </p>

                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-xl font-black tracking-[-0.02em]">
                            {panel === "conversations"
                                ? "TRANSMISSIONS"
                                : "SOUL DIRECTORY"}
                        </h2>

                        <span className="text-[9px] tracking-[0.16em] text-[#7f6668]">
                            UNIT 01
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {panel === "conversations" ? (
                        <div className="p-4">
                            Conversations
                        </div>
                    ) : (
                        <div className="p-4">
                            Contacts
                        </div>
                    )}
                </div>

                <footer
                    className="
                        border-t border-[#4b1b1f]
                        bg-[#100708]
                        px-4 py-2
                        text-[9px]
                        tracking-[0.16em]
                        text-[#7f6668]
                    "
                >
                    CACOTALK // INFERNAL RELAY
                </footer>
            </section>
        </aside>
    );
}