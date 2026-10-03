import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Modal from "./Modal";

type ModalOptions = {
    /** Render the content as-is, without the modal box (for full-screen pages like AboutScreen). */
    bare?: boolean;
};

type ModalContextValue = {
    openModal: (content: ReactNode, options?: ModalOptions) => void;
    closeModal: () => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState<ReactNode | null>(null);
    const [bare, setBare] = useState(false);

    const openModal = useCallback((content: ReactNode, options?: ModalOptions) => {
        setContent(content);
        setBare(options?.bare ?? false);
    }, []);

    const closeModal = useCallback(() => {
        setContent(null);
        setBare(false);
    }, []);

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            {content && (bare ? content : (
                <Modal>
                    {content}
                </Modal>
            ))}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used inside ModalProvider");
    return ctx;
}