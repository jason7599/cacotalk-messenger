import { create } from "zustand";
import type { UserInfo } from "../../shared/types";
import { apiAddContact, apiRemoveContact } from "./userRelationsApi";

type ContactsState = {
    contacts: UserInfo[];
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

function sortContacts(contacts: UserInfo[]) {
    return contacts.sort((a, b) =>
        a.username.localeCompare(b.username)
    );
}

export const useContactsStore = create<ContactsState>((set, get) => ({
    contacts: [],
    addingIds: new Set(),

    setContacts: (contacts) => {
        set({
            contacts: sortContacts([...contacts])
        });
    },

    upsertLocal: (contact) => {
        set((state) => ({
            contacts: sortContacts([
                ...state.contacts.filter(
                    (existing) => existing.userId !== contact.userId
                ),
                contact
            ])
        }));
    },

    removeLocal: (contactId) => {
        set((state) => ({
            contacts: state.contacts.filter(
                (contact) => contact.userId !== contactId
            )
        }));
    },

    reset: () => {
        set({
            contacts: [],
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