# 014 - ACK Strategy

App is almost done, there's just one thing left, intentionally kept for last..

The acks. As in, marking messages as "read".

This is another thing where complexity is greater on the FE side than the BE side.

BE side was easy as shit.

```java
@Modifying
@Query(value = """
    UPDATE conversation_members
    SET last_read_seq = GREATEST(last_read_seq, :seq) -- idempotent
    WHERE conversation_id = :conversationId AND user_id = :userId
""", nativeQuery = true)
void updateLastReadSeq(UUID conversationId, long userId, long seq);
```

But now in the FE I have to make 2 big decisions.

## 1. When does a message count as "read"?

I guess the big debate boils down to whether to mark incoming messages as read, even if the user was reading old messages.

I.e., when the new messages aren't in the user's view.

Hmm.. I mean, not counting them would be the better UX, I guess. I think Discord does that.

But I know apps like Kakao don't do it lol

Eh. OK, I think I will count them as read.

But then I will implement very clear indicators when a new message arrives while the user is not near the bottom.

Something like "X new messages / Jump to Bottom".

So, big picture:
1. Upon opening a convo, mark everything as read.
2. While the user has that conversation open, every incoming message is marked as read, regardless of where the user is looking at.


## 2. When does the BE action happen?

This is the bigger headache I think. 

Obviously the naive approach would be to do it here:
```ts
function handleNewMessage(message: ChatMessage, clientId?: string) {
    ...
    if (useActiveConversationStore.getState().conversation?.id === message.conversationId) {
        useActiveConversationStore.getState().upsertMessage(message);
    }
}
```

Let's not do that. 

Keep local values, smth like `pendingSeq` and `ackedSeq`, and debounce the flush.

Also flush upon closing the convo. 

Ofc that isn't the most robust implementation in the world, but I think it's better than harassing the BE.

Actually, on second thought, I think it would be robust enough.

The only failure scenario I can think of is when connection is dropped and there are messages that haven't been flushed yet, then yeah those messages would be marked unread.

But honestly? If connection drops, I think it's fair to say anything goes lol.

As in, I don't think it would be terribly disgusting to see a few messages marked as unread, considering the whole connection freaking dropped.

Plus, with a reasonable debounce window, I feel like that would be very rare anyway.

Speaking of "disgusting" tho... Maybe, my own message appearing as unread might be disgusting.

Because that one is like semantically wrong.

Hm. Or I guess the backend can do it in `MessageService#sendUserMessage`. 

I don't think that's an unreasonable approach.

Yeah OK. I think "my own message is unread" is a shitty enough problem that derserves some BE level enforcement.


## Oh.. I'm gonna need another RealtimeEvent for this too lol

The multi-session/tab user problem, at it again.

This time though I think it's more than just "It's nice UX to keep them in sync", because let's be real that was what all the previous sync events were for.

But now since the FE has to do a debounced ack thingy, especially with keeping something like `ackedSeq`, these values not lining up among different clients would def lead to redundant, stale ack requests.

It won't be a major perf problem given how the logic is literally a single update statement, but still.

Gotta do it to keep consistent with the sync sessions approach anyway.

OK this won't be too bad