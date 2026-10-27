package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.message.dto.MessageResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    String MESSAGE_SELECT = """
        SELECT
            m.conversation_id,
            m.seq,
            m.sender_id,
            u.username AS senderName,
            m.type,
            m.event,
            m.content,
            m.reply_to_seq,
            rtu.username AS replyToSenderName,
            rtm.content AS replyToContent,
            m.created_at
        FROM messages m
        LEFT JOIN users u
            ON m.sender_id = u.id
        LEFT JOIN messages rtm
            ON m.reply_to_seq = rtm.seq AND m.conversation_id = rtm.conversation_id
        LEFT JOIN users rtu
            ON rtm.sender_id = rtu.id
    """;

    /**
     * Tries to load all messages after the read boundary plus previous context.
     * If the result exceeds initialLoadLimit, the older messages are dropped first,
     * meaning the newest message in the conversation is always included
     */
    @Query(value = """
        SELECT *
        FROM ("""
            + MESSAGE_SELECT + """
            WHERE m.conversation_id = :conversationId
                AND m.seq > :lastReadSeq - :contextSize
            ORDER BY m.seq DESC
            LIMIT :initialLoadLimit
        ) x
        ORDER BY x.seq ASC
    """, nativeQuery = true)
    List<MessageResponse.Projection> fetchInitialMessages(
            UUID conversationId,
            long lastReadSeq,
            int contextSize,
            int initialLoadLimit
    );

    @Query(value = """
        SELECT *
        FROM ("""
            + MESSAGE_SELECT + """
            WHERE m.conversation_id = :conversationId
                AND m.seq < :beforeSeq
            ORDER BY m.seq DESC
            LIMIT :pageSize
        ) x
        ORDER BY x.seq ASC
    """, nativeQuery = true)
    List<MessageResponse.Projection> fetchOlderMessages(UUID conversationId, long beforeSeq, int pageSize);

    @Query(value = MESSAGE_SELECT + """
        WHERE m.client_id = :clientId
    """, nativeQuery = true)
    Optional<MessageResponse.Projection> getProjectionByClientId(UUID clientId);

    @Query(value = MESSAGE_SELECT + """
        WHERE m.conversation_id = :conversationId
            AND m.seq = :seq
    """, nativeQuery = true)
    Optional<MessageResponse.Projection> getProjection(UUID conversationId, long seq);

    /**
     * Atomically increment conversations.last_seq and inserts the message.
     * Therefore, even if client_id collides on retry or schema validation happens for the message,
     * the incremented last_seq should be rolled back.
     * No explicit ON CONFLICT DO NOTHING, since the whole operation should be rolled back
     */
    @Query(value = """
        -- temporary cte
        WITH next_seq AS (
            UPDATE conversations
            SET last_seq = last_seq + 1
            WHERE id = :conversationId
            RETURNING last_seq
        )
        INSERT INTO messages (
            conversation_id,
            seq,
            sender_id,
            type,
            event,
            content,
            reply_to_seq,
            client_id
        )
        SELECT
            :conversationId,
            next_seq.last_seq,
            :senderId,
            :messageType,
            CAST(:eventData AS JSONB),
            :content,
            :replyToSeq,
            :clientId
        FROM next_seq
        RETURNING *
    """, nativeQuery = true)
    MessageEntity insertMessage(
            UUID conversationId,
            Long senderId,
            String messageType,
            String eventData,
            byte[] content,
            Long replyToSeq,
            UUID clientId
    );
}
