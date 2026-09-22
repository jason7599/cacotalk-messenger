package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.UserEntity;
import com.jason7599.cacotalk.user.UserRepository;
import com.jason7599.cacotalk.user.dto.UserResponse;
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
    private final UserRepository userRepository;

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

        UserEntity target = userRepository.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        // This is technically a TOCTOU scenario.
        // One that I will consciously overlook.
        // Tiny possibility, non-catastrophic outcome.
        // Scenario: User A adds user B. But this devilish mofo user A with another tab open, blocks user B
        // Outcome: User A has user B as contact, despite also having user B blocked.
        // Good job dude
        userRelationRepository.addContact(userId, targetId);

        return new UserResponse(target);
    }

    @Transactional
    public void removeContact(long userId, long targetId) {
        userRelationRepository.removeContact(userId, targetId);
    }

    public List<UserResponse> getBlockedUsers(long userId) {
        return userRelationRepository.getBlockedUsers(userId);
    }

    @Transactional
    public UserResponse blockUser(long userId, long targetId) {
        if (userId == targetId) {
            throw new  ApiException(HttpStatus.BAD_REQUEST, "Cannot block self");
        }

        UserEntity target = userRepository.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        userRelationRepository.removeContact(userId, targetId);
        userRelationRepository.addBlock(userId, targetId);

        return new UserResponse(target);
    }

    @Transactional
    public void unblockUser(long userId, long targetId) {
        userRelationRepository.removeBlock(userId, targetId);
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
