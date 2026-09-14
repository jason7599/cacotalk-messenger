import { MessageSquareText } from "lucide-react";

export default function ConversationLoadingState() {
    return (
        <div className="flex h-full items-center justify-center px-6">
            <div className="text-center">
                <div className="relative mx-auto h-36 w-36">
                    <div
                        className="
                            absolute inset-0
                            animate-spin
                            border-2
                            border-[#4b1b1f]
                            border-t-[#e02632]
                            border-r-[#a71924]
                            shadow-[0_0_24px_rgba(167,25,36,0.12)]
                        "
                    />

                    <div
                        className="
                            absolute inset-4
                            border border-[#4b1b1f]
                            bg-[#100708]
                            shadow-[6px_6px_0_#48090e]
                        "
                    />

                    <div
                        className="
                            absolute inset-0
                            flex items-center justify-center
                        "
                    >
                        <MessageSquareText
                            size={42}
                            strokeWidth={1.8}
                            className="text-[#e02632]"
                        />
                    </div>
                </div>

                <p
                    className="
                        mt-8
                        text-xs font-bold
                        tracking-[0.24em]
                        text-[#a71924]
                    "
                >
                    CHANNEL RECOVERY // ACTIVE
                </p>

                <p
                    className="
                        mt-3
                        text-2xl font-black
                        tracking-[0.12em]
                        text-[#eee2d5]
                    "
                >
                    DIGGING UP THE CHAT
                </p>

                <p
                    className="
                        mt-3
                        text-xs
                        tracking-[0.14em]
                        text-[#9f8581]
                    "
                >
                    PULLING OLD TRANSMISSIONS FROM THE VOID...
                </p>

                <p
                    className="
                        mt-2
                        text-[9px]
                        tracking-[0.18em]
                        text-[#5f4a4c]
                    "
                >
                    PLEASE REFRAIN FROM POKING THE ARCHIVE
                </p>
            </div>
        </div>
    );
}