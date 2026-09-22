package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.conversation.dto.ConversationDetail;
import com.jason7599.cacotalk.conversation.dto.ConversationSummary;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.message.EventMessage;
import com.jason7599.cacotalk.message.EventMessageService;
import com.jason7599.cacotalk.message.dto.MessageResponse;
import com.jason7599.cacotalk.user.UserService;
import com.jason7599.cacotalk.user.dto.UserResponse;
import com.jason7599.cacotalk.userrelation.UserRelationService;
import com.jason7599.cacotalk.websocket.RealtimeEvent;
import com.jason7599.cacotalk.websocket.RealtimeEventPublisher;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private static final int GROUP_CONVERSATION_MINIMUM_SIZE = 3;
    private static final int GROUP_CONVERSATION_MAXIMUM_SIZE = 100;

    private final ConversationRepository conversationRepository;

    private final MembershipLookupService membershipLookupService;
    private final UserRelationService userRelationService;
    private final UserService userService;
    private final EventMessageService eventMessageService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    private ConversationSummary summaryFromProjection(ConversationSummary.Projection p) {
        return new ConversationSummary(
                p.getConversationId(),
                p.getConversationType(),
                Arrays.asList(p.getMembersPreview()),
                p.getMemberCount(),
                p.getGroupCreatorId(),
                p.getLastReadSeq(),
                p.getConversationCreatedAt(),
                p.getLastSeq() > 0 ? new MessageResponse(
                        p.getConversationId(),
                        p.getLastSeq(),
                        p.getLastMessageSenderId(),
                        p.getLastMessageSenderName(),
                        p.getLastMessageType(),
                        eventMessageService.decode(p.getLastMessageEvent()),
                        p.getLastMessageContent(),
                        p.getLastMessageCreatedAt()
                ) : null
        );
    }

    public List<ConversationSummary> getConversationSummaries(long userId) {
        return conversationRepository.getConversationSummaries(userId)
                .stream()
                .map(this::summaryFromProjection)
                .toList();
    }

    public ConversationSummary getConversationSummary(UUID conversationId, long userId) {
        ConversationSummary.Projection p = conversationRepository.getConversationSummary(conversationId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));

        return summaryFromProjection(p);
    }

    // Called when user opens a conversation
    public ConversationDetail getConversationDetail(UUID conversationId, long userId) {
        long lastReadSeq = membershipLookupService.requireMembership(conversationId, userId).lastReadSeq();

        ConversationDetail.Projection p = conversationRepository.getConversationDetail(conversationId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found."));

        List<UserResponse> members = membershipLookupService.getAllMembersExcept(conversationId, userId);

        return new ConversationDetail(
                p.getId(),
                p.getType(),
                members,
                p.getBlockedMe(),
                p.getGroupCreatorId(),
                p.getIsClosed(),
                p.getLastSeq(),
                lastReadSeq,
                p.getCreatedAt()
        );
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

        UUID createId = UUID.randomUUID();

        UUID id = conversationRepository.resolveDirectConversation(userId, targetId, createId);

        // actual creation happened here.
        // insertMembers itself is idempotent so this check is technically unnecessary, but it's nice.
        if (id.equals(createId)) {
            conversationRepository.insertMembers(id, new long[]{userId, targetId});
        }

        return id;
    }

    /**
     * Idempotent.
     * The signature does look weird. This is because clientId is actually the conversation id.
     * Because conversation ID doubles as a client id, the return value of this method itself is quite redundant.
     * If a conversation with the same clientId already existed, it returns the given clientId.
     * If not, it inserts one and assigns the given clientId, and returns it.
     * So either way, it returns the given clientId, so the caller gains no new information.
     * I suppose this is just the natural quirkiness that comes from an ID doubling as a clientId.
     */
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

        // conversation with clientId already exists.
        // We NEED this distinction here so that we can avoid inserting duplicate GROUP_CREATED eventData messages
        if (conversationRepository.insertGroupConversation(userId, clientId).isEmpty()) {
            // Even in case where a malicious actor was probing for exiting conversation Ids,
            // this shouldn't be a big problem. Not only do we skip membership inserts in case of conflict,
            // every other conversation API is guarded with a membership check.
            // So the worst thing that can happen is, the attacker finds out this clientId is in use.
            // Nothing else.
            return clientId;
        }

        // This looks confusing, because clientId is actually the conversation id.
        // Because again, the id doubles as a clientId.

        long[] allMemberIds = Stream.concat(Stream.of(userId), initMemberIds.stream())
                .mapToLong(Long::longValue)
                .toArray();

        conversationRepository.insertMembers(clientId, allMemberIds);

        List<UserResponse> initMembers = userService.findAllById(initMemberIds);

        eventMessageService.sendEventMessage(
                clientId,
                new EventMessage.GroupCreated(initMembers)
        );

        return clientId;
    }

    // On DIRECT: check no block status exists
    // On GROUP: check is_closed is false
    // Membership check is also done
    public boolean canSendMessage(UUID conversationId, long userId) {
        return conversationRepository.canSendMessage(conversationId, userId);
    }

    // Returns Optional.empty() if room doesn't exist or is not a GROUP conversation
    /*
    I did consider putting this in MembershipLookupService. Decided against it after a while
    MembershipLookupService, at least as of now, concerns the conversation_members table queries.
    This instead is a query on the conversations table itself.
    So yeah, it lives here for now.
     */
    public Optional<Long> getGroupCreatorId(UUID conversationId) {
        return conversationRepository.getGroupCreatorId(conversationId);
    }

    @Transactional
    public boolean leaveConversation(UUID conversationId, long userId) {

        // This means a retry on the leave request would lead to a 403, rather than being textbook "idempotent"
        // But it's fine. Throwing 403 is still a no-op anyway.
        // Can even argue this is semantically more correct - trying to leave a conversation that a user is not a member of.
        membershipLookupService.requireMembership(conversationId, userId);

        // Either convo itself doesn't exist, or is not a GROUP convo.
        long creatorId = getGroupCreatorId(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Group conversation not found."));

        if (userId == creatorId) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Group creator cannot leave the group.");
        }

        // Membership didn't exist.
        // Given how it passed the requireMembership check earlier,
        // this has to be a genuine concurrent race, safe to terminate early.
        if (conversationRepository.removeMember(conversationId, userId) == 0) {
            return false;
        }

        // Ahh... this shit again. Maybe I really should consider caching username into AuthPrincipal.
        // SAFE: userId passed requireMembership and authentication filter
        @SuppressWarnings("OptionalGetWithoutIsPresent")
        UserResponse user = userService.findById(userId).get();

        // Persist MEMBER_LEFT message
        // this triggers a NEW_MESSAGE realtime event broadcast
        eventMessageService.sendEventMessage(
                conversationId,
                new EventMessage.MemberLeft(user)
        );

        // This is for clients in multi-session settings
        // Since the MEMBER_LEFT event message is broadcasted after the membership row removal
        // The session of the requester can do an optimistic UI update, whereas the other sessions will
        // miss the event unless we fire a separate signal like this
        realtimeEventPublisher.sendToUser(
                userId,
                new RealtimeEvent.RemovedFromGroup(conversationId)
        );

        return true;
    }
}
