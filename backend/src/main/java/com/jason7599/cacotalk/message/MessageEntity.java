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

    @EmbeddedId
    private MessageId id;

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
}
