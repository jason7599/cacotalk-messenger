import { create } from "zustand";
import type { UserResponse } from "../../shared/types";
import { apiBlockUser, apiUnblockUser } from "./userRelationsApi";
import { useContactsStore } from "./contactsStore";

type BlockedUsersState = {
    blockedUsers: UserResponse[];
    pendingIds: Set<number>;

    // Local synchronization
    setBlockedUsers: (blockedUsers: UserResponse[]) => void;
    upsertLocal: (blockedUser: UserResponse) => void;
    removeLocal: (userId: number) => void;
    reset: () => void;

    // API actions
    blockUser: (userId: number) => Promise<void>;
    unblockUser: (userId: number) => Promise<void>;
};

function sortBlockedUsers(blockedUsers: UserResponse[]) {
    return blockedUsers.sort((a, b) =>
        a.username.localeCompare(b.username)
    );
}

export const useBlockedUsersStore = create<BlockedUsersState>((set, get) => ({
    blockedUsers: [],
    pendingIds: new Set(),

    setBlockedUsers: (blockedUsers) => {
        set({
            blockedUsers: sortBlockedUsers([...blockedUsers])
        });
    },

    upsertLocal: (blockedUser) => {
        set((state) => ({
            blockedUsers: sortBlockedUsers([
                ...state.blockedUsers.filter(
                    (existing) => existing.userId !== blockedUser.userId
                ),
                blockedUser
            ])
        }));
    },

    removeLocal: (userId) => {
        set((state) => ({
            blockedUsers: state.blockedUsers.filter(
                (user) => user.userId !== userId
            )
        }));
    },

    reset: () => {
        set({
            blockedUsers: [],
            pendingIds: new Set()
        });
    },

    blockUser: async (userId) => {
        set((state) => {
            const pendingIds = new Set(state.pendingIds);
            pendingIds.add(userId);

            return { pendingIds };
        });

        try {
            const blockedUser = await apiBlockUser(userId);

            get().upsertLocal(blockedUser);

            useContactsStore.getState().removeLocal(userId);
        } finally {
            set((state) => {
                const pendingIds = new Set(state.pendingIds);
                pendingIds.delete(userId);

                return { pendingIds };
            });
        }
    },

    unblockUser: async (userId) => {
        set((state) => {
            const pendingIds = new Set(state.pendingIds);
            pendingIds.add(userId);

            return { pendingIds };
        });

        try {
            await apiUnblockUser(userId);
            get().removeLocal(userId);
        } finally {
            set((state) => {
                const pendingIds = new Set(state.pendingIds);
                pendingIds.delete(userId);

                return { pendingIds };
            });
        }
    }
}));