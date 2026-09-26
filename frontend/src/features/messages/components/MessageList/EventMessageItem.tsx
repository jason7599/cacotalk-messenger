import { UsersRound } from "lucide-react";
import type { EventData, EventMessage } from "../../types";
import { formatMessageTimestamp } from "../../formatters";
import { selectGroupCreator, useActiveConversationStore } from "../../../conversations/activeConversationStore";

type EventMessageItemProps = {
    message: EventMessage;
};

export default function EventMessageItem({ message }: EventMessageItemProps) {
    return (
        <div className="flex justify-center py-2">
            <div className="w-full max-w-xl">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#3b171a]" />

                    <span className="text-[10px] font-bold tracking-[0.18em] text-[#6f4b49]">
                        {formatMessageTimestamp(message.createdAt)}
                    </span>

                    <div className="h-px flex-1 bg-[#3b171a]" />
                </div>

                <div className="mt-2 flex items-start justify-center gap-3 px-4">
                    <div
                        className="
                            mt-0.5 grid h-8 w-8 shrink-0 place-items-center
                            border border-[#64141b]
                            bg-[#190b0d]
                            text-[#a71924]
                            shadow-[2px_2px_0_#48090e]
                        "
                    >
                        <UsersRound size={15} strokeWidth={2.4} />
                    </div>

                    <div className="min-w-0 text-center">
                        {renderEvent(message.event)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderEvent(event: EventData) {
    switch (event.type) {
    case "GROUP_CREATED": {
        const groupCreator = selectGroupCreator(useActiveConversationStore.getState())!;
            
        return (
            <>
                <p className="font-bold tracking-[0.12em] text-[#d8c8bb]">
                    <span className="font-extrabold text-[#b98f83]">
                        {groupCreator.username}
                    </span>
                    {" "}FORMED THE CIRCLE
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-[#806b67]">
                    with{" "}
                    {event.initMembers.map((member) => member.username).join(" · ")}
                </p>
            </>
        );
    }

    case "MEMBERS_INVITED":
        return <></>;
        
    case "MEMBER_LEFT":
        return (
            <p className="text-xs font-bold tracking-[0.12em] text-[#d8c8bb]">
                <span className="font-extrabold text-[#b98f83]">
                    {event.subject.username}
                </span>
                {" "}LEFT THE CIRCLE
            </p>
        );

    case "MEMBER_REMOVED":
        return (
            <p className="text-xs font-bold tracking-[0.12em] text-[#d8c8bb]">
                <span className="font-extrabold text-[#b98f83]">
                    {event.subject.username}
                </span>
                {" "}WAS REMOVED FROM THE CIRCLE
            </p>
        );


    case "GROUP_CLOSED":
        return <></>;
    }
}