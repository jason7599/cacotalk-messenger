import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import { getErrorMessage } from "../../../shared/apiError";
import { useActiveConversationStore } from "../activeConversationStore";
import {
    ActionCard,
    ConfirmButton,
    ConsequenceList,
    ErrorText,
    ModalFrame,
    ModalHeader,
    Section,
} from "../../../components/ui";
import GroupMembersModal from "./GroupMembersModal";
import { apiCloseConversation } from "../conversationsApi";

export default function CloseGroupModal() {
    const { openModal, closeModal } = useModal();

    const conversationId = useActiveConversationStore((s) => s.conversation!.id);

    const [closing, setClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleClose() {
        if (closing) return;

        setError(null);
        setClosing(true);

        try {
            await apiCloseConversation(conversationId);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setClosing(false);
        }
    }

    return (
        <ModalFrame>
            <ModalHeader
                eyebrow="CHANNEL CONTROL"
                title="SEAL CHANNEL"
                subtitle="CONDEMN THIS CHANNEL TO ETERNAL SILENCE."
                onClose={closeModal}
                closeDisabled={closing}
                onBack={closing ? undefined : () => openModal(<GroupMembersModal />)}
            />

            <div className="flex flex-col gap-6 short:gap-4">
                <Section index={1} title="FINAL JUDGMENT">
                    <ActionCard
                        title="SEAL THIS CHANNEL"
                        description="Silence every soul bound to this channel, forever."
                    >
                        <ConsequenceList
                            items={[
                                "This CANNOT be undone.",
                                "No one can send new transmissions, including you.",
                                "The transmission history is preserved.",
                            ]}
                        />

                        <ConfirmButton
                            onConfirm={handleClose}
                            loading={closing}
                            loadingLabel="SEALING..."
                            icon={<LockKeyhole size={17} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            SEAL CHANNEL
                        </ConfirmButton>
                    </ActionCard>
                </Section>

                {error && <ErrorText>{error}</ErrorText>}
            </div>
        </ModalFrame>
    );
}
