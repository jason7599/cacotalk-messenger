package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.UserService;
import com.jason7599.cacotalk.user.dto.UserResponse;
import com.jason7599.cacotalk.websocket.RealtimeEvent;
import com.jason7599.cacotalk.websocket.RealtimeEventPublisher;
import jakarta.annotation.Nullable;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserRelationService {

    private final UserRelationRepository userRelationRepository;

    private final UserService userService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public List<UserResponse> getContacts(long userId) {
        return userRelationRepository.getContacts(userId);
    }

    @Transactional
    public UserResponse addContact(long userId, long targetId) {
        if (userId == targetId) {
            throw new  ApiException(HttpStatus.BAD_REQUEST, "Cannot add self as contact.");
        }

        if (userRelationRepository.hasBlocked(userId, targetId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot add a blocked user as a contact.");
        }

        UserResponse target = userService.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        // This is technically a TOCTOU scenario.
        // One that I will consciously overlook.
        // Tiny possibility, non-catastrophic outcome.
        // Scenario: User A adds user B. But this devilish mofo user A with another tab open, blocks user B
        // Outcome: User A has user B as contact, despite also having user B blocked.
        // Good job dude
        if (userRelationRepository.addContact(userId, targetId) == 1) {
            realtimeEventPublisher.sendToUser(
                    userId,
                    new RealtimeEvent.ContactChanged(target, true)
            );
        }

        return target;
    }

    @Transactional
    public void removeContact(long userId, long targetId) {
        if (userId == targetId) {
            return; // ignore bullshit request
            // jokes aside, fits with DELETE REST convention
        }

        UserResponse target = userService.findById(targetId).orElse(null);
        if (target == null) {
            return; // same thing here
        }

        if (userRelationRepository.removeContact(userId, targetId) == 1) {
            realtimeEventPublisher.sendToUser(
                    userId,
                    new RealtimeEvent.ContactChanged(target, false)
            );
        }
    }

    public List<UserResponse> getBlockedUsers(long userId) {
        return userRelationRepository.getBlockedUsers(userId);
    }

    @Transactional
    public UserResponse blockUser(long userId, long targetId) {
        if (userId == targetId) {
            throw new  ApiException(HttpStatus.BAD_REQUEST, "Cannot block self");
        }

        UserResponse target = userService.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        // auto remove from contact
        // hm. Or we can let the FE be smart and do contact removal when it gets BLOCK_CHANGED (true)
        if (userRelationRepository.removeContact(userId, targetId) == 1) {
            realtimeEventPublisher.sendToUser(
                    userId,
                    new RealtimeEvent.ContactChanged(target, false)
            );
        }

        if (userRelationRepository.addBlock(userId, targetId) == 1) {
            realtimeEventPublisher.sendToUser(
                    userId,
                    new RealtimeEvent.BlockChanged(target, true)
            );
        }

        return target;
    }

    @Transactional
    public void unblockUser(long userId, long targetId) {
        if (userId == targetId) {
            return;
        }

        UserResponse target = userService.findById(targetId).orElse(null);
        if (target == null) {
            return;
        }

        if (userRelationRepository.removeBlock(userId, targetId) == 1) {
            realtimeEventPublisher.sendToUser(
                    userId,
                    new RealtimeEvent.BlockChanged(target, false)
            );
        }
    }

    // Returns users the requesting user is allowed to invite.
    // A user is invitable if they are a contact of the user and have not blocked them.
    // If conversationId is non-null, users who are already members of that conversation are excluded.
    // If it is null, conversation membership is not considered.
    public List<UserResponse> getInvitableUsers(@Nullable UUID conversationId, long userId) {
        return userRelationRepository.getInvitableUsers(conversationId, userId);
    }

    // Checks whether all target users are valid invitees.
    // If conversationId is non-null, users that are already members of this conversation are considered invalid.
    public boolean validateInvitable(@Nullable UUID conversationId, long userId, List<Long> targetIds) {
        return userRelationRepository.validateInvitable(conversationId, userId, targetIds);
    }
}
