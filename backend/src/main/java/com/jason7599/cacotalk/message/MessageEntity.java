package com.jason7599.cacotalk.message;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageEntity {

    @Embeddable
    public record Id(
        UUID conversationId,
        long seq
    ) {
    }

    @EmbeddedId
    private Id id;

    private Long senderId;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private EventMessage event;

    private byte[] content;

    @Column(insertable = false)
    private Instant createdAt;

    private Long replyToSeq;

    private UUID clientId;
}
