import React, { useRef, useState } from "react";
import { login, register } from "../features/auth/authApi";
import { AxiosError } from "axios";
import { useAuth } from "../features/auth/AuthProvider";

// TODO: CHANGE ON PROD PLEASE DONT FORGET
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 32;
const PASSWORD_MIN_LENGTH = 4;
const PASSWORD_MAX_LENGTH = 32;

const USERNAME_PATTERN = /^(?=.*[a-z])[a-z0-9]+$/; // separated length to dedupe further

export default function AuthPage() {
    const { refreshUser } = useAuth();

    const [isLogin, setIsLogin] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
        if (isLoading) {
            return;
        }

        evt.preventDefault();

        const formData = new FormData(evt.currentTarget);

        const username = formData.get("username")?.toString().trim();
        const password = formData.get("password")?.toString(); // whitespace allowed in pw
        const confirmPassword = formData.get("confirmPassword")?.toString();
        const amHuman = formData.get("amHuman") == "on";

        if (!username || !password) {
            setError("FIELDS CANNOT BE EMPTY.");
            return;
        }

        if (!(USERNAME_MIN_LENGTH <= username.length && username.length <= USERNAME_MAX_LENGTH) || !USERNAME_PATTERN.test(username)) {
            setError("INVALID USERNAME FORMAT.");
            return;
        }

        if (!(PASSWORD_MIN_LENGTH <= password.length && password.length <= PASSWORD_MAX_LENGTH)) {
            setError("INVALID PASSWORD FORMAT.");
            return;
        }

        if (!isLogin) {
            if (password != confirmPassword) {
                setError("PASSWORDS DO NOT MATCH.");
                return;
            }

            if (amHuman) {
                setError("NO HUMANS ALLOWED");
                return;
            }
        }

        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login({ username, password });
            } else {
                await register({ username, password });
            }
            await refreshUser();
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data ?? "SOMETHING WENT WRONG.");
                return;
            }
            setError("SOMETHING WENT WRONG.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#100708] px-5 py-8 text-[#eee2d5]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center">

                <header className="mb-8 text-center">
                    <h1 className="text-6xl font-black tracking-[-0.06em] text-[#e02632] drop-shadow-[4px_4px_0_#48090e] sm:text-7xl">
                        CACOTALK
                    </h1>

                    <p className="mt-3 text-xs tracking-[0.35em] text-[#9f8581]">
                        MESSENGER FROM DOWN BELOW
                    </p>
                </header>

                <section className="w-full border-2 border-[#64141b] bg-[#190b0d] p-7">

                    <header className="mb-7">
                        <p className="mb-2 text-xs tracking-[0.2em] text-[#a71924]">
                            AUTHENTICATION RITUAL
                        </p>

                        <h2 className="text-2xl font-bold">
                            {isLogin ? "IDENTIFY YOURSELF" : "JOIN THE DAMNED"}
                        </h2>
                    </header>

                    <form 
                        ref={formRef}
                        onSubmit={handleSubmit} 
                        className="flex flex-col gap-5"
                    >
                        <label className="flex flex-col gap-2">
                            <span className="text-xs tracking-[0.12em] text-[#9f8581]">
                                USERNAME
                            </span>

                            <input
                                type="text"
                                name="username"
                                autoComplete="username"
                                className="w-full border-2 border-[#4b1b1f] bg-[#0c0506] px-4 py-3 text-[#eee2d5] outline-none transition focus:border-[#e02632]"
                            />

                            {!isLogin && (
                                <span className="text-xs text-[#7f6668]">
                                    {USERNAME_MIN_LENGTH}-{USERNAME_MAX_LENGTH} lowercase characters or digits.
                                    Must contain at least one letter.
                                </span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-xs tracking-[0.12em] text-[#9f8581]">
                                PASSWORD
                            </span>

                            <input
                                type="password"
                                name="password"
                                className="w-full border-2 border-[#4b1b1f] bg-[#0c0506] px-4 py-3 text-[#eee2d5] outline-none transition focus:border-[#e02632]"
                            />

                            {/* TODO:  */}
                            {!isLogin && (
                                <span className="text-xs text-[#7f6668]">
                                    {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters.
                                </span>
                            )}
                        </label>

                        {!isLogin &&
                            <>
                                <label className="flex flex-col gap-2">
                                    <span className="text-xs tracking-[0.12em] text-[#9f8581]">
                                        CONFIRM PASSWORD
                                    </span>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="w-full border-2 border-[#4b1b1f] bg-[#0c0506] px-4 py-3 text-[#eee2d5] outline-none transition focus:border-[#e02632]"
                                    />
                                </label>

                                {/* captcha */}
                                <label className="flex cursor-pointer items-center justify-between border border-[#5f5f5f] bg-[#f5f5f5] px-3 py-2 text-black">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="amHuman"
                                            className="h-6 w-6 accent-[#e02632]"
                                        />
                                        <span className="text-sm">
                                            I am a human
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center text-[0.55rem] leading-tight text-[#666]">
                                        <div className="mb-1 flex h-8 w-8 items-center justify-center border border-[#aaa] bg-white text-lg">
                                            🔥
                                        </div>
                                        <span>CACOTCHA</span>
                                        <span className="text-[0.45rem]">
                                            Privacy · Terms
                                        </span>
                                    </div>
                                </label>
                            </>
                        }

                        {error && (
                            <p className="text-sm pl-3 border-l-2 border-[#ff4b55] text-[#ff7b73]">
                                {error}
                            </p>
                        )}

                        {/* submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-1 flex items-center justify-center gap-2 border-2 border-[#e02632] bg-[#a71924] px-5 py-3 font-bold tracking-[0.15em] text-[#eee2d5] shadow-[4px_4px_0_#520a10] transition hover:bg-[#e02632] active:translate-x-0.75 active:translate-y-0.75 active:shadow-[1px_1px_0_#520a10] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#eee2d5] border-t-transparent" />
                            )}

                            {isLoading
                                ? isLogin
                                    ? "DESCENDING..."
                                    : "SEALING THE PACT..."
                                : isLogin
                                    ? "DESCEND"
                                    : "JOIN THE DAMNED"
                            }
                        </button>

                    </form>

                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            formRef.current?.reset();
                        }}
                        className="mt-6 w-full text-xs tracking-[0.08em] text-[#9f8581] transition hover:text-[#e02632]"
                    >
                        {isLogin
                            ? "NEW BLOOD? CREATE AN ACCOUNT"
                            : "ALREADY DAMNED? LOG IN"
                        }
                    </button>
                </section>
            </div>
        </main>
    );
}
