package com.jason7599.cacotalk.userrelation;

import com.jason7599.cacotalk.PostgresTestBase;
import com.jason7599.cacotalk.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@JdbcTest
class UserRelationRepositoryTest extends PostgresTestBase {

    @Autowired
    JdbcTemplate jdbcTemplate;

    UserRelationRepository userRelationRepository;

    @BeforeEach
    void setUp() {
        userRelationRepository = new UserRelationRepository(jdbcTemplate);

        jdbcTemplate.update("INSERT INTO users (id, username, password_hash) VALUES (1, 'alice', '')");
        jdbcTemplate.update("INSERT INTO users (id, username, password_hash) VALUES (2, 'bob', '')");
        jdbcTemplate.update("INSERT INTO users (id, username, password_hash) VALUES (3, 'carol', '')");
    }

    @Test
    void invitableUsersExcludesContactWhoBlockedRequester() {
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 2)");
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 3)");
        jdbcTemplate.update("INSERT INTO blocks (user_id, blocked_id) VALUES (2, 1)");

        List<UserResponse> result = userRelationRepository.getInvitableUsers(null, 1L);

        assertThat(result)
                .extracting(UserResponse::username)
                .containsExactly("carol");
    }

    @Test
    void validateTrueWhenAllTargetsAreValidContacts() {
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 2)");
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 3)");

        boolean result = userRelationRepository.validateInvitable(null, 1L, List.of(2L, 3L));

        assertThat(result).isTrue();
    }

    @Test
    void validateFalseWhenTargetIsNotAContact() {
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 2)");
        // 3 was never added as alice's contact

        boolean result = userRelationRepository.validateInvitable(null, 1L, List.of(2L, 3L));

        assertThat(result).isFalse();
    }

    @Test
    void validateFalseWhenTargetHasBlockedRequester() {
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 2)");
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 3)");
        // bob (2) blocked alice (1)
        jdbcTemplate.update("INSERT INTO blocks (user_id, blocked_id) VALUES (2, 1)");

        boolean result = userRelationRepository.validateInvitable(null, 1L, List.of(2L, 3L));

        assertThat(result).isFalse();
    }

    @Test
    void validateTrueWhenRequesterBlockedTargetButNotReverse() {
        // block-direction check: alice blocking bob should NOT block alice from inviting bob
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 2)");
        jdbcTemplate.update("INSERT INTO blocks (user_id, blocked_id) VALUES (1, 2)");

        boolean result = userRelationRepository.validateInvitable(null, 1L, List.of(2L));

        assertThat(result).isTrue();
    }

    @Test
    void validateFalseWhenNonExistentTarget() {
        // 2 and 3 valid, 4 not a contact at all
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 2)");
        jdbcTemplate.update("INSERT INTO contacts (user_id, contact_id) VALUES (1, 3)");

        boolean result = userRelationRepository.validateInvitable(null, 1L, List.of(2L, 3L, 4L));

        assertThat(result).isFalse();
    }
}