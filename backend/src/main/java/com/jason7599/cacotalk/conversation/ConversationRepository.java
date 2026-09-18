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
            lm.event_type AS lastMessageEventType,
            lm.event_data AS lastMessageEventData,
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
            CASE
                WHEN blocked_by_me IS NOT NULL THEN 'BLOCKED_BY_ME' -- takes precedence
                WHEN blocked_me IS NOT NULL THEN 'BLOCKED_ME'
                ELSE 'NONE'
            END AS blockStatus,
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
        LEFT JOIN blocks blocked_by_me
            ON blocked_by_me.user_id = :userId
            AND blocked_by_me.blocked_id = c.other_user_id
        LEFT JOIN blocks blocked_me
            ON blocked_me.user_id = c.other_user_id
            AND blocked_me.blocked_id = :userId
    """, nativeQuery = true)
    Optional<ConversationDetail.Projection> getConversationDetail(UUID conversationId, long userId);

    // idempotent
    @Query(value = """
        INSERT INTO conversations (id, type, direct_user_id1, direct_user_id2)
        VALUES (:conversationId, 'DIRECT', LEAST(:userId1, :userId2), GREATEST(:userId1, :userId2))
        ON CONFLICT (direct_user_id1, direct_user_id2) WHERE type = 'DIRECT'
        DO UPDATE SET id = conversations.id -- harmless no-op
        RETURNING id
    """, nativeQuery = true)
    UUID resolveDirectConversation(long userId1, long userId2, UUID conversationId);

    /*
    Wait. This looks fucking silly. It returns clientId anyway

    Keeping the design. Here's why for potential confused future me:
    clientId intentionally doubles as the row's real id. the primary key.
    and unlike resolveDirectConversation where the given conversationId, which is server generated anyway, might not be the actual
    existing conversation's id, here, the client generates it, and the DB either finds an existing one by the ID or generates it.
    So the returning id literally carries no new information.
    But I'd say it's just a small aesthetic itch naturally caused by having id double as the clientId.
    And since the FE needs the UUID for future API calls like ConversationDetails and such,
    it does fit in naturally with the existing flow.
     */
    @Query(value = """
        INSERT INTO conversations (id, type, group_creator_id)
        VALUES (:clientId, 'GROUP', :userId)
        ON CONFLICT (id)
        DO UPDATE SET id = conversations.id -- no-op
        WHERE conversations.group_creator_id = :userId -- explicitly fail on id collision only if the requester is not the original group creator, though still unlikely
        RETURNING id
    """, nativeQuery = true)
    UUID resolveGroupConversation(long userId, UUID clientId);

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
    void ensureMembers(UUID conversationId, long[] userIds);

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

    // On DIRECT: check no block status exists
    // On GROUP: check is_closed is false
    @Query(value = """
        SELECT EXISTS (
            SELECT 1
            FROM conversations c
            WHERE c.id = :conversationId
              AND NOT c.is_closed
              AND NOT (
                  c.type = 'DIRECT'
                  AND EXISTS (
                      SELECT 1
                      FROM blocks b
                      WHERE (b.user_id = :userId AND b.blocked_id = CASE WHEN c.direct_user_id1 = :userId THEN c.direct_user_id2 ELSE c.direct_user_id1 END)
                         OR (b.blocked_id = :userId AND b.user_id = CASE WHEN c.direct_user_id1 = :userId THEN c.direct_user_id2 ELSE c.direct_user_id1 END)
                  )
              )
        )
    """, nativeQuery = true)
    boolean canSendMessage(long userId, UUID conversationId);
}
