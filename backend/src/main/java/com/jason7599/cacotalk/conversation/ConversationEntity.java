package com.jason7599.cacotalk.conversation;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConversationEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private ConversationType type;

    private Long directUserId1;
    private Long directUserId2;

    private Long groupCreatorId;

    private boolean isClosed;

    @Column(insertable = false)
    private Instant createdAt;

    private ConversationEntity(
            UUID id,
            ConversationType type,
            Long directUserId1,
            Long directUserId2,
            Long groupCreatorId) {
        this.id = id;
        this.type = type;
        this.directUserId1 = directUserId1;
        this.directUserId2 = directUserId2;
        this.groupCreatorId = groupCreatorId;
    }

    public static ConversationEntity direct(UUID id, long userId1, long userId2) {
        return new ConversationEntity(
                id,
                ConversationType.DIRECT,
                Math.min(userId1, userId2),
                Math.max(userId1, userId2),
                null
        );
    }

    public static ConversationEntity group(UUID id, long groupCreatorId) {
        return new ConversationEntity(
                id,
                ConversationType.GROUP,
                null,
                null,
                groupCreatorId
        );
    }
}
