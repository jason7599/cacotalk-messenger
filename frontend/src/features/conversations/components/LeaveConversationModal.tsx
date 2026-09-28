import { LogOut } from "lucide-react";
import { useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import { getErrorMessage } from "../../../shared/apiError";
import { useActiveConversationStore } from "../activeConversationStore";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import type { UserInfo } from "../../../shared/types";
import {
    ActionCard,
    CheckboxCard,
    ConfirmButton,
    ConsequenceList,
    ErrorText,
    ModalFrame,
    ModalHeader,
    Section,
} from "../../../components/ui";

type LeaveConversationModalProps = {
    groupCreator: UserInfo;
};

export default function LeaveConversationModal({ groupCreator } : LeaveConversationModalProps) {
    const { closeModal } = useModal();

    const leaveConversation = useActiveConversationStore((s) => s.leaveConversation);
    const blockUser = useBlockedUsersStore((s) => s.blockUser);

    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blockCreator, setBlockCreator] = useState(false);

    const hasBlockedCreator = useBlockedUsersStore((s) => !!s.blockedUsersById[groupCreator.userId]);

    async function handleLeave() {
        if (isLeaving) return;

        setError(null);
        setIsLeaving(true);

        try {
            if (!hasBlockedCreator && blockCreator) {
                await blockUser(groupCreator.userId);
            }

            await leaveConversation();

            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLeaving(false);
        }
    }

    return (
        <ModalFrame>
            <ModalHeader
                title="CHANNEL CONTROL"
                subtitle="TERMINATE YOUR PRESENCE IN THIS CHANNEL."
                onClose={closeModal}
                closeDisabled={isLeaving}
            />

            <div className="flex flex-col gap-6">
                <Section index={1} title="DEPARTURE">
                    <ActionCard
                        title="ABANDON CHANNEL"
                        description="Sever your connection to this conversation."
                    >
                        <ConsequenceList
                            items={[
                                "You will leave this channel.",
                                "New transmissions will no longer reach you.",
                                "You will not see this conversation in your list.",
                            ]}
                        />

                        {!hasBlockedCreator && (
                            <CheckboxCard
                                checked={blockCreator}
                                disabled={isLeaving}
                                onChange={setBlockCreator}
                                title="SEAL THE SOURCE"
                            >
                                Also block{" "}
                                <span className="font-bold text-ash">{groupCreator.username}</span>
                                , the creator of this channel. This prevents future invitations from
                                this soul.
                            </CheckboxCard>
                        )}

                        <ConfirmButton
                            onConfirm={handleLeave}
                            loading={isLeaving}
                            loadingLabel="DEPARTING..."
                            icon={<LogOut size={17} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            ABANDON CHANNEL
                        </ConfirmButton>
                    </ActionCard>
                </Section>

                {error && <ErrorText>{error}</ErrorText>}
            </div>
        </ModalFrame>
    );
}
