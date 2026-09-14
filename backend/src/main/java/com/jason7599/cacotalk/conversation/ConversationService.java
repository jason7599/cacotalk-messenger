package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ConversationMembership requireMembership(UUID conversationId, long userId) {
        return conversationRepository.getMembership(conversationId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Not a member of this conversation."));
    }

    public List<ConversationSummary> getConversationSummaries(long userId) {
        return conversationRepository.getConversationSummaries(userId)
                .stream()
                .map(ConversationSummary::fromProjection)
                .toList();
    }

    @Transactional
    public ConversationSummary getOrCreateDirectConversation(long userId, long targetId) {
        if (userId == targetId) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot have a direct conversation with self.");
        }

        if (!userRepository.existsById(targetId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found.");
        }

        // no need to check userId as it should be validated by AuthenticationPrincipal

        UUID id = conversationRepository.getOrCreateDirectConversation(userId, targetId, UUID.randomUUID());

        conversationRepository.insertMembers(id, new long[]{userId, targetId});

        return ConversationSummary.fromProjection(
            conversationRepository.getConversationSummary(id, userId)
                    .orElseThrow()
        );
    }
}
