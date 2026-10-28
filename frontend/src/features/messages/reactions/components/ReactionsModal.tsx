// features/messages/reactions/components/ReactionsModal.tsx
import { Skull } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useModal } from "../../../../components/ModalProvider";
import { Avatar, EmptyState, ModalFrame, ModalHeader, Section, cn } from "../../../../components/ui";
import { useActiveConversationStore } from "../../../conversations/activeConversationStore";
import { REACTIONS, REACTION_TYPES, type ReactionType } from "../reactions";

type ReactionsModalProps = {
    conversationId: string;
    seq: number;
};

type Tab = "ALL" | ReactionType;

export default function ReactionsModal({ conversationId, seq }: ReactionsModalProps) {
    const { closeModal } = useModal();

    // from the store, so it stays live if someone reacts while this is open
    const reactions = useActiveConversationStore((s) => {
        if (s.conversation?.id !== conversationId) return null;
        const message = s.conversation.messages.find((m) => m.seq === seq);
        return message?.type === "USER" ? message.reactions : null;
    }) ?? [];

    const groups = REACTION_TYPES
        .map((type) => ({ type, users: reactions.filter((r) => r.type === type) }))
        .filter((g) => g.users.length > 0);

    const [selected, setSelected] = useState<Tab>("ALL");
    // the selected reaction lost its last soul while open → back to ALL
    const activeTab: Tab = selected === "ALL" || groups.some((g) => g.type === selected) ? selected : "ALL";

    const visible = activeTab === "ALL" ? reactions : reactions.filter((r) => r.type === activeTab);

    return (
        <ModalFrame>
            <ModalHeader
                eyebrow="TRANSMISSION RESPONSES"
                title="REACTIONS"
                subtitle={`${reactions.length} SOULS ANSWERED THIS TRANSMISSION.`}
                onClose={closeModal}
            />

            <Section index={1} title="RESPONDENTS">
                <div
                    role="tablist"
                    aria-label="Filter by reaction"
                    className="mb-3 flex border-2 border-edge bg-pit shadow-hard-md"
                >
                    <TabButton
                        active={activeTab === "ALL"}
                        onClick={() => setSelected("ALL")}
                        count={reactions.length}
                        label="All reactions"
                    >
                        ALL
                    </TabButton>

                    {groups.map(({ type, users }) => (
                        <TabButton
                            key={type}
                            active={activeTab === type}
                            onClick={() => setSelected(type)}
                            count={users.length}
                            label={type.toLowerCase()}
                        >
                            <span className="text-sm leading-none">{REACTIONS[type]}</span>
                        </TabButton>
                    ))}
                </div>

                <div role="tabpanel" className="max-h-104 overflow-y-auto pr-1 short:max-h-64">
                    {visible.length === 0 ? (
                        <EmptyState
                            icon={<Skull size={20} strokeWidth={2.2} />}
                            title="NO RESPONSES REMAIN"
                        />
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {visible.map((r) => (
                                <div
                                    key={r.userId}
                                    className="flex min-w-0 items-center gap-2.5 border-2 border-edge bg-pit p-3 shadow-hard-md"
                                >
                                    <Avatar name={r.username} size="sm" />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <p className="truncate text-sm font-bold">{r.username}</p>
                                        </div>

                                        <p className="mt-0.5 text-3xs font-bold tracking-label text-faint">
                                            {REACTIONS[r.type]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Section>
        </ModalFrame>
    );
}

type TabButtonProps = {
    active: boolean;
    onClick: () => void;
    count: number;
    /** Full name for hover + screen readers, since reaction tabs only show the emoji. */
    label: string;
    children: ReactNode;
};

function TabButton({ active, onClick, count, label, children }: TabButtonProps) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${label}, ${count}`}
            title={label.toUpperCase()}
            onClick={onClick}
            className={cn(
                // equal shares of the bar; min-w-0 lets them shrink instead of overflowing
                "flex min-w-0 flex-1 items-center justify-center gap-1.5 border-r border-edge px-1 py-2 last:border-r-0",
                "text-2xs font-bold tracking-caps transition-colors",
                active ? "bg-crimson-deep text-bone" : "text-faint hover:bg-panel hover:text-bone",
            )}
        >
            {children}
            <span className={cn("tabular-nums", active ? "text-ash" : "text-dim")}>{count}</span>
        </button>
    );
}