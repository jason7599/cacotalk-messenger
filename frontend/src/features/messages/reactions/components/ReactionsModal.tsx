// features/messages/components/ReactionsModal.tsx
import { useEffect } from "react";
import { REACTIONS, REACTION_TYPES } from "../reactions";
import { useModal } from "../../../../components/ModalProvider";
import { useAuthStore } from "../../../auth/authStore";
import { useActiveConversationStore } from "../../../conversations/activeConversationStore";
import { Avatar, cn, ModalFrame, ModalHeader, Section } from "../../../../components/ui";

type ReactionsModalProps = {
    conversationId: string;
    seq: number;
};

/**
 * Every reaction on a message, grouped by type, most reacted first. Read-only.
 * Reads the message from the active conversation store, so it stays live as
 * reaction WS events land.
 */
export default function ReactionsModal({ conversationId, seq }: ReactionsModalProps) {
    const { closeModal } = useModal();
    const myId = useAuthStore((s) => s.user!.userId);

    // returns the message's own reactions array (same reference until it changes), or null if it's gone
    const reactions = useActiveConversationStore((s) => {
        const conv = s.conversation;
        if (!conv || conv.id !== conversationId) return null;
        const msg = conv.messages.find((m) => m.seq === seq);
        return msg && "reactions" in msg ? msg.reactions : null;
    });

    // conversation switched or the message vanished: nothing left to show
    useEffect(() => {
        if (reactions === null) closeModal();
    }, [reactions, closeModal]);

    if (reactions === null) return null;

    // same ordering as the tray under the message
    const groups = REACTION_TYPES
        .map((type, order) => ({ type, order, users: reactions.filter((r) => r.type === type) }))
        .filter((g) => g.users.length > 0)
        .sort((a, b) => b.users.length - a.users.length || a.order - b.order);

    return (
        <ModalFrame>
            <ModalHeader
                eyebrow="MARKS LEFT BEHIND"
                title="REACTIONS"
                subtitle={`${reactions.length} ${reactions.length === 1 ? "SOUL HAS" : "SOULS HAVE"} SPOKEN.`}
                onClose={closeModal}
            />

            <div className="flex flex-col gap-6 short:gap-4">
                {groups.length === 0 && (
                    <p className="text-xs text-muted">Nobody has reacted. The silence is deafening.</p>
                )}

                {groups.map(({ type, users }, i) => (
                    <Section key={type} index={i + 1} title={`${REACTIONS[type]}  ${type.replace(/_/g, " ")} · ${users.length}`}>
                        <ul className="flex flex-col divide-y divide-edge border-2 border-edge bg-pit shadow-hard">
                            {users.map((u) => {
                                const isMe = u.userId === myId;
                                return (
                                    <li
                                        key={u.userId}
                                        className={cn(
                                            "flex items-center gap-3 border-l-2 px-3 py-2",
                                            isMe ? "border-crimson-bright bg-crimson-deep" : "border-transparent",
                                        )}
                                    >
                                        <Avatar name={u.username} size="sm" />
                                        <span className={cn("min-w-0 truncate text-sm font-bold", isMe ? "text-bone" : "text-muted")}>
                                            {u.username}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </Section>
                ))}
            </div>
        </ModalFrame>
    );
}