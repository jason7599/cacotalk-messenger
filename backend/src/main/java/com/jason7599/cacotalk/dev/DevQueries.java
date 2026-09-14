package com.jason7599.cacotalk.dev;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevQueries {

    private final JdbcTemplate jdbcTemplate;

    public List<Long> getAllUserIds() {
        return jdbcTemplate.queryForList(
                "SELECT id FROM users",
                Long.class
        );
    }

    public long countMessages(UUID conversationId) {
        Long res = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM messages
                WHERE conversation_id = ?
                """,
                Long.class,
                conversationId
        );
        return res != null ? res : 0L;
    }
}
