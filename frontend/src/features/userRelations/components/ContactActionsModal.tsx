import { Ban, UserMinus } from "lucide-react";
import type { UserInfo } from "../../../shared/types";
import { useBlockedUsersStore } from "../blockedUsersStore";
import { useContactsStore } from "../contactsStore";
import { useModal } from "../../../components/ModalProvider";
import { useState } from "react";
import { getErrorMessage } from "../../../shared/apiError";
import {
    ActionCard,
    ConfirmButton,
    ConsequenceList,
    ErrorText,
    ModalFrame,
    ModalHeader,
    Section,
} from "../../../components/ui";

type ContactActionsModalProps = {
    contact: UserInfo;
};

export default function ContactActionsModal({ contact }: ContactActionsModalProps) {
    const { closeModal } = useModal();

    const blockUser = useBlockedUsersStore((s) => s.blockUser);
    const blockingIds = useBlockedUsersStore((s) => s.pendingIds);

    const removeContact = useContactsStore((s) => s.removeContact);

    const isBlocking = blockingIds.has(contact.userId);

    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isBusy = isBlocking || isRemoving;

    async function handleRemove() {
        if (isBusy) {
            return;
        }

        setError(null);
        setIsRemoving(true);

        try {
            await removeContact(contact.userId);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsRemoving(false);
        }
    }

    async function handleBlock() {
        if (isBusy) return;

        setError(null);

        try {
            await blockUser(contact.userId);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }

    return (
        <ModalFrame>
            <ModalHeader
                eyebrow="CONTACT CONTROL"
                title={contact.username}
                titleTooltip={contact.username}
                subtitle="ALTER THIS SOUL'S ACCESS."
                onClose={closeModal}
                closeDisabled={isBusy}
            />

            <div className="flex flex-col gap-6 short:gap-4">
                <Section index={1} title="RELATION">
                    <ActionCard
                        title="SEVER CONTACT"
                        description="Remove this soul from your directory."
                    >
                        <ConfirmButton
                            variant="secondary"
                            onConfirm={handleRemove}
                            disabled={isBusy}
                            loading={isRemoving}
                            loadingLabel="SEVERING..."
                            icon={<UserMinus size={17} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            REMOVE CONTACT
                        </ConfirmButton>
                    </ActionCard>
                </Section>

                <Section index={2} title="RESTRICTION">
                    <ActionCard
                        title="CONDEMN TO SILENCE"
                        description="Sever direct contact with this user."
                    >
                        <ConsequenceList
                            items={[
                                "The condemned soul will not be notified.",
                                "Removed from your contacts.",
                                "Direct messages are sealed for both parties.",
                                "Group invitations are blocked.",
                                "Existing group conversations remain untouched.",
                            ]}
                        />

                        <ConfirmButton
                            onConfirm={handleBlock}
                            disabled={isBusy}
                            loading={isBlocking}
                            loadingLabel="CONDEMNING..."
                            icon={<Ban size={17} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            BANISH SOUL
                        </ConfirmButton>
                    </ActionCard>
                </Section>

                {error && <ErrorText>{error}</ErrorText>}
            </div>
        </ModalFrame>
    );
}
