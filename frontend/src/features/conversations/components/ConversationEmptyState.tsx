import cacotalkLogo from "../../../assets/cacotalk-logo.webp";
import { MessageSquareText } from "lucide-react";

export default function ConversationEmptyState() {
    return (
        <div className="relative flex h-full items-center justify-center overflow-hidden">
            <img
                src={cacotalkLogo}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 w-[min(65%,40rem)] -translate-x-1/2 -translate-y-1/2 select-none opacity-35"
            />

            {/* scanlines */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[100%_4px] opacity-5" />

            <div className="relative z-10 border border-edge bg-pit/40 px-8 py-6 text-center shadow-hard-xl shadow-raised backdrop-blur-[2px]">
                <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-edge-strong bg-sunken/90 text-crimson shadow-hard-xl">
                    <MessageSquareText size={28} strokeWidth={2.1} />
                </div>

                <p className="mt-5 text-2xl font-black tracking-caps text-ash">NO CHANNEL SELECTED</p>

                <p className="mt-2 text-2xs tracking-label text-faint">
                    SELECT A TRANSMISSION TO ESTABLISH CONTACT.
                </p>
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-3xs tracking-loud text-edge">
                CACOTALK // LINK STANDBY
            </div>
        </div>
    );
}
