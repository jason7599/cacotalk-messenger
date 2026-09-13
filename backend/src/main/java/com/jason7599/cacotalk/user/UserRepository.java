package com.jason7599.cacotalk.user;

import com.jason7599.cacotalk.user.dto.UserSearchResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    @Query(value = """
    SELECT
        u.id AS user_id,
        u.username,
        CASE
            WHEN b.blocked_id IS NOT NULL THEN 'BLOCKED'
            WHEN c.contact_id IS NOT NULL THEN 'CONTACT'
            ELSE 'NONE'
        END AS relation
    FROM users u
    LEFT JOIN contacts c
        ON c.user_id = :requesterId
        AND c.contact_id = u.id
    LEFT JOIN blocks b
        ON b.user_id = :requesterId
        AND b.blocked_id = u.id
    WHERE u.id <> :requesterId
        AND u.username LIKE LOWER(:query) || '%'
    ORDER BY u.username
    LIMIT :limit
    """, nativeQuery = true)
    List<UserSearchResponse> searchUsers(
            long requesterId,
            String query,
            int limit
    );

    boolean existsByUsername(String username);
}
