import { Ban, Lock, MoreVertical, Users } from "lucide-react";
import { useActiveConversationStore } from "../activeConversationStore";

export default function ConversationHeader() {
    const conversation = useActiveConversationStore((s) => s.conversation)!;

    const { otherMembers, meta } = conversation;

    let displayName: string;
    if (meta.type === "DIRECT") {
        displayName = otherMembers[0]!.username;
    } else {
        displayName = "TODO";
    }

    return (
        <header
            className="
                flex shrink-0 items-center gap-4
                border-b-2 border-[#4b1b1f]
                bg-[#100708]
                px-5 py-10
            "
        >
            <div
                className="
                    grid h-12 w-12 shrink-0 place-items-center
                    border-2 border-[#64141b]
                    bg-[#190b0d]
                    text-lg font-black
                    text-[#e02632]
                    shadow-[3px_3px_0_#48090e]
                "
            >
                {meta.type === "GROUP" ? (
                    <Users size={22} strokeWidth={2.3} />
                ) : (
                    displayName.charAt(0).toUpperCase()
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black text-[#eee2d5]">
                    {displayName}
                </p>

                <div className="mt-1 flex items-center gap-2">
                    {meta.type === "GROUP" ? (
                        <>
                            <span
                                className="
                                    flex items-center gap-1
                                    text-[9px]
                                    tracking-[0.16em]
                                    text-[#a71924]
                                "
                            >
                                <Users size={11} strokeWidth={2.3} />
                                GROUP // {otherMembers.length} SOULS
                            </span>

                            <span className="text-[#4b1b1f]">
                                //
                            </span>

                            <span
                                className="
                                    flex items-center gap-1
                                    text-[9px]
                                    tracking-[0.16em]
                                    text-[#7f6668]
                                "
                            >
                                {meta.isClosed && (
                                    <Lock size={10} strokeWidth={2.3} />
                                )}

                                {meta.isClosed
                                    ? "CHANNEL SEALED"
                                    : "CHANNEL OPEN"}
                            </span>
                        </>
                    ) : (
                        <>
                            <span
                                className="
                                    text-[9px]
                                    tracking-[0.16em]
                                    text-[#a71924]
                                "
                            >
                                DIRECT TRANSMISSION
                            </span>

                            {meta.blockStatus !== "NONE" && (
                                <>
                                    <span className="text-[#4b1b1f]">
                                        //
                                    </span>

                                    <span
                                        className="
                                            flex items-center gap-1
                                            text-[9px]
                                            tracking-[0.16em]
                                            text-[#8f343b]
                                        "
                                    >
                                        <Ban size={10} strokeWidth={2.3} />

                                        {meta.blockStatus === "BLOCKED_BY_ME"
                                            ? "SOUL BLOCKED"
                                            : "LINK RESTRICTED"}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* TODO: */}
            <button
                type="button"
                aria-label="Conversation actions"
                className="
                    grid h-9 w-9 shrink-0 place-items-center
                    border border-[#4b1b1f]
                    bg-[#190b0d]
                    text-[#7f6668]
                    hover:border-[#a71924]
                    hover:text-[#e02632]
                "
            >
                <MoreVertical size={17} strokeWidth={2.3} />
            </button>
        </header>
    );
}