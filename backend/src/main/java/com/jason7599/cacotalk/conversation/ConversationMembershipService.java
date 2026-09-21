package com.jason7599.cacotalk.conversation;

import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationMembershipService {

    private final ConversationRepository conversationRepository;

    public ConversationMembership requireMembership(UUID conversationId, long userId) {
        return conversationRepository.getMembership(conversationId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Not a member of this conversation."));
    }

    public List<UserResponse> getAllMembersExcept(UUID conversationId, long userId) {
        return conversationRepository.getAllMembersExcept(conversationId, userId);
    }

    public List<Long> getAllMemberIds(UUID conversationId) {
        return conversationRepository.getAllMemberIds(conversationId);
    }
}
