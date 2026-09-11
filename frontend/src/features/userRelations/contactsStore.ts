import { create } from "zustand";
import type { UserResponse } from "../../shared/types";
import { apiAddContact, apiRemoveContact } from "./userRelationsApi";

type ContactsState = {
    contacts: Record<number, UserResponse>;
    addingIds: Set<number>;

    // Local synchronization
    setContacts: (contacts: UserResponse[]) => void;
    upsertLocal: (contact: UserResponse) => void;
    removeLocal: (contactId: number) => void;
    reset: () => void;

    // API actions
    addContact: (contactId: number) => Promise<void>;
    removeContact: (contactId: number) => Promise<void>;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    contacts: {},
    addingIds: new Set(),

    setContacts: (contacts) => {
        set({
            contacts: Object.fromEntries(
                contacts.map((contact) => [contact.userId, contact])
            )
        });
    },

    upsertLocal: (contact) => {
        set((state) => ({
            contacts: {
                ...state.contacts,
                [contact.userId]: contact
            }
        }));
    },

    removeLocal: (contactId) => {
        set((state) => {
            const contacts = { ...state.contacts };
            delete contacts[contactId];
            return { contacts };
        });
    },

    reset: () => {
        set({
            contacts: {},
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