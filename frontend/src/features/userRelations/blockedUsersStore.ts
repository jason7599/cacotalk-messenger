import { create } from "zustand";
import type { UserInfo } from "../../shared/types";
import { apiBlockUser, apiUnblockUser } from "./userRelationsApi";
import { useContactsStore } from "./contactsStore";

type BlockedUsersState = {
    blockedUsersById: Record<number, UserInfo>;
    pendingIds: Set<number>;

    // Local synchronization
    setBlockedUsers: (blockedUsers: UserInfo[]) => void;
    upsertLocal: (blockedUser: UserInfo) => void;
    removeLocal: (userId: number) => void;
    reset: () => void;

    // API actions
    blockUser: (userId: number) => Promise<void>;
    unblockUser: (userId: number) => Promise<void>;
};

export const useBlockedUsersStore = create<BlockedUsersState>((set, get) => ({
    blockedUsersById: {},
    pendingIds: new Set(),

    setBlockedUsers: (blockedUsers) => {
        set({
            blockedUsersById: Object.fromEntries(
                blockedUsers.map((b) => [b.userId, b])
            )
        });
    },

    upsertLocal: (blockedUser) => {
        set((state) => ({
            blockedUsersById: {
                ...state.blockedUsersById,
                [blockedUser.userId]: blockedUser
            }
        }));
    },

    removeLocal: (userId) => {
        set((state) => {
            const blockedUsersById = { ...state.blockedUsersById };
            delete blockedUsersById[userId];
            return { blockedUsersById };
        });
    },

    reset: () => {
        set({
            blockedUsersById: {},
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