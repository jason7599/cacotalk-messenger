import { ChevronRight, LogOut, ShieldBan, Skull } from "lucide-react";
import { useModal } from "./ModalProvider";
import { useState, type ReactNode } from "react";
import BlockedUsersModal from "../features/userRelations/components/BlockedUsersModal";
import { useAuthStore } from "../features/auth/authStore";
import AboutScreen from "./AboutScreen";
import { ActionCard, CheckboxCard, ConfirmButton, ModalFrame, ModalHeader, Section, press } from "./ui";
import { useNotificationSettingsStore } from "../features/notifications/notificationSettingsStore";
import { playMessageSound, unlockAudio } from "../features/notifications/sound";
import { getDesktopPermission, requestDesktopPermission, type DesktopPermission } from "../features/notifications/desktopNotifications";

export default function SettingsModal() {
    const logout = useAuthStore((s) => s.logout);
    const { openModal, closeModal } = useModal();

    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        try {
            await logout();
            closeModal();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <ModalFrame>
            <ModalHeader
                eyebrow="INFERNAL CONTROL PANEL"
                title="SETTINGS"
                subtitle="TAMPER WITH YOUR LOCAL DAMNATION."
                onClose={closeModal}
                closeDisabled={loggingOut}
            />

            <div className="flex flex-col gap-6 short:gap-4">
                <Section index={1} title="BLACKLIST">
                    <SettingsLink
                        disabled={loggingOut}
                        onClick={() => openModal(<BlockedUsersModal />)}
                        icon={<ShieldBan size={20} strokeWidth={2.2} />}
                        title="MANAGE BANISHED SOULS"
                        description="Inspect and release souls condemned to silence."
                    />
                </Section>

                <Section index={2} title="SIGNALS">
                    <NotificationSettings />
                </Section>

                <Section index={3} title="SESSION">
                    <ActionCard
                        title="TERMINATE CURRENT SESSION"
                        description="Destroy this session and return to the authentication gate."
                    >
                        <ConfirmButton
                            onConfirm={handleLogout}
                            loading={loggingOut}
                            loadingLabel="ESCAPING THE PIT..."
                            icon={<LogOut size={17} strokeWidth={2.5} />}
                            className="w-full"
                        >
                            ABANDON THE PIT
                        </ConfirmButton>
                    </ActionCard>
                </Section>

                <Section index={4} title="ABOUT">
                    <SettingsLink
                        disabled={loggingOut}
                        onClick={() => openModal(<AboutScreen />, { bare: true })}
                        icon={<Skull size={20} strokeWidth={2.2} />}
                        title="ABOUT CACOTALK"
                        description="Who summoned this place, and how."
                    />
                </Section>
            </div>
        </ModalFrame>
    );
}

type SettingsLinkProps = {
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
};

/** A row that leads somewhere else: icon, title + description, chevron. */
function SettingsLink({ icon, title, description, onClick, disabled }: SettingsLinkProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`group flex w-full items-center gap-4 border-2 border-edge bg-pit p-4 text-left shadow-hard-lg hover:border-crimson-bright hover:bg-panel disabled:pointer-events-none disabled:opacity-50 ${press}`}
        >
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-edge-strong bg-panel text-crimson-bright group-hover:border-crimson-bright">
                {icon}
            </div>

            <div className="flex-1">
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
            </div>

            <ChevronRight size={18} strokeWidth={2.4} className="text-crimson group-hover:text-crimson-bright" />
        </button>
    );
}

/** Sound + desktop alert toggles. Saved per browser. */
function NotificationSettings() {
    const soundEnabled = useNotificationSettingsStore((s) => s.soundEnabled);
    const desktopEnabled = useNotificationSettingsStore((s) => s.desktopEnabled);
    const setSoundEnabled = useNotificationSettingsStore((s) => s.setSoundEnabled);
    const setDesktopEnabled = useNotificationSettingsStore((s) => s.setDesktopEnabled);

    // Browser permission can't be subscribed to, so read it on open and after each request.
    const [permission, setPermission] = useState<DesktopPermission>(getDesktopPermission);

    function handleSound(enabled: boolean) {
        setSoundEnabled(enabled);
        if (enabled) {
            // this click unlocks audio, so the preview can play right away
            unlockAudio();
            setTimeout(() => playMessageSound(), 50);
        }
    }

    async function handleDesktop(enabled: boolean) {
        if (!enabled) {
            setDesktopEnabled(false);
            return;
        }

        const result = permission === "granted" ? "granted" : await requestDesktopPermission();
        setPermission(result);
        setDesktopEnabled(result === "granted");
    }

    const desktopDescription =
        permission === "unsupported"
            ? "This browser can't raise desktop alerts."
            : permission === "denied"
                ? "Blocked by your browser. Allow notifications for this site in the browser's settings, then come back."
                : "Pop up an alert when a transmission arrives while CacoTalk isn't focused. Only while a tab is open.";

    return (
        <div className="flex flex-col gap-2">
            <CheckboxCard checked={soundEnabled} onChange={handleSound} title="TOLL THE BELL">
                Play a sound when a transmission arrives in a channel you're not looking at.
            </CheckboxCard>

            <CheckboxCard
                checked={desktopEnabled && permission === "granted"}
                onChange={handleDesktop}
                disabled={permission === "unsupported" || permission === "denied"}
                title="DESKTOP ALERTS"
            >
                {desktopDescription}
            </CheckboxCard>
        </div>
    );
}
