package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.user.dto.UserResponse;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Repository
@RequiredArgsConstructor
public class UserRelationRepository {

    private final JdbcTemplate jdbc;

    public List<UserResponse> getContacts(long userId) {
        return jdbc.query("""
                SELECT u.id, u.username
                FROM contacts c
                JOIN users u ON c.contact_id = u.id
                WHERE c.user_id = ?
                ORDER BY u.username
                """,
                (rs, rowNum) -> new UserResponse(
                        rs.getLong("id"),
                        rs.getString("username")
                ),
                userId
        );
    }

    // returns 1 on insert, 0 on silent conflict
    public int addContact(long userId, long targetId) {
        return jdbc.update("""
                INSERT INTO contacts (user_id, contact_id)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
                """,
                userId,
                targetId
        );
    }

    public int removeContact(long userId, long targetId) {
        return jdbc.update("""
                DELETE FROM contacts
                WHERE user_id = ? AND contact_id = ?
                """,
                userId,
                targetId
        );
    }

    public boolean isContact(long userId, long targetId) {
        return Boolean.TRUE.equals(
                jdbc.queryForObject("""
                    SELECT EXISTS (
                        SELECT 1
                        FROM contacts
                        WHERE user_id = ? AND contact_id = ?
                    )
                    """,
                        Boolean.class,
                        userId,
                        targetId
                )
        );
    }

    public List<UserResponse> getBlockedUsers(long userId) {
        return jdbc.query("""
            SELECT u.id, u.username
            FROM blocks b
            JOIN users u ON b.blocked_id = u.id
            WHERE b.user_id = ?
            ORDER BY u.username
            """,
                (rs, rowNum) -> new UserResponse(
                        rs.getLong("id"),
                        rs.getString("username")
                ),
                userId
        );
    }

    public int addBlock(long userId, long targetId) {
        return jdbc.update("""
            INSERT INTO blocks (user_id, blocked_id)
            VALUES (?, ?)
            ON CONFLICT DO NOTHING
            """,
                userId,
                targetId
        );
    }

    public int removeBlock(long userId, long targetId) {
        return jdbc.update("""
            DELETE FROM blocks
            WHERE user_id = ? AND blocked_id = ?
            """,
                userId,
                targetId
        );
    }

    public boolean hasBlocked(long blockerId, long blockedId) {
        return Boolean.TRUE.equals(
                jdbc.queryForObject("""
                    SELECT EXISTS (
                        SELECT 1
                        FROM blocks
                        WHERE user_id = ? AND blocked_id = ?
                    )
                    """,
                        Boolean.class,
                        blockerId,
                        blockedId
                )
        );
    }

    // If conversationId is non-null, users who are already members of this conversation are excluded
    // If null, conversation membership is not considered and should be used on group creation
    public List<UserResponse> getInvitableUsers(@Nullable UUID conversationId, long userId) {
        return jdbc.query("""
            SELECT
                u.id,
                u.username
            FROM contacts c
            JOIN users u
                ON c.contact_id = u.id
            LEFT JOIN blocks blocked_me
                ON c.contact_id = blocked_me.user_id
                AND blocked_me.blocked_id = ? -- userId
            WHERE c.user_id = ? -- userId
                AND blocked_me.user_id IS NULL
                AND (
                    CAST(? AS uuid) IS NULL
                    OR NOT EXISTS (
                        SELECT 1
                        FROM conversation_members cm
                        WHERE cm.conversation_id = ? AND cm.user_id = u.id
                    )
                )
            ORDER BY u.username
        """,
                (rs, rowNum) -> new UserResponse(
                        rs.getLong("id"),
                        rs.getString("username")
                ),
                userId, userId,
                conversationId, conversationId
        );
    }

    public boolean validateInvitable(@Nullable UUID conversationId, long userId, List<Long> targetIds) {
        String placeholders = targetIds.stream()
                .map(id -> "?")
                .collect(Collectors.joining(","));

        Long res = jdbc.queryForObject(
            """
                SELECT COUNT(*)
                FROM contacts c
                LEFT JOIN blocks blocked_me
                    ON blocked_me.user_id = c.contact_id
                    AND blocked_me.blocked_id = ?
                WHERE c.user_id = ?
                    AND c.contact_id IN (%s)
                    AND blocked_me.user_id IS NULL
                    AND (
                        CAST(? AS uuid) IS NULL
                        OR NOT EXISTS (
                        SELECT 1
                        FROM conversation_members cm
                        WHERE cm.conversation_id = ?
                            AND cm.user_id = c.contact_id
                        )
                    )
            """
                .formatted(placeholders),
            Long.class,
            Stream.concat(
                    Stream.of(userId, userId),
                    Stream.concat(
                            targetIds.stream(),
                            Stream.of(conversationId, conversationId)
                    )
            ).toArray()
        );

        return res != null && res == targetIds.size();
    }
}