import cacotalkLogo from "../../../assets/cacotalk-logo.png";
import { MessageSquareText } from "lucide-react";

export default function ConversationEmptyState() {
    return (
        <div
            className="
                relative flex h-full
                items-center justify-center
                overflow-hidden
            "
        >
            <img
                src={cacotalkLogo}
                alt=""
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute left-1/2 top-1/2
                    w-[min(65%,40rem)]
                    -translate-x-1/2 -translate-y-1/2
                    select-none
                    opacity-[0.35]
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute inset-0
                    opacity-[0.05]
                    bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)]
                    bg-size-[100%_4px]
                "
            />

            <div
                className="
                    relative z-10
                    border border-[#4b1b1f]
                    bg-[#0c0506]/40
                    px-8 py-6
                    text-center
                    shadow-[6px_6px_0_#2b0e12]
                    backdrop-blur-[2px]
                "
            >
                <div
                    className="
                        mx-auto grid h-16 w-16 place-items-center
                        border-2 border-[#64141b]
                        bg-[#100708]/90
                        text-[#a71924]
                        shadow-[5px_5px_0_#48090e]
                    "
                >
                    <MessageSquareText size={28} strokeWidth={2.1} />
                </div>

                <p className="mt-5 text-2xl font-black tracking-[0.16em] text-[#d8c3bf]">
                    NO CHANNEL SELECTED
                </p>

                <p className="mt-2 text-[10px] tracking-[0.12em] text-[#8f7376]">
                    SELECT A TRANSMISSION TO ESTABLISH CONTACT.
                </p>
            </div>

            <div
                className="
                    absolute bottom-5 left-1/2
                    -translate-x-1/2
                    text-[9px]
                    tracking-[0.22em]
                    text-[#4f3b3d]
                "
            >
                CACOTALK // LINK STANDBY
            </div>
        </div>
    );
}