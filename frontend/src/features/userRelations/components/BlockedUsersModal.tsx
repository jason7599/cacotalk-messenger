import { ShieldBan, Unlock } from "lucide-react";
import SettingsModal from "../../../components/SettingsModal";
import { useBlockedUsersStore } from "../blockedUsersStore";
import { useModal } from "../../../components/ModalProvider";
import { useMemo, useState } from "react";
import { Avatar, Button, EmptyState, ModalFrame, ModalHeader, SearchInput } from "../../../components/ui";

export default function BlockedUsersModal() {
    const { openModal, closeModal } = useModal();

    const blockedUsersById = useBlockedUsersStore((s) => s.blockedUsersById);
    const pendingIds = useBlockedUsersStore((s) => s.pendingIds);
    const unblockUser = useBlockedUsersStore((s) => s.unblockUser);

    const blockedCount = Object.keys(blockedUsersById).length;

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        return Object.values(blockedUsersById)
            .filter((user) =>
                !normalized
                || user.username.toLowerCase().includes(normalized)
            )
            .sort((a, b) =>
                a.username.localeCompare(b.username)
            );
    }, [blockedUsersById, query]);

    return (
        <ModalFrame>
            <ModalHeader
                eyebrow="BLACKLIST // ACTIVE"
                title="BANISHED SOULS"
                meta={`${blockedCount} ${blockedCount === 1 ? "SOUL" : "SOULS"}`}
                subtitle="REVIEW THOSE CAST INTO SILENCE."
                onClose={closeModal}
                onBack={() => openModal(<SettingsModal />)}
            />

            <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="SEARCH THE BANISHED..."
                className="mb-4"
            />

            <div className="max-h-96 overflow-y-auto border-2 border-edge bg-sunken">
                {filtered.length === 0 ? (
                    <EmptyState
                        icon={<ShieldBan size={22} strokeWidth={2.2} />}
                        title={blockedCount === 0 ? "THE BLACKLIST IS EMPTY" : "NO MATCHING SOULS"}
                    />
                ) : (
                    filtered.map((user) => {
                        const pending = pendingIds.has(user.userId);

                        return (
                            <div
                                key={user.userId}
                                className="flex items-center gap-3 border-b border-edge bg-panel px-4 py-3 last:border-b-0 hover:bg-panel-hover"
                            >
                                <Avatar name={user.username} />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">{user.username}</p>

                                    <p className="mt-1 text-2xs tracking-label text-faint">
                                        CONDEMNED TO SILENCE
                                    </p>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => unblockUser(user.userId)}
                                    disabled={pending}
                                    icon={<Unlock size={14} strokeWidth={2.5} />}
                                >
                                    {pending ? "RELEASING..." : "RELEASE"}
                                </Button>
                            </div>
                        );
                    })
                )}
            </div>

            <footer className="caption mt-4 border-t border-edge pt-3">
                BLACKLIST RECORDS // {blockedCount} TOTAL // LOCAL RELATIONS
            </footer>
        </ModalFrame>
    );
}
