import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserInfo } from "../../shared/types";
import { getErrorMessage } from "../../shared/apiError";

/**
 * Loads a list of users that can be picked, and tracks which ones are selected.
 * Used by CreateGroupModal and InviteMembersModal (together with <MemberPicker />).
 *
 * `fetchUsers` must be stable: a module-level function, or wrapped in useCallback.
 * Otherwise the list reloads on every render.
 */
export function useMemberSelection(fetchUsers: () => Promise<UserInfo[]>, maxSelectable: number) {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    /** Puts a freshly fetched list in place, dropping selections that are no longer in it. */
    const applyUsers = useCallback((nextUsers: UserInfo[]) => {
        setUsers(nextUsers);

        const validIds = new Set(nextUsers.map((user) => user.userId));
        setSelected((current) => new Set([...current].filter((id) => validIds.has(id))));
    }, []);

    /** Re-fetches the list. Throws on failure, so callers can decide what to do with the error. */
    const reload = useCallback(async () => {
        applyUsers(await fetchUsers());
    }, [fetchUsers, applyUsers]);

    // Initial load. `cancelled` ignores a late response if the modal closed in the meantime.
    useEffect(() => {
        let cancelled = false;

        fetchUsers()
            .then((nextUsers) => {
                if (!cancelled) applyUsers(nextUsers);
            })
            .catch((err) => {
                if (!cancelled) setLoadError(getErrorMessage(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [fetchUsers, applyUsers]);

    const toggle = useCallback((userId: number) => {
        setSelected((current) => {
            const next = new Set(current);

            if (next.has(userId)) {
                next.delete(userId);
            } else if (next.size < maxSelectable) {
                next.add(userId);
            }

            return next;
        });
    }, [maxSelectable]);

    const selectedUsers = useMemo(() => {
        return users.filter((user) => selected.has(user.userId));
    }, [users, selected]);

    return { users, selected, selectedUsers, loading, loadError, toggle, reload };
}

export type MemberSelection = ReturnType<typeof useMemberSelection>;
