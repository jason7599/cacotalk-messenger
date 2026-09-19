package com.jason7599.cacotalk.user;

import com.jason7599.cacotalk.user.dto.UserResponse;
import com.jason7599.cacotalk.user.dto.UserSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int QUERY_MIN_LENGTH = 3;
    private static final int QUERY_MAX_LENGTH = 32;
    private static final int QUERY_LIMIT = 20;

    private final UserRepository userRepository;

    public Optional<UserResponse> findById(Long userId) {
        return userRepository.findById(userId).map(UserResponse::new);
    }

    public boolean exists(long userId) {
        return userRepository.existsById(userId);
    }

    public List<UserResponse> findAllById(List<Long> userIds) {
        return userRepository.findAllByIdInOrderByUsername(userIds)
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    public List<UserSearchResponse> searchUsers(long requesterId, String query) {
        query = query.toLowerCase().trim();

        if (query.length() < QUERY_MIN_LENGTH || query.length() > QUERY_MAX_LENGTH) {
            return List.of();
        }

        return userRepository.searchUsers(requesterId, query, QUERY_LIMIT);
    }
}
