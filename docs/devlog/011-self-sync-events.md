# 011 - Self-Sync Events

So. Multi-session support is causing me a lot of headaches. 

Scenario:
1. User has 2 sessions, from either 2 different browser profiles or devices. Call them session A and session B.
2. In session A, user leaves a conversation. Handled by an HTTP API request, session A knows immediately to update the UI to remove that conversation.
3. Session B however, doesn't know.

The obvious fix would be to fire a per-user event over websocket whenever a change occurs.

The requesting session can rely on the API response to take action, and the other sessions can rely on WS events.

## wow

So, ngl, I was ready to just puss out and disallow multi-sessions entirely. Thought that would make my life easier.

But then I realized, the above example applies even for single sessioned situations. 

That is.. 2 browser tabs with the same browser profile. They use the same session key.

And unlike opening from 2 different devices, this one is indistinguishable.. 

OK. So I just gotta do it anyway.

```java
public sealed interface RealtimeEvent {

    enum Type {
        NEW_MESSAGE,

        // Unlike NEW_MESSAGE, below are "self-events"
        // To keep multi-session users' clients in sync.
        // Only to be sent per user, not broadcasted.
        // Let's call them, self-sync-events.
        CONTACT_CHANGED,
        BLOCK_CHANGED,
        REMOVED_FROM_GROUP,
    }
...
    record ContactChanged(UserResponse subject, boolean added) implements RealtimeEvent {
        @Override
        public Type type() { return Type.CONTACT_CHANGED; }
    }
```

Yeah. Self-sync events. 

## `RealtimeEvent` VS `EventMessage`

```java
public sealed interface EventMessage {

    enum Type {
        GROUP_CREATED,
        MEMBERS_INVITED,
        MEMBER_LEFT,
        MEMBER_REMOVED,
        GROUP_CLOSED
    }

    @JsonProperty("type") Type type();

    record GroupCreated(List<UserResponse> initMembers) implements EventMessage {
        @Override
        public Type type() { return Type.GROUP_CREATED; }
    }

    record MembersInvited(List<UserResponse> members) implements EventMessage {
        @Override
        public Type type() { return Type.MEMBERS_INVITED; }
    }

    record MemberLeft(UserResponse subject) implements EventMessage {
        @Override
        public Type type() { return Type.MEMBER_LEFT; }
    }
...
```

OK. RealtimeEvent and EventMessage are doing kinda similar jobs, and it is kinda getting somewhat confusing, so I'm gonna log this clearly.

- `RealtimeEvent`: All events sent over WebSocket. So this one is the mother of all events. Hail.
- `EventMessage`: Our domain event type message, i.e., `messages` with `type = 'EVENT`. So this itself arrives via `RealtimeEvent.NEW_MESSAGE`. So `EventMessage` by nature is scoped to a conversation. It cannot not have a relevant conversation.

### !!!The below stuff are kinda outdated thanks to the discovery in [the next log](./012-member-preview-sync.md)!!!

So, the idea is to rely on `EventMessage`s for UI sync whenever I can.

Think about the group creation flow. As per my design, a `EventMessage.GROUP_CREATED` message is automatically and atomically inserted along group creation. That is the first message of every group conversation.

With that event message insertion, a `RealtimeEvent.NEW_MESSAGE` is triggered and broadcasted for all the initial members.

So here's the thing - why should we make a separate `RealtimeEvent.GROUP_CREATED` event, when the client can just see the `EventMessage.GROUP_CREATED` and figure it out? 

The existing client architecture already handles this very naturally.

If a new message arrives, and the attached conversation ID is not found in the local conversation list store, an API request is sent to fetch the `ConversationSummary` object to upsert to the list.

Same goes for `MEMBERS_INVITED`, `MEMBER_LEFT` and `MEMBER_REMOVED`. We just don't need an extra event to handle it. It's redundant.

I do see that the client handler relying on the domain message entity might be a bit of a design smell.

And yes, it does add complexity where you'd exactly expect.

```tsx
function handleEventMessage(event: EventData) {
    switch (event.type) {
    case "GROUP_CREATED": break; // nothing to do here, for now. conversationsStore#onNewMessage will handle it
    case "MEMBERS_INVITED":
        // TODO: 
        // If I'm one of the invited members: 
        //      do nothing. conversationsStore#onNewMessage will handle the query to fetch the initial convo summary
        // else:
        //      conversationsStore: update sidebar display. Display name, membercount etc
        //      activeConversationStore: if current conversation, append to member list 
        break;
    case "MEMBER_LEFT": // fallthru
    case "MEMBER_REMOVED":
        // TODO: 
        // If I'm the one who got removed:
        //      do nothing, the self-sync event REMOVED_FROM_GROUP will handle it
        // else: 
        //      conversationsStore: update sidebar display. Display name, membercount etc
        //      activeConversationStore: if current conversation, remove from member list 
        break;
    case "GROUP_CLOSED":
        // TODO:
        // conversationsStore: nothing to do. Unless I later want a visual indication on closed groups
        // activeConversationStore: if current convo, update meta.isClosed
        break;
    }
}
```

But I would say it's completely justified. 

I actually tried implementing the extra event pattern, and it was just so stupid.

So like, `ConversationService#createGroupConversation` for example. 

After conversationd and membership insertion. 

It then invokes the `EventMessageService#sendEventMessage` to insert the `GROUP_CREATED` event message, 

which then it invokes `RealtimeEventPublisher#broadcast` to broadcast the `RealtimeEvent.NEW_MESSAGE` event.

And after all that, `ConversationService#createGroupConversation` has to publish an extra event?

Like, that's achieving nothing. The relevant data was already broadcasted, even if it was in the form of our domain message.

So, long story short, not utilizing `EventMessage` for certain UI sync logic would just be redundant.


## `RealtimeEvent.REMOVED_FROM_GROUP`

`CONTACT_CHANGED` and `BLOCK_CHANGED`, these ones should be obvious why they can't be `EventMessage`s. Because they're not scoped to a conversation.

`REMOVED_FROM_GROUP` though, I think is worth making clear. 

Especially because we already have `EventMessage.MEMBER_LEFT` and `EventMessage.MEMBER_REMOVED`.

Thing is, those event messages are fired after the membership removal is done.

So the actual member who gets removed from a group never receives them.

So it merits a separate event. 
