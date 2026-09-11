package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.UserEntity;
import com.jason7599.cacotalk.user.UserRepository;
import com.jason7599.cacotalk.user.dto.UserResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

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

        // potential race condition, but I'd say this is trivial enough
        if (userRelationRepository.hasBlocked(userId, targetId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot add a blocked user as a contact.");
        }

        UserEntity target = userRepository.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        userRelationRepository.addContact(userId, targetId);

        return new UserResponse(target);
    }

    @Transactional
    public void removeContact(long userId, long targetId) {
        userRelationRepository.removeContact(userId, targetId);
    }

    public boolean isContact(long userId, long targetId) {
        return userRelationRepository.isContact(userId, targetId);
    }

    public List<UserResponse> getBlockedUsers(long userId) {
        return userRelationRepository.getBlockedUsers(userId);
    }

    // TODO: WebSocket event
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

    // TODO: WebSocket event
    @Transactional
    public void unblockUser(long userId, long targetId) {
        userRelationRepository.removeBlock(userId, targetId);
    }

    public boolean hasBlocked(long blockerId, long blockedId) {
        return userRelationRepository.hasBlocked(blockerId, blockedId);
    }
}
