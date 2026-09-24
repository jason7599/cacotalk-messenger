package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.conversation.dto.ConversationDetail;
import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import com.jason7599.cacotalk.user.dto.UserResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<ConversationEntity, UUID> {
    String CONVERSATION_SUMMARY_QUERY = """
        SELECT
            c.id AS conversationId,
            c.type AS conversationType,

            members.preview AS membersPreview,
            members.cnt AS memberCount,

            c.group_creator_id,

            c.last_seq,
            me.last_read_seq,

            c.created_at AS conversationCreatedAt,

            lm.sender_id AS lastMessageSenderId,
            lms.username AS lastMessageSenderName,

            lm.type AS lastMessageType,
            lm.event AS lastMessageEvent,
            lm.content AS lastMessageContent,
            lm.created_at AS lastMessageCreatedAt

        FROM conversation_members me
        JOIN conversations c
            ON me.conversation_id = c.id
    
        LEFT JOIN (
            SELECT
                conversation_id,
                ARRAY_AGG(username ORDER BY username) FILTER (WHERE rnk <= 3) AS preview,
                COUNT(*) AS cnt
            FROM (
                SELECT
                    cm.conversation_id,
                    u.username,
                    ROW_NUMBER() OVER (
                        PARTITION BY cm.conversation_id
                        ORDER BY u.username
                    ) AS rnk
                FROM conversation_members cm
                LEFT JOIN users u
                    ON cm.user_id = u.id
                WHERE u.id <> :userId
            ) members
            GROUP BY conversation_id
        ) members
            ON c.id = members.conversation_id

        LEFT JOIN messages lm
            ON c.id = lm.conversation_id
            AND c.last_seq = lm.seq

        LEFT JOIN users lms
            ON lm.sender_id = lms.id

        WHERE me.user_id = :userId
    """;

    @Query(value = CONVERSATION_SUMMARY_QUERY + """
        AND c.last_seq > 0 -- ignore empty conversations in bootstrap fetch
    """, nativeQuery = true)
    List<ConversationSummary.Projection> getConversationSummaries(long userId);

    @Query(value = CONVERSATION_SUMMARY_QUERY + """
        AND c.id = :conversationId
    """, nativeQuery = true)
    Optional<ConversationSummary.Projection> getConversationSummary(UUID conversationId, long userId);

    @Query(value = """
        SELECT
            c.id,
            c.type,
            blocked_me IS NOT NULL AS blockedMe,
            c.group_creator_id,
            c.is_closed,
            c.last_seq,
            c.created_at
        FROM (
            SELECT
                c.*,
                CASE
                    WHEN c.type = 'DIRECT' AND c.direct_user_id1 = :userId
                        THEN c.direct_user_id2
                    WHEN c.type = 'DIRECT' AND c.direct_user_id2 = :userId
                        THEN c.direct_user_id1
                    ELSE NULL
                END AS other_user_id
            FROM conversations c
            WHERE c.id = :conversationId
        ) c
        LEFT JOIN blocks blocked_me
            ON blocked_me.user_id = c.other_user_id
            AND blocked_me.blocked_id = :userId
    """, nativeQuery = true)
    Optional<ConversationDetail.Projection> getConversationDetail(UUID conversationId, long userId);

    // idempotent
    // Note we check conflict on the direct user pair, not the clientId/conversationId.
    @Query(value = """
        INSERT INTO conversations (id, type, direct_user_id1, direct_user_id2)
        VALUES (:clientId, 'DIRECT', LEAST(:userId1, :userId2), GREATEST(:userId1, :userId2))
        ON CONFLICT (direct_user_id1, direct_user_id2) WHERE type = 'DIRECT'
        DO UPDATE SET id = conversations.id -- harmless no-op
        RETURNING id
    """, nativeQuery = true)
    UUID resolveDirectConversation(long userId1, long userId2, UUID clientId);

    /*
    Here we distinguish whether the row already existed or not.
    If already existed, return Optional.empty().
     */
    @Query(value = """
        INSERT INTO conversations (id, type, group_creator_id)
        VALUES (:clientId, 'GROUP', :userId)
        ON CONFLICT (id)
        DO NOTHING
        RETURNING id
    """, nativeQuery = true)
    Optional<UUID> insertGroupConversation(long userId, UUID clientId);

    // idempotent
    @Modifying
    @Query(value = """
        INSERT INTO conversation_members (conversation_id, user_id, last_read_seq)
        SELECT
            :conversationId,
            u.user_id,
            c.last_seq
        FROM conversations c
        CROSS JOIN UNNEST(:userIds) u(user_id)
        WHERE c.id = :conversationId
        ON CONFLICT (conversation_id, user_id) DO NOTHING
    """, nativeQuery = true)
    void insertMembers(UUID conversationId, long[] userIds);

    @Query(value = """
        SELECT last_read_seq
        FROM conversation_members
        WHERE conversation_id = :conversationId AND user_id = :userId
    """, nativeQuery = true)
    Optional<ConversationMembership> getMembership(UUID conversationId, long userId);

    @Query(value = """
        SELECT
            u.id AS userId,
            u.username
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = :conversationId
        ORDER BY u.username
    """, nativeQuery = true)
    List<UserResponse> getAllMembers(UUID conversationId);

    @Query(value = """
        SELECT user_id
        FROM conversation_members
        WHERE conversation_id = :conversationId
    """, nativeQuery = true)
    List<Long> getAllMemberIds(UUID conversationId);

    @Query(value = """
        SELECT
            u.id AS userId,
            u.username
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = :conversationId
            AND cm.user_id <> :userId
        ORDER BY u.username
    """, nativeQuery = true)
    List<UserResponse> getAllMembersExcept(UUID conversationId, long userId);

    @Modifying
    @Query(value = """
        UPDATE conversation_members
        SET last_read_seq = GREATEST(last_read_seq, :seq) -- idempotent
        WHERE conversation_id = :conversationId AND user_id = :userId
    """, nativeQuery = true)
    void updateLastReadSeq(UUID conversationId, long userId, long seq);

    // Membership check is included
    // On DIRECT: check no block status exists
    // On GROUP: check is_closed is false
    @Query(value = """
        SELECT EXISTS (
            SELECT 1
            FROM conversations c
            WHERE c.id = :conversationId
                AND NOT c.is_closed
                AND (
                    (
                        c.type = 'DIRECT'
                        AND :userId IN (c.direct_user_id1, c.direct_user_id2)
                    )
                    OR
                    (
                        c.type = 'GROUP'
                        AND EXISTS (
                            SELECT 1
                            FROM conversation_members cm
                            WHERE cm.conversation_id = c.id
                                AND cm.user_id = :userId
                        )
                    )
                )
                AND (
                    c.type <> 'DIRECT'
                    OR NOT EXISTS (
                        SELECT 1
                        FROM blocks b
                        WHERE (b.user_id = c.direct_user_id1 AND b.blocked_id = c.direct_user_id2)
                            OR (b.user_id = c.direct_user_id2 AND b.blocked_id = c.direct_user_id1)
                  )
              )
        )
    """, nativeQuery = true)
    boolean canSendMessage(UUID conversationId, long userId);

    @Modifying
    @Query(value = """
        DELETE FROM conversation_members
        WHERE conversation_id = :conversationId AND user_id = :userId
    """, nativeQuery = true)
    int removeMember(UUID conversationId, long userId);

    @Query(value = """
        SELECT group_creator_id
        FROM conversations
        WHERE id = :conversationId
            AND type = 'GROUP' -- this makes the result Optional.empty() in case the given conversationId exists but is not a group convo
    """, nativeQuery = true)
    Optional<Long> getGroupCreatorId(UUID conversationId);

    // See docs/010-concurrency-control.md
    // Since this is hashed, there is possibility that unrelated requests end up colliding
    // But it's gonna be trivial.
    @Query(value = """
        SELECT pg_advisory_xact_lock(hashtextextended(CAST(:conversationId AS TEXT), 0))
    """, nativeQuery = true)
    void lockGroupInvite(UUID conversationId);

    @Query(value = """
        SELECT COUNT(*)
        FROM conversation_members
        WHERE conversation_id = :conversationId
    """, nativeQuery = true)
    long countMembers(UUID conversationId);

    @Modifying
    @Query(value = """
        UPDATE conversations
        SET is_closed = TRUE
        WHERE id = :conversationId
            AND is_closed = FALSE
    """, nativeQuery = true)
    int closeConversation(UUID conversationId);
}
