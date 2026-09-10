import cacotalkLogo from "../assets/cacotalk-logo.png";

type LoadingScreenProps = {
    eyebrow?: string;
    title: string;
    message?: string;
};

export default function LoadingScreen({ eyebrow, title, message }: LoadingScreenProps) {
    return (
        <main className="min-h-screen bg-[#100708] px-5 py-8 text-[#eee2d5]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center">

                <img
                    src={cacotalkLogo}
                    alt=""
                    className="mb-8 h-52 w-80 object-contain"
                />

                <section
                    className="
                        relative w-full
                        border-2 border-[#64141b]
                        bg-[#190b0d]
                        p-7
                        shadow-[7px_7px_0_#070304]
                    "
                >
                    <header className="mb-7 border-b-2 border-[#4b1b1f] pb-5">
                        {eyebrow && (
                            <p className="mb-2 text-xs tracking-[0.22em] text-[#a71924]">
                                {eyebrow}
                            </p>
                        )}

                        <h2 className="text-2xl font-black tracking-[-0.02em]">
                            {title}
                        </h2>
                    </header>

                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] tracking-[0.18em] text-[#7f6668]">
                                SYSTEM STATUS
                            </span>

                            <span className="animate-pulse text-[10px] tracking-[0.18em] text-[#e02632]">
                                ACTIVE
                            </span>
                        </div>

                        <div className="h-3 overflow-hidden border-2 border-[#4b1b1f] bg-[#0c0506]">
                            <div className="h-full w-1/4 animate-[hellbar_1.15s_linear_infinite] bg-[#e02632]" />
                        </div>
                    </div>


                    {message && (
                        <p className="border-l-2 border-[#a71924] pl-3 text-xs leading-relaxed text-[#9f8581]">
                            {message}
                        </p>
                    )}
                </section>
            </div>

            <style>{`
                @keyframes hellbar {
                    from {
                        transform: translateX(-120%);
                    }

                    to {
                        transform: translateX(420%);
                    }
                }
            `}</style>
        </main>
    );
}