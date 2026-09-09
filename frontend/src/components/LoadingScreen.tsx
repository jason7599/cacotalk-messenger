type LoadingScreenProps = {
    eyebrow?: string;
    title: string;
    message?: string;
};

export default function LoadingScreen({ eyebrow, title, message }: LoadingScreenProps) {
    return (
        <main className="min-h-screen bg-[#100708] px-5 py-8 text-[#eee2d5]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center">

                <header className="mb-10 text-center">
                    <h1 className="text-6xl font-black tracking-[-0.06em] text-[#e02632] drop-shadow-[4px_4px_0_#48090e] sm:text-7xl">
                        CACOTALK
                    </h1>

                    <p className="mt-3 text-xs tracking-[0.35em] text-[#9f8581]">
                        MESSENGER FROM DOWN BELOW
                    </p>
                </header>

                <section className="w-full border-2 border-[#64141b] bg-[#190b0d] p-7 text-center shadow-[7px_7px_0_#070304]">

                    <p className="mb-3 text-xs tracking-[0.2em] text-[#a71924]">
                        {eyebrow}
                    </p>

                    <h2 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h2>

                    <div className="my-9 flex justify-center">
                        <div className="relative flex h-24 w-24 items-center justify-center">
                            <div className="absolute inset-0 animate-[spin_3s_linear_infinite] border-2 border-[#64141b]" />

                            <div className="absolute inset-3 animate-[spin_2s_linear_infinite_reverse] border-2 border-[#a71924]" />

                            <div className="flex h-10 w-10 items-center justify-center border-2 border-[#e02632] bg-[#100708] shadow-[3px_3px_0_#520a10]">
                                <span className="animate-pulse text-xl text-[#e02632]">
                                    ◆
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-5 h-2 w-full overflow-hidden border border-[#4b1b1f] bg-[#0c0506]">
                        <div className="h-full w-1/3 animate-[hellbar_1.25s_ease-in-out_infinite] bg-[#e02632]" />
                    </div>

                    <p className="mt-5 text-xs leading-relaxed text-[#7f6668]">
                        {message}
                    </p>

                </section>
            </div>

            <style>{`
                @keyframes hellbar {
                    0% {
                        transform: translateX(-110%);
                    }

                    50% {
                        transform: translateX(100%);
                    }

                    100% {
                        transform: translateX(310%);
                    }
                }
            `}</style>
        </main>
    );
}