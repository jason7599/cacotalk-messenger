package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    public void addContact(long userId, long targetId) {
        jdbc.update("""
                INSERT INTO contacts (user_id, contact_id)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
                """,
                userId,
                targetId
        );
    }

    public void removeContact(long userId, long targetId) {
        jdbc.update("""
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
                        WHERE user_id = ? AND blocked_id = ?
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

    public void addBlock(long userId, long targetId) {
        jdbc.update("""
            INSERT INTO blocks (user_id, blocked_id)
            VALUES (?, ?)
            ON CONFLICT DO NOTHING
            """,
                userId,
                targetId
        );
    }

    public void removeBlock(long userId, long targetId) {
        jdbc.update("""
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
}