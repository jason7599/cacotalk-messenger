import { LockKeyhole, LogOut, UserPlus } from "lucide-react";
import { useModal } from "../../../components/ModalProvider";
import { useActiveConversationStore } from "../activeConversationStore";
import GroupMemberRow from "./GroupMemberItem";
import LeaveConversationModal from "./LeaveConversationModal";
import { useAuthStore } from "../../auth/authStore";
import { Button, ModalFrame, ModalHeader, Section } from "../../../components/ui";

export default function GroupMembersModal() {
    const me = useAuthStore((s) => s.user!);
    const { openModal, closeModal } = useModal();

    const conversation = useActiveConversationStore((s) => s.conversation)!;
    const { otherMembers, meta } = conversation;

    if (meta.type !== "GROUP") {
        return null;
    }

    const amICreator = meta.groupCreator.userId === me.userId;

    const members = [me, ...otherMembers];

    return (
        <ModalFrame size="lg">
            <ModalHeader
                eyebrow="CHANNEL MANIFEST"
                title="GROUP MEMBERS"
                subtitle={`${members.length} SOULS CURRENTLY BOUND TO THIS CHANNEL.`}
                onClose={closeModal}
            />

            <div className="flex flex-col gap-6 short:gap-4">
                <Section index={1} title="BOUND SOULS">
                    <div className="max-h-104 overflow-y-auto pr-1 short:max-h-64">
                        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
                            {members.map((member) => 
                                <GroupMemberRow
                                    key={member.userId}
                                    member={member}
                                />
                            )}
                        </div>
                    </div>
                </Section>

                <Section index={2} title="CHANNEL CONTROL">
                    {!amICreator ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openModal(<LeaveConversationModal groupCreator={meta.groupCreator}/>)}
                            icon={<LogOut size={14} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            LEAVE CHANNEL
                        </Button>
                    ) : meta.isClosed ? (
                        <div className="border-2 border-edge bg-pit px-4 py-3 text-center shadow-hard-md">
                            <p className="text-xs font-bold tracking-label text-muted">CHANNEL SEALED</p>
                            <p className="mt-1 text-2xs text-faint">
                                This channel has been condemned to silence.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                icon={<UserPlus size={14} strokeWidth={2.5} className="text-crimson" />}
                            >
                                INVITE SOULS
                            </Button>

                            <Button
                                size="sm"
                                icon={<LockKeyhole size={14} strokeWidth={2.6} />}
                            >
                                CLOSE CHANNEL
                            </Button>
                        </div>
                    )}
                </Section>
            </div>
        </ModalFrame>
    );
}
