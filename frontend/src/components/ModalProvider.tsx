import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Modal from "./Modal";

type ModalContextValue = {
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<ReactNode | null>(null);

    const openModal = useCallback((content: ReactNode) => {
        setContent(content);
    }, []);

    const closeModal = useCallback(() => {
        setContent(null);
    }, []);

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            {content && (
                <Modal>
                    {content}
                </Modal>
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used inside ModalProvider");
    return ctx;
}