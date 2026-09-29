import { Users } from "lucide-react";
import { useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import { apiGetInvitableUsers } from "../../userRelations/userRelationsApi";
import { ApiError, getErrorMessage } from "../../../shared/apiError";
import { apiCreateGroupConversation } from "../conversationsApi";
import { useActiveConversationStore } from "../activeConversationStore";
import { Button, ErrorText, ModalFrame, ModalHeader } from "../../../components/ui";
import { MAX_GROUP_MEMBERS } from "../../../shared/constants";
import { useMemberSelection } from "../useMemberSelection";
import MemberPicker from "./MemberPicker";

// excluding user.
const MIN_INVITE_COUNT = 2;
const MAX_INVITE_COUNT = MAX_GROUP_MEMBERS - 1;

export default function CreateGroupModal() {
    const { closeModal } = useModal();

    const setActiveConversation = useActiveConversationStore((s) => s.setActiveConversation);

    const selection = useMemberSelection(apiGetInvitableUsers, MAX_INVITE_COUNT);
    const { selected } = selection;

    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canCreate =
        MIN_INVITE_COUNT <= selected.size &&
        selected.size <= MAX_INVITE_COUNT
    ;

    async function handleCreate() {
        if (!canCreate || creating) {
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const id = await apiCreateGroupConversation(
                Array.from(selected)
            );

            await setActiveConversation(id);
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));
        
            if (ApiError.is(err, "MEMBERS_NOT_INVITABLE")) {
                try {
                    await selection.reload();
                } catch {
                    // Preserve the original create error.
                }
            }
        } finally {
            setCreating(false);
        }
    }

    const shownError = error ?? selection.loadError;

    return (
        <ModalFrame size="lg">
            <ModalHeader
                eyebrow="ESTABLISH NEW CHANNEL"
                title="GROUP TRANSMISSION"
                subtitle="ASSEMBLE THE SOULS TO BE BOUND TO THIS CHANNEL."
                onClose={closeModal}
                closeDisabled={creating}
            />

            {shownError && <ErrorText className="mb-6">{shownError}</ErrorText>}

            <div className="flex flex-col gap-6 short:gap-4">
                <MemberPicker
                    selection={selection}
                    min={MIN_INVITE_COUNT}
                    max={MAX_INVITE_COUNT}
                    hint="Your contacts eligible for this group are shown below. Contacts who have blocked you are excluded."
                    countLabel="MEMBERS"
                />

                <Button
                    disabled={!canCreate || creating}
                    loading={creating}
                    onClick={handleCreate}
                    icon={<Users size={17} strokeWidth={2.5} />}
                    className="w-full"
                >
                    {creating ? "OPENING CHANNEL..." : "CREATE GROUP TRANSMISSION"}
                </Button>
            </div>
        </ModalFrame>
    );
}
