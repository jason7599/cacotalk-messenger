import { UserPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { useModal } from "../../../components/ModalProvider";
import { ApiError, getErrorMessage } from "../../../shared/apiError";
import { apiGetInvitableUsers, apiInviteMembers } from "../conversationsApi";
import { useActiveConversationStore } from "../activeConversationStore";
import { Button, ErrorText, ModalFrame, ModalHeader } from "../../../components/ui";
import { MAX_GROUP_MEMBERS } from "../../../shared/constants";
import { useMemberSelection } from "../useMemberSelection";
import MemberPicker from "./MemberPicker";
import GroupMembersModal from "./GroupMembersModal";

const MIN_INVITE_COUNT = 1;

export default function InviteMembersModal() {
    const { openModal, closeModal } = useModal();

    const conversationId = useActiveConversationStore((s) => s.conversation!.id);
    const memberCount = useActiveConversationStore((s) => s.conversation!.otherMembers.length + 1);

    // Inviting can't push the group over the member limit.
    const maxInviteCount = Math.max(0, MAX_GROUP_MEMBERS - memberCount);

    const fetchInvitableUsers = useCallback(
        () => apiGetInvitableUsers(conversationId),
        [conversationId]
    );

    const selection = useMemberSelection(fetchInvitableUsers, maxInviteCount);
    const { selected } = selection;

    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canInvite =
        MIN_INVITE_COUNT <= selected.size &&
        selected.size <= maxInviteCount
    ;

    async function handleInvite() {
        if (!canInvite || inviting) {
            return;
        }

        setInviting(true);
        setError(null);

        try {
            await apiInviteMembers(conversationId, Array.from(selected));
            closeModal();
        } catch (err) {
            setError(getErrorMessage(err));

            if (ApiError.is(err, "MEMBERS_NOT_INVITABLE")) {
                try {
                    await selection.reload();
                } catch {
                    // Preserve the original invite error.
                }
            }
        } finally {
            setInviting(false);
        }
    }

    const shownError = error ?? selection.loadError;

    let buttonLabel = "INVITE SOULS";
    if (inviting) {
        buttonLabel = "SUMMONING...";
    } else if (selected.size > 0) {
        buttonLabel = `INVITE ${selected.size} ${selected.size === 1 ? "SOUL" : "SOULS"}`;
    }

    return (
        <ModalFrame size="lg">
            <ModalHeader
                eyebrow="CHANNEL EXPANSION"
                title="INVITE SOULS"
                meta={`${memberCount} / ${MAX_GROUP_MEMBERS} BOUND`}
                subtitle="SUMMON MORE SOULS INTO THIS CHANNEL."
                onClose={closeModal}
                closeDisabled={inviting}
                onBack={() => openModal(<GroupMembersModal />)}
            />

            {shownError && <ErrorText className="mb-6">{shownError}</ErrorText>}

            <div className="flex flex-col gap-6 short:gap-4">
                <MemberPicker
                    selection={selection}
                    min={MIN_INVITE_COUNT}
                    max={maxInviteCount}
                    hint="Your contacts who aren't in this channel yet are shown below. Contacts who have blocked you are excluded."
                    countLabel="INVITES"
                />

                <Button
                    disabled={!canInvite || inviting}
                    loading={inviting}
                    onClick={handleInvite}
                    icon={<UserPlus size={17} strokeWidth={2.5} />}
                    className="w-full"
                >
                    {buttonLabel}
                </Button>
            </div>
        </ModalFrame>
    );
}
