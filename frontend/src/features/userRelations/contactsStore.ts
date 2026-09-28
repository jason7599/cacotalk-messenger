import { create } from "zustand";
import type { UserInfo } from "../../shared/types";
import { apiAddContact, apiRemoveContact } from "./userRelationsApi";

type ContactsState = {
    contactsById: Record<number, UserInfo>;
    addingIds: Set<number>;

    // Local synchronization
    setContacts: (contacts: UserInfo[]) => void;
    upsertLocal: (contact: UserInfo) => void;
    removeLocal: (contactId: number) => void;
    reset: () => void;

    // API actions
    addContact: (contactId: number) => Promise<void>;
    removeContact: (contactId: number) => Promise<void>;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    contactsById: {},
    addingIds: new Set(),

    setContacts: (contacts) => {
        set({
            contactsById: Object.fromEntries(
                contacts.map((c) => [c.userId, c])
            )
        });
    },

    upsertLocal: (contact) => {
        set((state) => ({
            contactsById: {
                ...state.contactsById,
                [contact.userId]: contact
            }
        }));
    },

    removeLocal: (contactId) => {
        set((state) => {
            const contactsById = { ...state.contactsById };
            delete contactsById[contactId];
            return { contactsById };
        });
    },

    reset: () => {
        set({
            contactsById: {},
            addingIds: new Set()
        });
    },

    // Throws error, handle it in the caller
    addContact: async (contactId) => {
        set((state) => {
            const addingIds = new Set(state.addingIds);
            addingIds.add(contactId);

            return { addingIds };
        });

        try {
            const contact = await apiAddContact(contactId);
            get().upsertLocal(contact);
        } finally {
            set((state) => {
                const addingIds = new Set(state.addingIds);
                addingIds.delete(contactId);

                return { addingIds };
            });
        }
    },

    removeContact: async (contactId) => {
        await apiRemoveContact(contactId);
        get().removeLocal(contactId);
    }
}));