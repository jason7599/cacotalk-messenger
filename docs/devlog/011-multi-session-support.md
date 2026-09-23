# 011 - Multi-session Support

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