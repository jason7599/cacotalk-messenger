import { UsersRound } from "lucide-react";
import type { EventData, EventMessage } from "../../types";
import { formatMessageTimestamp } from "../../formatters";
import { selectGroupCreator, useActiveConversationStore } from "../../../conversations/activeConversationStore";
import type { UserInfo } from "../../../../shared/types";

type EventMessageItemProps = {
    message: EventMessage;
};

export default function EventMessageItem({ message }: EventMessageItemProps) {
    return (
        <div className="flex justify-center py-2">
            <div className="w-full max-w-xl">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-edge-soft" />

                    <span className="text-2xs font-bold tracking-caps text-faint">
                        {formatMessageTimestamp(message.createdAt)}
                    </span>

                    <div className="h-px flex-1 bg-edge-soft" />
                </div>

                <div className="mt-2 flex items-start justify-center gap-3 px-4">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-edge-strong bg-panel text-crimson shadow-hard-sm">
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
                <p className="font-bold tracking-label text-ash">
                    <span className="font-extrabold text-muted">
                        {groupCreator.username}
                    </span>
                    {" "}FORMED THE CIRCLE
                </p>

                <p className="mt-1 text-xs leading-relaxed text-faint">
                    with{" "}
                    {event.initMembers.map((member) => member.username).join(" · ")}
                </p>
            </>
        );
    }

    case "MEMBERS_INVITED":
        return (
            <>
                <p className="font-bold tracking-label text-ash">
                    {event.members.length === 1
                        ? "A NEW MEMBER JOINED THE CIRCLE"
                        : "NEW MEMBERS JOINED THE CIRCLE"}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-faint">
                    {event.members.map((member) => member.username).join(" · ")}
                </p>
            </>
        );
        
    case "MEMBER_LEFT":
        return (
            <p className="text-xs font-bold tracking-label text-ash">
                <span className="font-extrabold text-muted">
                    {event.subject.username}
                </span>
                {" "}LEFT THE CIRCLE
            </p>
        );

    case "MEMBER_REMOVED":
        return (
            <p className="text-xs font-bold tracking-label text-ash">
                <span className="font-extrabold text-muted">
                    {event.subject.username}
                </span>
                {" "}WAS REMOVED FROM THE CIRCLE
            </p>
        );


    case "GROUP_CLOSED":
        return <></>;
    }
}
