import { memo, useRef } from "react";
import { useActiveConversationStore } from "../../../conversations/activeConversationStore";
import UserMessageItem from "./UserMessageItem";
import EventMessageItem from "./EventMessageItem";
import { useInitialScrollPosition } from "./useInitialScrollPosition";
import { useLoadOlderMessages } from "./useLoadOlderMessages";
import { useStickToBottom } from "./useStickToBottom";
import { ChevronDown } from "lucide-react";
import { useMessageSendStore, type PendingMessage } from "../../messageSendStore";
import PendingMessageItem from "./PendingMessageItem";
import FailedMessageItem from "./FailedMessageItem";
import { Spinner } from "../../../../components/ui";
import type { ChatMessage } from "../../types";

const EMPTY_QUEUE: PendingMessage[] = [];

const MessageRow = memo(function MessageRow({
    message,
    showUnreadDivider
} : {
    message: ChatMessage;
    showUnreadDivider: boolean;
}) {
    return (
        <div data-seq={message.seq}>
            {message.type === "USER"
                ? <UserMessageItem message={message} />
                : <EventMessageItem message={message} />
            }
            {showUnreadDivider && <UnreadDivider />}
        </div>
    );
});


export default function MessageList() {
    const conversationId = useActiveConversationStore((s) => s.conversation!.id);

    const messages = useActiveConversationStore((s) => s.conversation!.messages);

    const loadOlderMessages = useActiveConversationStore((s) => s.loadOlderMessages);
    const loadingOlder = useActiveConversationStore((s) => s.loadingOlder);
    const hasOlder = useActiveConversationStore((s) => s.conversation!.hasOlder);

    const myLastReadSeq = useActiveConversationStore((s) => s.conversation!.myLastReadSeq);
    const lastSeqSnapshot = useActiveConversationStore((s) => s.conversation!.lastSeqSnapshot);

    // Stable reference so the ?? fallback doesn't allocate a new array
    const pendingMessages = useMessageSendStore((s) => s.queues[conversationId]?.queue ?? EMPTY_QUEUE);
    const failedMessages = useMessageSendStore((s) => s.queues[conversationId]?.failed ?? EMPTY_QUEUE);

    const sendError = useMessageSendStore((s) => s.queues[conversationId]?.error ?? null);

    const retry = useMessageSendStore((s) => s.retry);
    const discard = useMessageSendStore((s) => s.discard);

    const scrollRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);

    const showDivider = 0 < myLastReadSeq && myLastReadSeq < lastSeqSnapshot;

    // This is just for detecting when the user sends a message, so that we can scroll down
    const lastOutgoingClientId = pendingMessages.at(-1)?.clientId ?? null;

    useInitialScrollPosition({
        containerRef: scrollRef,
        messages,
        myLastReadSeq
    });

    useLoadOlderMessages({
        containerRef: scrollRef,
        sentinelRef: topSentinelRef,
        hasOlder,
        loadingOlder,
        loadOlderMessages,
        dependency: messages
    });

    const { isNearBottom, scrollToBottom } = useStickToBottom({
        containerRef: scrollRef,
        lastMessageSeq: messages[messages.length - 1]?.seq,
        lastOutgoingClientId
    });

    return (
        <div className="relative min-h-0 flex-1">
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto px-5 py-4"
                style={{ overflowAnchor: "none" }}
            >
                <div ref={topSentinelRef} className="flex h-9 items-center justify-center py-2">
                    {loadingOlder && (
                        <Spinner size="lg" className="text-faint" />
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                        <MessageRow
                            key={message.seq}
                            message={message}
                            showUnreadDivider={showDivider && message.seq === myLastReadSeq}
                        />
                    ))}

                    {failedMessages.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {failedMessages.map((m) => (
                                <FailedMessageItem
                                    key={`failed-${m.clientId}`}
                                    content={m.content}
                                    onRetry={() => retry(conversationId, m.clientId)}
                                    onDiscard={() => discard(conversationId, m.clientId)}
                                />
                            ))}

                            {sendError && (
                                <div className="text-right text-2xs font-bold tracking-widest text-crimson/80">
                                    {sendError.toUpperCase()}
                                </div>
                            )}
                        </div>
                    )}

                    {pendingMessages.map((m) => (
                        <PendingMessageItem key={`pending-${m.clientId}`} content={m.content} />
                    ))}
                </div>
            </div>

            {!isNearBottom && messages.length > 0 && (
                <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 border-2 border-crimson-bright bg-crimson px-4 py-2.5 text-xs font-bold tracking-caps text-bone shadow-hard-lg shadow-shade-crimson hover:bg-crimson-bright active:shadow-hard-xs"
                >
                    <ChevronDown size={15} strokeWidth={2.5} />
                    RETURN TO THE LIVING
                </button>
            )}
        </div>
    );
};

function UnreadDivider() {
    return (
        <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-edge" />
            <span className="text-2xs font-bold tracking-loud text-crimson">
                NEW WHISPERS
            </span>
            <div className="h-px flex-1 bg-crimson" />
        </div>
    );
};