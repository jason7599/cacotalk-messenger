package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.conversation.dto.ConversationDetail;
import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.UserService;
import com.jason7599.cacotalk.user.dto.UserResponse;
import com.jason7599.cacotalk.userrelation.UserRelationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private static final int GROUP_CONVERSATION_MINIMUM_SIZE = 3;
    private static final int GROUP_CONVERSATION_MAXIMUM_SIZE = 100;

    private final ConversationRepository conversationRepository;

    private final UserRelationService userRelationService;
    private final UserService userService;

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
    public UUID resolveDirectConversation(long userId, long targetId) {
        if (userId == targetId) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot have a direct conversation with self.");
        }

        if (!userService.exists(targetId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found.");
        }

        // no need to check userId as it should be validated by AuthenticationPrincipal

        UUID id = conversationRepository.resolveDirectConversation(userId, targetId, UUID.randomUUID());

        conversationRepository.ensureMembers(id, new long[]{userId, targetId});

        return id;
    }

    // TODO: send group_created event message
    // Idempotent.
    // Not exactly happy about the param & return shape combo, but sticking with it. See comment above ConversationRepository.resolveDirectConversation
    @Transactional
    public UUID createGroupConversation(long userId, List<Long> initMemberIds, UUID clientId) {
        initMemberIds = initMemberIds.stream().distinct().toList();

        // + 1 to include the requester
        if (initMemberIds.size() + 1 < GROUP_CONVERSATION_MINIMUM_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A group needs at least %d other members.".formatted(GROUP_CONVERSATION_MINIMUM_SIZE - 1));
        }

        if (initMemberIds.size() + 1 > GROUP_CONVERSATION_MAXIMUM_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A group can have at most %d members.".formatted(GROUP_CONVERSATION_MAXIMUM_SIZE));
        }

        if (!userRelationService.validateInvitable(userId, initMemberIds)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Some members cannot be added.");
        }

        UUID id = conversationRepository.resolveGroupConversation(userId, clientId);

        long[] allMemberIds = Stream.concat(Stream.of(userId), initMemberIds.stream())
                .mapToLong(Long::longValue)
                .toArray();

        conversationRepository.ensureMembers(id, allMemberIds);

        return id;
    }

    // Called when user opens a conversation
    public ConversationDetail getConversationDetail(UUID conversationId, long userId) {
        long lastReadSeq = requireMembership(conversationId, userId).lastReadSeq();

        ConversationDetail.Projection p = conversationRepository.getConversationDetail(conversationId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found."));

        List<UserResponse> members = conversationRepository.getAllMembersExcept(conversationId, userId);

        return new ConversationDetail(
                p.getId(),
                p.getType(),
                members,
                p.getBlockStatus(),
                p.getGroupCreatorId(),
                p.getIsClosed(),
                p.getLastSeq(),
                lastReadSeq,
                p.getCreatedAt()
        );
    }

    // On DIRECT: check no block status exists
    // On GROUP: check is_closed is false
    public boolean canSendMessage(long userId, UUID conversationId) {
        return conversationRepository.canSendMessage(userId, conversationId);
    }
}
