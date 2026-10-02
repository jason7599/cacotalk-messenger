import { RotateCw, Skull } from "lucide-react";
import cacotalkLogo from "../assets/cacotalk-logo.webp";
import Button from "./ui/Button";

type ErrorScreenProps = {
    eyebrow?: string;
    title: string;
    /** Optional technical detail, e.g. the error message from the failed request. */
    message?: string;
    /** What the retry button does. Defaults to reloading the whole page. */
    onRetry?: () => void;
};

/**
 * Full-page "the backend is gone" screen. Same layout as LoadingScreen,
 * but dead: everything drained to grey, flatlined status bar, pulsing skull.
 * The retry button is the only thing left in color, the one way back.
 */
export default function ErrorScreen({
    eyebrow = "SYSTEM FAILURE // LINK SEVERED",
    title,
    message,
    onRetry = () => window.location.reload(),
}: ErrorScreenProps) {
    return (
        <main className="min-h-screen bg-sunken px-5 py-8 short:py-3">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center short:min-h-[calc(100vh-1.5rem)]">

                {/* Everything in here is drained of color. A CSS filter can't be undone
                    by a child, so the button has to live outside this wrapper. */}
                <div className="flex w-full flex-col items-center grayscale">
                    <img
                        src={cacotalkLogo}
                        alt=""
                        className="mb-8 h-52 w-80 object-contain short:mb-4 short:h-32 short:w-48"
                    />

                    <section className="w-full border-2 border-crimson bg-panel p-7 shadow-hard-xl shadow-void short:p-5">
                        <header className="mb-6 flex items-start gap-4 border-b-2 border-edge pb-5">
                            <div className="grid h-12 w-12 shrink-0 animate-pulse place-items-center border-2 border-crimson-bright bg-sunken text-crimson-bright shadow-hard-md">
                                <Skull size={24} strokeWidth={2.2} />
                            </div>

                            <div className="min-w-0">
                                <p className="eyebrow mb-2">{eyebrow}</p>
                                <h2 className="text-2xl font-black tracking-tight">{title}</h2>
                            </div>
                        </header>

                        <div className="mb-6">
                            <div className="mb-2 flex items-center justify-between text-2xs tracking-caps">
                                <span className="text-faint">SYSTEM STATUS</span>
                                <span className="font-bold text-crimson-bright">OFFLINE</span>
                            </div>

                            {/* flatline */}
                            <div className="relative h-3 border-2 border-edge bg-pit">
                                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-crimson" />
                            </div>
                        </div>

                        <div className="border-l-2 border-crimson bg-sunken px-4 py-3">
                            <p className="mb-2 text-2xs font-bold tracking-caps text-crimson">DIAGNOSIS</p>

                            <ul className="space-y-1.5 text-xs leading-relaxed text-muted">
                                <li>// The underworld is not answering.</li>
                                <li>// The server may be down, or your connection was lost.</li>
                                <li>// Your transmissions are stored safely below.</li>
                                {message && <li className="wrap-break-word text-faint">// {message}</li>}
                            </ul>
                        </div>
                    </section>
                </div>

                <Button
                    onClick={onRetry}
                    icon={<RotateCw size={17} strokeWidth={2.5} />}
                    className="mt-6 w-full short:mt-4"
                >
                    RESUMMON
                </Button>

                <p className="mt-5 text-3xs tracking-loud text-faint grayscale">ERR // NO SIGNAL FROM BELOW</p>
            </div>
        </main>
    );
}