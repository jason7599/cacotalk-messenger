import React, { useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { apiLogin, apiRegister } from "../features/auth/authApi";
import cacotalkLogo from "../assets/cacotalk-logo.png";
import { useAuthStore } from "../features/auth/authStore";
import { getErrorMessage } from "../shared/apiError";
import { Button, ErrorText, cn } from "../components/ui";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from "../shared/constants";

export default function AuthPage() {
    const refreshUser = useAuthStore((s) => s.refreshUser);

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
                await apiLogin({ username, password });
            } else {
                await apiRegister({ username, password });
            }
            await refreshUser();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-sunken px-5 py-8 short:py-3">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center short:min-h-[calc(100vh-1.5rem)]">

                <header className="mb-8 text-center short:mb-4">
                    <img
                        src={cacotalkLogo}
                        alt="CACOTALK"
                        className={cn(
                            "mx-auto w-80 object-contain short:h-20 short:w-32",
                            // The register form is tall: there the logo shrinks with the
                            // window height (100dvh - 51rem) so everything fits, never
                            // smaller than 5rem or bigger than 15rem.
                            isLogin ? "h-60" : "h-[clamp(5rem,calc(100dvh-51rem),15rem)]",
                        )}
                    />
                    <p className="mt-3 text-xs tracking-[0.35em] text-muted short:mt-1">
                        MESSENGER FROM DOWN BELOW
                    </p>
                </header>

                <section className="w-full border-2 border-edge-strong bg-panel p-7 shadow-hard-xl shadow-void short:p-5">

                    <header className="mb-7 short:mb-4">
                        <p className="eyebrow mb-2">AUTHENTICATION RITUAL</p>

                        <h2 className="text-2xl font-black tracking-tight">
                            {isLogin ? "IDENTIFY YOURSELF" : "JOIN THE DAMNED"}
                        </h2>
                    </header>

                    <form 
                        ref={formRef}
                        onSubmit={handleSubmit} 
                        className="flex flex-col gap-5 short:gap-3"
                    >
                        <Field
                            label="USERNAME"
                            name="username"
                            autoComplete="username"
                            hint={!isLogin && (
                                <>
                                    {USERNAME_MIN_LENGTH}-{USERNAME_MAX_LENGTH} lowercase characters or digits.
                                    Must contain at least one letter.
                                </>
                            )}
                        />

                        <Field
                            label="PASSWORD"
                            name="password"
                            type="password"
                            hint={!isLogin && <>{PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters.</>}
                        />

                        {!isLogin &&
                            <>
                                <Field
                                    label="CONFIRM PASSWORD"
                                    name="confirmPassword"
                                    type="password"
                                />

                                {/* captcha (intentionally styled like a "real" light-mode widget) */}
                                <label className="flex cursor-pointer items-center justify-between border border-[#5f5f5f] bg-[#f5f5f5] px-3 py-2 text-black short:py-1">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="amHuman"
                                            className="h-6 w-6 accent-crimson-bright"
                                        />
                                        <span className="text-sm">
                                            I am a human
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center text-[0.55rem] leading-tight text-[#666]">
                                        <div className="mb-1 flex h-8 w-8 items-center justify-center border border-[#aaa] bg-white text-lg short:mb-0.5 short:h-6 short:w-6 short:text-sm">
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

                        {error && <ErrorText>{error}</ErrorText>}

                        <Button type="submit" loading={isLoading} disabled={isLoading} className="mt-1">
                            {isLoading
                                ? isLogin
                                    ? "DESCENDING..."
                                    : "SEALING THE PACT..."
                                : isLogin
                                    ? "DESCEND"
                                    : "JOIN THE DAMNED"
                            }
                        </Button>

                    </form>

                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            formRef.current?.reset();
                        }}
                        className="mt-6 w-full text-xs tracking-widest short:mt-3 text-muted transition-colors hover:text-crimson-bright"
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

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    /** Small helper text under the input. */
    hint?: ReactNode;
};

function Field({ label, hint, type = "text", ...inputProps }: FieldProps) {
    return (
        <label className="flex flex-col gap-2 short:gap-1">
            <span className="text-xs tracking-label text-muted">{label}</span>

            <input type={type} className="field w-full px-4 py-3 transition-colors short:py-2" {...inputProps} />

            {hint && <span className="text-xs text-faint">{hint}</span>}
        </label>
    );
}
