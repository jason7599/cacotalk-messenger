import { ExternalLink, GitBranch, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import cacotalkLogo from "../assets/cacotalk-logo.webp";
import { useModal } from "./ModalProvider";
import { Avatar, IconButton, Section, buttonClassName, cn } from "./ui";

const GITHUB_URL = "https://github.com/jason7599/cacotalk-messenger";

// Easter egg: click the logo this many times quickly and the pit overflows.
const SUMMON_CLICKS = 6;
const SUMMON_WINDOW_MS = 2500;
const DOWNPOUR_MS = 6660;

/** Seeded pseudo-random numbers: looks random, but identical on every render. */
function seeded(seed: number) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

type Skull = { left: number; size: number; duration: number; delay: number; opacity: number; spin: number; sway: number };

function makeSkulls(count: number, seed: number, speed = 1, startNow = false): Skull[] {
    const rand = seeded(seed);

    return Array.from({ length: count }, () => {
        const depth = rand(); // 0 = far away (small, slow, faint), 1 = close (big, fast, bright)

        return {
            left: rand() * 100,
            size: 10 + depth * 16,
            duration: (24 - depth * 13 + rand() * 4) * speed,
            // negative delay = already mid-fall when the page opens, so the screen isn't empty at first
            delay: startNow ? rand() * 1.5 : -rand() * 24,
            opacity: 0.07 + depth * 0.23,
            spin: (rand() > 0.5 ? 1 : -1) * (90 + rand() * 270),
            sway: (rand() - 0.5) * 90,
        };
    });
}

type Ember = { left: number; size: number; duration: number; delay: number; drift: number };

function makeEmbers(count: number, seed: number): Ember[] {
    const rand = seeded(seed);

    return Array.from({ length: count }, () => ({
        left: rand() * 100,
        size: 2 + Math.round(rand() * 3),
        duration: 7 + rand() * 7,
        delay: -rand() * 14,
        drift: (rand() - 0.5) * 160,
    }));
}

const SKULLS = makeSkulls(22, 666);
const DOWNPOUR_SKULLS = makeSkulls(70, 6666, 0.35, true);
const EMBERS = makeEmbers(36, 13);

function FallingSkulls({ skulls }: { skulls: Skull[] }) {
    return skulls.map((s, i) => (
        <span
            key={i}
            className="absolute top-0 animate-skull-fall text-crimson"
            style={{
                left: `${s.left}%`,
                opacity: s.opacity,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
                "--spin": `${s.spin}deg`,
                "--sway": `${s.sway}px`,
            } as CSSProperties}
        >
            <SkullGlyph size={s.size} />
        </span>
    ));
}

/** lucide's Skull, inlined as a plain function so 90 of them stay cheap. */
function SkullGlyph({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12.5 17-.5-1-.5 1h1z" />
            <path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="9" cy="12" r="1" />
        </svg>
    );
}

/** Full-screen "about" page. Open with openModal(<AboutScreen />, { bare: true }). */
export default function AboutScreen() {
    const { closeModal } = useModal();

    const [downpour, setDownpour] = useState(false);
    const clicks = useRef<number[]>([]);

    // Escape closes, like a modal.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [closeModal]);

    // The downpour ends by itself.
    useEffect(() => {
        if (!downpour) return;
        const id = window.setTimeout(() => setDownpour(false), DOWNPOUR_MS);
        return () => window.clearTimeout(id);
    }, [downpour]);

    function handleLogoClick() {
        const now = Date.now();
        clicks.current = [...clicks.current.filter((t) => now - t < SUMMON_WINDOW_MS), now];

        if (clicks.current.length >= SUMMON_CLICKS) {
            clicks.current = [];
            setDownpour(true);
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="About CacoTalk"
            className="fixed inset-0 z-50 overflow-y-auto bg-void text-bone"
        >
            {/* hellfire glow from below (static, so it stays even with reduced motion) */}
            <div
                aria-hidden="true"
                className={cn(
                    "pointer-events-none fixed inset-x-0 bottom-0 h-3/4 transition-opacity duration-700",
                    "bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklab,var(--color-crimson)_38%,transparent),transparent_70%)]",
                    downpour ? "opacity-100" : "opacity-70",
                )}
            />

            {/* falling skulls + rising embers */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden motion-reduce:hidden">
                <FallingSkulls skulls={SKULLS} />
                {downpour && <FallingSkulls skulls={DOWNPOUR_SKULLS} />}

                {EMBERS.map((e, i) => (
                    <span
                        key={i}
                        className="absolute bottom-0 animate-ember-rise bg-crimson-bright shadow-[0_0_8px_2px_var(--color-crimson-bright)]"
                        style={{
                            left: `${e.left}%`,
                            width: e.size,
                            height: e.size,
                            animationDuration: `${e.duration}s`,
                            animationDelay: `${e.delay}s`,
                            "--drift": `${e.drift}px`,
                        } as CSSProperties}
                    />
                ))}
            </div>

            <div className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
                <IconButton onClick={closeModal} aria-label="Close">
                    <X size={18} strokeWidth={2.5} />
                </IconButton>
            </div>

            {downpour && (
                <p className="pointer-events-none fixed inset-x-0 top-[max(1.5rem,env(safe-area-inset-top))] z-10 animate-pulse text-center text-xs font-black tracking-loud text-crimson-bright">
                    THE PIT OVERFLOWS
                </p>
            )}

            {/*
              Sized to the viewport: content is vertically centred in one screen, and the logo
              scales with screen height (dvh) so short laptop screens don't force a scroll.
              The outer container still scrolls as a fallback on really tiny screens.
            */}
            <main className="relative mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))]">
                {/* logo + breathing glow. Psst: click it a few times. */}
                <div className="relative shrink-0">
                    <div
                        aria-hidden="true"
                        className="absolute inset-[15%] animate-glow-pulse rounded-full bg-crimson/40 blur-3xl motion-reduce:animate-none"
                    />
                    <button
                        type="button"
                        onClick={handleLogoClick}
                        aria-label="CacoTalk"
                        className="relative block cursor-default select-none"
                    >
                        <img
                            src={cacotalkLogo}
                            alt=""
                            draggable={false}
                            className={cn(
                                "size-[clamp(5rem,20dvh,14rem)] object-contain transition-transform duration-300",
                                downpour && "scale-110",
                            )}
                        />
                    </button>
                </div>

                <p className="eyebrow mt-2 text-center">MESSENGER FROM DOWN BELOW</p>

                <p className="mt-2 max-w-lg text-center text-sm leading-relaxed text-muted">
                    A realtime messenger for the damned, by the damned.
                </p>

                <div className="mt-[clamp(1.25rem,4dvh,2.5rem)] flex w-full flex-col gap-[clamp(1rem,3dvh,1.75rem)] text-left">
                    <Section index={1} title="THE RESPONSIBLES">
                        <div className="flex flex-col gap-3">
                            <Credit
                                avatar={<Avatar name="jason7599" size="lg" tone="active" />}
                                name="jason7599"
                                role="ARCHITECT OF THE ABYSS"
                                items={[
                                    "database schema",
                                    "backend API + authentication",
                                    "realtime events over STOMP / WebSocket",
                                    "message ordering, read tracking + unread counts",
                                    "contacts, blocking + group membership rules",
                                    "frontend state, sync + reconnect logic",
                                ]}
                            />

                            <Credit
                                avatar={<Avatar icon={<Sparkles size={20} strokeWidth={2.2} />} size="lg" />}
                                name="Claude"
                                meta="BY ANTHROPIC"
                                role="PAINTER OF THE FLAMES"
                                items={[
                                    "design system + shared UI components",
                                    "mobile layout + responsive fixes",
                                    "reconnect banner + error screens",
                                    "this very page, all of it!!!",
                                ]}
                            />
                        </div>
                    </Section>

                    <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClassName("primary", "md", "w-full")}
                    >
                        <GitBranch size={17} strokeWidth={2.5} />
                        VISIT THE SOURCE
                        <ExternalLink size={14} strokeWidth={2.5} className="opacity-70" />
                    </a>
                </div>
            </main>
        </div>
    );
}

type CreditProps = {
    avatar: ReactNode;
    name: string;
    meta?: string;
    role: string;
    /** What this person was responsible for, one line each. */
    items: string[];
};

function Credit({ avatar, name, meta, role, items }: CreditProps) {
    return (
        <div className="flex h-full gap-3 border-2 border-edge-strong bg-panel/90 p-3 shadow-hard-lg sm:gap-4 sm:p-4">
            <div className="shrink-0">{avatar}</div>

            <div className="min-w-0">
                <p className="text-3xs font-bold tracking-caps text-crimson">{role}</p>

                <p className="mt-0.5 text-lg font-black tracking-tight">
                    {name}
                    {meta && <span className="ml-2 align-middle text-3xs font-bold tracking-label text-faint">{meta}</span>}
                </p>

                <ul className="mt-1.5 space-y-0.5 text-xs leading-snug text-muted">
                    {items.map((item) => (
                        <li key={item}>{`// ${item}`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}