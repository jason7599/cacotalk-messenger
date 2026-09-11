import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BootstrapStatus = "loading" | "ready" | "error";

type BootstrapContextValue = {
    status: BootstrapStatus;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {

    const [status, setStatus] = useState<BootstrapStatus>("loading");

    // on MainPage render
    useEffect(() => {
        async function bootstrap() {
            try {
                


                setStatus("ready");
            } catch {
                setStatus("error");
            }
        }

        bootstrap();
    }, []);

    return (
        <BootstrapContext.Provider
            value={{
                status
            }}
        >
            {children}
        </BootstrapContext.Provider>
    )
};

export function useBootstrap() {
    const ctx = useContext(BootstrapContext);
    if (!ctx) throw new Error("useBootstrap must be used inside a BootstrapProvider");
    return ctx;
}