package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.conversation.dto.ConversationSummaryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<ConversationEntity, UUID> {
    @Query(value = """
        SELECT
            c.id AS conversationId,
            c.type AS conversationType,
            members.preview AS membersPreview,
            members.cnt AS memberCount,
            CASE
                WHEN blocked_by_me IS NOT NULL THEN 'BLOCKED_BY_ME'
                WHEN blocked_me IS NOT NULL THEN 'BLOCKED_ME'
                ELSE 'NONE'
            END AS blockStatus,
            c.group_creator_id,
            c.is_closed,
            me.last_read_message_id,
            c.created_at AS conversationCreatedAt,
            lm.id AS lastMessageId,
            lm.sender_id AS lastMessageSenderId,
            lm.type AS lastMessageType,
            lm.event_type AS lastMessageEventType,
            lm.event_data AS lastMessageEventData,
            lm.content AS lastMessageContent,
            lm.created_at AS lastMessageCreatedAt

        FROM conversation_members me

        JOIN (
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
        ) c
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

        LEFT JOIN (
            SELECT DISTINCT ON (conversation_id)
                *
            FROM messages
            ORDER BY conversation_id, id DESC
        ) lm
            ON c.id = lm.conversation_id

        LEFT JOIN blocks blocked_by_me
            ON blocked_by_me.user_id = :userId
            AND blocked_by_me.blocked_id = c.other_user_id

        LEFT JOIN blocks blocked_me
            ON blocked_me.user_id = c.other_user_id
            AND blocked_me.blocked_id = :userId

        WHERE me.user_id = :userId
    """, nativeQuery = true)
    List<ConversationSummaryProjection> getConversationSummaries(long userId);


    @Query(value = """
        SELECT *
        FROM conversations
        WHERE type = 'DIRECT' -- technically redundant
              AND direct_user_id1 = LEAST(:userId1, :userId2)
              AND direct_user_id2 = GREATEST(:userId1, :userId2)
    """, nativeQuery = true)
    Optional<ConversationEntity> findDirectConversation(long userId1, long userId2);
}
