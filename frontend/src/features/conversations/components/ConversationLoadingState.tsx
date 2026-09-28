import { MessageSquareText } from "lucide-react";

export default function ConversationLoadingState() {
    return (
        <div className="flex h-full items-center justify-center px-6">
            <div className="text-center">
                <div className="relative mx-auto h-36 w-36">
                    <div className="absolute inset-0 animate-spin border-2 border-edge border-t-crimson-bright border-r-crimson" />

                    <div className="absolute inset-4 border border-edge bg-sunken shadow-hard-xl" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <MessageSquareText size={42} strokeWidth={1.8} className="text-crimson-bright" />
                    </div>
                </div>

                <p className="eyebrow mt-8 font-bold">CHANNEL RECOVERY // ACTIVE</p>

                <p className="mt-3 text-2xl font-black tracking-label">DIGGING UP THE CHAT</p>

                <p className="mt-3 text-xs tracking-label text-muted">
                    PULLING OLD TRANSMISSIONS FROM THE VOID...
                </p>

                <p className="mt-2 text-3xs tracking-caps text-dim">PLEASE REFRAIN FROM POKING THE ARCHIVE</p>
            </div>
        </div>
    );
}
