# 009 - BlockStatus Events

So, say user A was typing a message in a direct conversation with user B.

While A was typing, B blocks user A.

What do we do?

First instinct I had was to trigger a realtime event via WebSocket - something like BlockStatusChangedEvent, straight to the affected user (in this case, user A)'s per-user queue. 
```
{
    type: BLOCK_STATUS_CHANGE
    blocker_id: B
    blocked: true
}
```

So the FE, when it gets this event, checks if the currently opened conversation is a direct conversation with B, and if so, update the UI.

Sounds reasonable. And almost went ahead and implemented it that way.

But it got me thinking.. In my SDD, I wrote:
> The blocked user is not directly notified of the action.

I mean, it isn't exactly "directly notifying" to just disable the input bar.. If user A didn't have user B's direct conversation open, A would see no change anyway.

But still, the fact that the FE has to receive and process it, didn't sit right with me. 
- If user A had DevTools open, he'd see the event in the WS section.
- Say a bunch of jackasses decided to mass-spam block/unblock on a specific target user. That is burdening the target user's client. 

So nah, this just aint right.

So I have 2 ideas..

## 1. No real-time event on block status change.

Just don't care about them lol

But in seriousness, I think this is quite valid too. Because:
- Let's be real. A mid-conversation block? It's not gonna be a common thing that happens.
- And even if it does. What's the worst case scenario? User A finishes what he was writing, hits send, and then immediately sees an error: "Cannot send a message in this conversation". And then later when he reloads the page, or switches to another conversation and comes back, he will then see the updated state. 

Really tempted on this option.

## 2. Per-conversation event queue.

Given how a block only needs to trigger an update in that one specific direct conversation's UI, why not scope the event to each conversation? AND. Importantly, have the FE make at most one conversation queue subscription at a time.  

So the actual flow would be something like:
1. User B requests to block User A
2. Backend persists the block
3. Backend looks up the id of the direct conversation between A and B
4. If exists, send the block status event in that conversation queue only
5. FE receives, and updates the UI.

I think in theory, this is perfect. Like architecturally and semantically perfect. FE only handles block events that are actually relevant to what the UI is showing. 

But of course, this is added complexity on the FE-side. Managing a stomp subscription cycle tied to the active conversation, wouldn't be exactly trivial.

# Verdict

So. Made my mind. Going with a mix of the 2 options kinda. For now, no realtime event for block status change. 

I just don't think this information and reactivity is worth the hassle. 

BUT. If I later do touch per-conversation event queues for something like typing status or whatever, I will consider implementing it there. 