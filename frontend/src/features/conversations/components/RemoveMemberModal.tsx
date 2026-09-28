import { UserMinus } from "lucide-react";
import type { UserInfo } from "../../../shared/types";
import { useBlockedUsersStore } from "../../userRelations/blockedUsersStore";
import { useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import { apiRemoveMember } from "../conversationsApi";
import { useActiveConversationStore } from "../activeConversationStore";
import { getErrorMessage } from "../../../shared/apiError";
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

type RemoveMemberModalProps = {
    member: UserInfo;
};

export default function RemoveMemberModal({ member }: RemoveMemberModalProps) {
    const { closeModal } = useModal();

    const conversationId = useActiveConversationStore((s) => s.conversation!.id);

    const hasBlocked = useBlockedUsersStore((s) => !!s.blockedUsersById[member.userId]);
    const blockUser = useBlockedUsersStore((s) => s.blockUser);

    const [doBlockUser, setBlockUser] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [removing, setRemoving] = useState(false);

    async function handleRemove() {
        if (removing) return;

        setError(null);
        setRemoving(true);

        try {
            if (!hasBlocked && doBlockUser) {
                await blockUser(member.userId);
            }
            
            await apiRemoveMember(conversationId, member.userId);

            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setRemoving(false);
        }
    }

    return (
        <ModalFrame>
            <ModalHeader
                title="MEMBER CONTROL"
                subtitle="REVOKE A SOUL'S PLACE IN THIS CHANNEL."
                onClose={closeModal}
                closeDisabled={removing}
            />

            <div className="flex flex-col gap-6 short:gap-4">
                <Section index={1} title="EXILE">
                    <ActionCard
                        title={
                            <>
                                REMOVE <span className="text-ash">{member.username}</span>
                            </>
                        }
                        description="Cast this member out of the channel."
                    >
                        <ConsequenceList
                            items={[
                                "They will be removed from this channel.",
                                "New transmissions will no longer reach them.",
                                "The channel will disappear from their conversation list.",
                            ]}
                        />

                        {!hasBlocked && (
                            <CheckboxCard
                                checked={doBlockUser}
                                disabled={removing}
                                onChange={setBlockUser}
                                title="SEAL THE TARGET"
                            >
                                Also block{" "}
                                <span className="font-bold text-ash">{member.username}</span>
                                . Future direct transmissions from this soul will be silenced.
                            </CheckboxCard>
                        )}

                        <ConfirmButton
                            onConfirm={handleRemove}
                            loading={removing}
                            loadingLabel="REMOVING..."
                            icon={<UserMinus size={17} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            REMOVE MEMBER
                        </ConfirmButton>
                    </ActionCard>
                </Section>

                {error && <ErrorText>{error}</ErrorText>}
            </div>
        </ModalFrame>
    );
}
