package com.jason7599.cacotalk.user;

import com.jason7599.cacotalk.user.dto.UserSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSearchService {

    private static final int QUERY_MIN_LENGTH = 3;
    private static final int QUERY_MAX_LENGTH = 32;
    private static final int QUERY_LIMIT = 20;

    private final UserRepository userRepository;

    public List<UserSearchResponse> searchUsers(long requesterId, String query) {
        query = query.toLowerCase().trim();

        if (query.length() < QUERY_MIN_LENGTH || query.length() > QUERY_MAX_LENGTH) {
            return List.of();
        }

        return userRepository.searchUsers(requesterId, query, QUERY_LIMIT);
    }
}
