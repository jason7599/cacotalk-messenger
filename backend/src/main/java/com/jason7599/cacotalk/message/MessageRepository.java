package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.message.dto.MessageProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    String MESSAGE_SELECT = """
        SELECT
            m.conversation_id,
            m.seq,
            m.sender_id,
            u.username AS senderName,
            m.type,
            m.event_type,
            m.event_data,
            m.content,
            m.created_at
        FROM messages m
        LEFT JOIN users u
            ON m.sender_id = u.id
        WHERE m.conversation_id = :conversationId
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
                AND m.seq > :lastReadSeq - :contextSize
            ORDER BY m.seq DESC
            LIMIT :initialLoadLimit
        ) x
        ORDER BY x.seq ASC
    """, nativeQuery = true)
    List<MessageProjection> fetchInitialMessages(
            UUID conversationId,
            long lastReadSeq,
            int contextSize,
            int initialLoadLimit
    );

    @Query(value = """
        SELECT *
        FROM ("""
            + MESSAGE_SELECT + """
                AND m.seq < :beforeSeq
            ORDER BY m.seq DESC
            LIMIT :pageSize
        )
        ORDER BY m.seq ASC
    """, nativeQuery = true)
    List<MessageProjection> fetchOlderMessages(UUID conversationId, long beforeSeq, int pageSize);

    /**
     * Atomically increment conversations.last_seq and inserts the message.
     * Therefore, even if client_id collides on retry or schema validation happens for the message,
     * the incremented last_seq should be rolled back.
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
            event_type,
            event_data,
            content,
            client_id
        )
        SELECT
            :conversationId,
            next_seq.last_seq,
            :senderId,
            :messageType,
            :eventType,
            CAST(:eventData AS JSONB),
            :content,
            :clientId
        FROM next_seq
        RETURNING *
    """, nativeQuery = true)
    MessageEntity insertMessage(
            UUID conversationId,
            Long senderId,
            String messageType,
            String eventType,
            String eventData,
            String content,
            UUID clientId
    );
}
