import cacotalkLogo from "../assets/cacotalk-logo.png";

type LoadingScreenProps = {
    eyebrow?: string;
    title: string;
    message?: string;
};

export default function LoadingScreen({ eyebrow, title, message }: LoadingScreenProps) {
    return (
        <main className="min-h-screen bg-sunken px-5 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center">
                <img src={cacotalkLogo} alt="" className="mb-8 h-52 w-80 object-contain short:mb-4 short:h-32 short:w-48" />

                <section className="relative w-full border-2 border-edge-strong bg-panel p-7 shadow-hard-xl shadow-void">
                    <header className="mb-7 border-b-2 border-edge pb-5">
                        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}

                        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
                    </header>

                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between text-2xs tracking-caps">
                            <span className="text-faint">SYSTEM STATUS</span>
                            <span className="animate-pulse text-crimson-bright">ACTIVE</span>
                        </div>

                        <div className="h-3 overflow-hidden border-2 border-edge bg-pit">
                            <div className="h-full w-1/4 animate-hellbar bg-crimson-bright" />
                        </div>
                    </div>

                    {message && (
                        <p className="border-l-2 border-crimson pl-3 text-xs leading-relaxed text-muted">
                            {message}
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}
