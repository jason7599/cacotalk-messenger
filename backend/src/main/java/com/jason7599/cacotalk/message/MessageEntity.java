package com.jason7599.cacotalk.message;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private UUID conversationId;
    private Long senderId;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Enumerated(EnumType.STRING)
    private EventMessageType eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode eventData;

    private String content;

    @Column(insertable = false)
    private Instant createdAt;

    private UUID clientId;

    private MessageEntity(
            UUID conversationId,
            Long senderId,
            MessageType type,
            EventMessageType eventType,
            JsonNode eventData,
            String content,
            UUID clientId
    ) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.type = type;
        this.eventType = eventType;
        this.eventData = eventData;
        this.content = content;
        this.clientId = clientId;
    }

    public static MessageEntity user(
            UUID conversationId,
            long senderId,
            String content,
            UUID clientId
    ) {
        return new MessageEntity(
                conversationId,
                senderId,
                MessageType.USER,
                null,
                null,
                content,
                clientId
        );
    }

    public static MessageEntity event(
            UUID conversationId,
            EventMessageType eventType,
            JsonNode eventData
    ) {
        return new MessageEntity(
                conversationId,
                null,
                MessageType.EVENT,
                eventType,
                eventData,
                null,
                null
        );
    }
}
