package com.jason7599.cacotalk.dev;

import com.jason7599.cacotalk.conversation.ConversationRepository;
import com.jason7599.cacotalk.message.*;
import com.jason7599.cacotalk.user.UserEntity;
import com.jason7599.cacotalk.user.UserRepository;
import com.jason7599.cacotalk.user.dto.UserResponse;
import com.jason7599.cacotalk.userrelation.UserRelationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@Profile("dev")
@RequiredArgsConstructor
public class DevDataService {

    private static final String DEV_USERNAME = "jason";
    private static final String USER_PASSWORD = "123456";

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final UserRelationRepository userRelationRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageEncryptionService messageEncryptionService;

    private final JdbcTemplate jdbcTemplate;
    private final RedisConnectionFactory redisConnectionFactory;
    private final DevQueries devQueries;

    private static final Random RANDOM = new Random();

    public void nuke() {
        jdbcTemplate.execute(
                "TRUNCATE TABLE users RESTART IDENTITY CASCADE"
        );

        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            connection.serverCommands().flushDb();
        }
    }

    public long seedUsers(int count) {
        if (count <= 0) {
            return userRepository.count();
        }

        int created = 0;
        if (createDev()) {
            created++;
        }

        String encodedPassword = passwordEncoder.encode(USER_PASSWORD);
        while (created < count) {
            try {
                String username;
                do {
                    username = DevDataFaker.username();
                } while (username.equals(DEV_USERNAME));

                UserEntity user = new UserEntity(
                        username,
                        encodedPassword
                );

                userRepository.saveAndFlush(user);
                created++;
            } catch (DataIntegrityViolationException e) {
                // retry
            }
        }

        return userRepository.count();
    }

    public int seedContacts(double ratio) {
        if (ratio < 0 || ratio > 1) {
            throw new IllegalArgumentException("ratio must be between 0 and 1");
        }

        List<Long> userIds = devQueries.getAllUserIds();
        int userCount = userIds.size();

        int targetCount = (int)(userCount * (userCount - 1) * ratio);
        int created = 0;

        for (int i = 0; i < targetCount; i++) {
            Long id1 = userIds.get(RANDOM.nextInt(userCount));
            Long id2 = userIds.get(RANDOM.nextInt(userCount));

            if (id1.equals(id2)) {
                continue;
            }

            created += userRelationRepository.addContact(id1, id2);
        }

        return created;
    }

    private static final double REPLY_CHANCE = 0.1;
    private static final int MAX_REPLY_DISTANCE = 15;       // how far away of a message can a message reply to
    private static final double REACTION_CHANCE = 0.2;      // how often a message gets reactions at all
    private static final double REACTOR_CHANCE = 0.4;       // each member's chance to react on such messages

    @Transactional
    public long seedMessages(UUID conversationId, int messageCount) {
        if (messageCount <= 0) {
            throw new IllegalArgumentException("messageCount must be greater than 0");
        }

        List<Long> memberIds = conversationRepository.getAllMembers(conversationId)
                .stream().map(UserResponse::userId).toList();

        if (memberIds.isEmpty()) {
            throw new IllegalStateException("Conversation has no members");
        }

        long startSeq = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"))
                .getLastSeq();
        long seq = startSeq;

        final MessageReactionType[] reactionTypes = MessageReactionType.values();

        while (messageCount-- > 0) {
            String message = seq + 1 + " " + DevDataFaker.message();
            if (message.length() > MessageRules.MESSAGE_MAX_LENGTH) {
                message = message.substring(0, MessageRules.MESSAGE_MAX_LENGTH);
            }

            Long replyToSeq = null;
            if (seq > startSeq && RANDOM.nextDouble() < REPLY_CHANCE) {
                long from = Math.max(startSeq + 1, seq - MAX_REPLY_DISTANCE + 1);
                replyToSeq = from + RANDOM.nextLong(seq - from + 1);
            }

            if (++seq != messageRepository.insertMessage(
                    conversationId,
                    memberIds.get(RANDOM.nextInt(memberIds.size())),
                    MessageType.USER.name(),
                    null,
                    messageEncryptionService.encrypt(message),
                    replyToSeq,
                    UUID.randomUUID()
            ).getId().seq()) {
                throw new RuntimeException("Conversation modified while seeding. Rolling back");
            }

            if (RANDOM.nextDouble() < REACTION_CHANCE) {
                for (long memberId : memberIds) {
                    if (RANDOM.nextDouble() < REACTOR_CHANCE) {
                        messageRepository.upsertReaction(
                                conversationId,
                                seq,
                                memberId,
                                reactionTypes[RANDOM.nextInt(reactionTypes.length)].name()
                        );
                    }
                }
            }
        }

        for (long memberId : memberIds) {
            conversationRepository.updateLastReadSeq(conversationId, memberId, seq);
        }

        return seq;
    }

    private boolean createDev() {
        try {
            userRepository.saveAndFlush(
                    new UserEntity(
                            DEV_USERNAME,
                            passwordEncoder.encode(USER_PASSWORD)
                    )
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
