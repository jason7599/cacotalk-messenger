package com.jason7599.cacotalk.message;

import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.websocket.RealtimeEvent;
import com.jason7599.cacotalk.websocket.RealtimeEventPublisher;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

/**
 * Ripped out of MessageService,
 * as with MessageService relying on ConversationService#requireMembership & canSendMessage
 * and ConversationService needing #sendEventMessage causes a dependency cycle.
 * I suppose it fits semantically anyway, since sendEventMessage was the only method that is completely BE-sided.
 * Oh, especially more-so now that we need the conversion codec shit
 */

@Service
@RequiredArgsConstructor
public class EventMessageService {

    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    private final RealtimeEventPublisher  realtimeEventPublisher;

    @Transactional
    public MessageResponse sendEventMessage(UUID conversationId, EventMessage eventMessage) {
        MessageEntity inserted = messageRepository.insertMessage(
                conversationId,
                null,
                MessageType.EVENT.name(),
                encode(eventMessage),
                null,
                null
        );

        MessageResponse message = new MessageResponse(
                conversationId,
                inserted.getId().seq(),
                null,
                null,
                MessageType.EVENT,
                eventMessage,
                null,
                inserted.getCreatedAt()
        );

        realtimeEventPublisher.broadcast(
                conversationId,
                new RealtimeEvent.NewMessage(message)
        );

        return message;
    }

    public String encode(EventMessage eventMessage) {
        try {
            return objectMapper.writeValueAsString(eventMessage);
        } catch (JacksonException e) {
            throw new RuntimeException("Failed to serialize event message", e);
        }
    }

    public EventMessage decode(String json) {
        if (json == null) {
            return null;
        }

        try {
            // Jackson owns the subtype dispatch
            return objectMapper.readValue(json, EventMessage.class);
        }  catch (JacksonException e) {
            throw new RuntimeException("Failed to deserialize event message", e);
        }
    }
}
