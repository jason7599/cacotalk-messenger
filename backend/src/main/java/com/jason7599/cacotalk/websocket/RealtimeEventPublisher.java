package com.jason7599.cacotalk.websocket;

import com.jason7599.cacotalk.conversation.MembershipLookupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final MembershipLookupService membershipLookupService;

    public void sendToUser(long userId, RealtimeEvent event) {
        afterCommit(() -> doSendToUser(userId, event));
    }

    public void broadcast(UUID conversationId, RealtimeEvent event) {
        afterCommit(() -> {
            for (Long memberId : membershipLookupService.getAllMemberIds(conversationId)) {
                doSendToUser(memberId, event);
            }
        });
    }

    private void doSendToUser(long userId, RealtimeEvent event) {
        messagingTemplate.convertAndSendToUser(
                Long.toString(userId),
                "/queue/events",
                event
        );
    }

    /**
     * Runs the action after the current transaction commit, or right away if none.
     * Ensures the action never runs if the transaction rolls back
     */
    private void afterCommit(Runnable action) {
        // Whether a @Transactional method is running
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            // Queue the action after this transaction
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    run(action);
                }
            });
        } else {
            // If it's not a transaction, just run it now
            run(action);
        }
    }

    private void run(Runnable action) {
        try {
            action.run();
        } catch (Exception e) {
            log.error("Realtime event delivery failed", e);
        }
    }
}
