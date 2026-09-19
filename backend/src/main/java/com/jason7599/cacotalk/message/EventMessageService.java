package com.jason7599.cacotalk.message;

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

    // TODO: ws eventData
    @Transactional
    public MessageEntity sendEventMessage(UUID conversationId, EventData eventData) {
        return messageRepository.insertMessage(
                conversationId,
                null,
                MessageType.EVENT.name(),
                eventData.type().name(),
                encode(eventData),
                null,
                null
        );
    }

    public EventData decode(EventMessageType type, String json) {
        if (type == null) {
            return null;
        }

        try {
            return objectMapper.readValue(json, EventData.getClass(type));
        } catch (JacksonException e) {
            throw new RuntimeException("Failed to deserialize eventData message.", e);
        }
    }

    public String encode(EventData event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JacksonException e) {
            throw new RuntimeException("Failed to serialize eventData message.", e);
        }
    }
}
