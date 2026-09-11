import { create } from "zustand";
import type { UserResponse } from "../../shared/types";
import { apiBlockUser, apiUnblockUser } from "./userRelationsApi";
import { useContactsStore } from "./contactsStore";

type BlockedUsersState = {
    blockedUsers: Record<number, UserResponse>;
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

export const useBlockedUsersStore = create<BlockedUsersState>((set, get) => ({
    blockedUsers: {},
    pendingIds: new Set(),

    setBlockedUsers: (blockedUsers) => {
        set({
            blockedUsers: Object.fromEntries(
                blockedUsers.map((user) => [user.userId, user])
            )
        });
    },

    upsertLocal: (blockedUser) => {
        set((state) => ({
            blockedUsers: {
                ...state.blockedUsers,
                [blockedUser.userId]: blockedUser
            }
        }));
    },

    removeLocal: (userId) => {
        set((state) => {
            const blockedUsers = { ...state.blockedUsers };
            delete blockedUsers[userId];
            return { blockedUsers };
        });
    },

    reset: () => {
        set({
            blockedUsers: {},
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

            useContactsStore.getState().removeLocal(userId); // remove from contacts list
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