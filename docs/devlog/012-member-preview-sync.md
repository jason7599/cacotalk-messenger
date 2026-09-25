# 012 - Member Preview Sync

I was thinking about how nice it was to make the distinction between a lightweight `ConversationSummary` object, and a detailed `ConversationDetail` object.

Especially about the member list part. 

`ConversationSummary` only holds up to 3 other members, whereas `ConversationDetail` holds everyone. 

It made sense to me. Especially since `ConversationSummary` is deliberately supposed to be a lightweight object, something that holds just enough information to be nicely displayed on the list. As a preview.

But then, now as I'm implementing membership changes and events, some headaches are arrising.

Say a `ConversationSummary` object's `membersPreview` was `{"alice", "bob", "carol"}` (and had more members).

So. What should the FE do when it receives `EventMessage.MEMBER_LEFT`, depending on the subject (who left)? In terms of keeping a synced UI, especially the display name (which is composed of the names of the members).

If that member was not in the preview, OK, just don't touch the preview but rather decrement the `memberCount`.

But what if it was `"bob"`? 

The simplest workaround would be querying the DB, if and only if the removed member was one of the elements in the preview.

But now I'm thinking.. Wouldn't life be wonderful if `ConversationSummary` held the whole list?

Firstly, it makes the mentioned problem much easier.

But also, it would mean I won't have to maintain 2 different states for one relevant info. 

Because right now, the preview list in `ConversationSummary`, and then the actual list in `ConversationDetail`, both have to work in sync.

Well, I guess it's kinda unfair to simplify it that way, given there can be lots and lots of `ConversationSummary` (per conversation that the user is a member of), and just one `ConversationDetail` (the one the user has opened). 

Oh yeah fuck no. That was a dumb thought. That would be just so much bootstrap bloat, even for conversations that the user might not even freaking bother with.

Fetching the whole data for groups that the user never might even open the detail view for. 

Doesn't sit right with me.

Scrap that.

### Let's do some math actually

I am curious, I wanna confirm if bootstrapping the whole member list per convo is actually a terrible overhead, so let's do some math

Member info has 2 fields, username and id. Username is up to 32 byte ASCII, and id is a bigint so 8 bytes. So 40 byte per member info. Oh, wait. JSON overhead. GPT says it should be 77 bytes max.

Group convo can have up to 100 members, but we don't need to ship the requester's info, so 99 member info per convo. That's at max 7,623 byte per convo.

And for group convo count.. Idk, let's be pessimistic and say like, 2,000? 

Then, 15,246,000 bytes... Which would be just 15 MB. Hm. Is that bad? I don't have a sense for this.

Though I will say it still will feel "wrong" somewhat to fetch everything on bootstrap.. I guess just out of principal or some corny shit...


### The query on remove strat isn't all too wonderful either

Say a convo has 100 members. One of them is "aaa". Bro secured the lexicographically smallest possible username in this app, congrats.

Anyway he leaves. Now 99 queries are GUARANTEED to happen.

Hm. It is the edge case. And maybe it's not a huge deal. But still something to think about.

### Oh WHAT THE FUCK

Wait. We can just do this:

```java
record MemberLeft(UserResponse subject, List<UserResponse> membersPreviewPatch) implements EventMessage {
    @Override
    public Type() type() { return Type.MEMBER_LEFT; }
}
```

Where `membersPreviewPatch` is the first 4 members after the removal.

The 4 users that happen to be on this new preview can just omit themselves.

Others can just take the first 3.

This is actually really nice, no per-view/user querying at all..

OK this might be the way to go.

Though, for something like this, the above shape won't do it.

That shape means the `membersPreviewPatch` lives as part of the JSON body in `messages.event`. 

That's unnecessary.

Or we can kinda modify the existing `RealtimeEvent.RemovedFromGroup` type, something like:
```java
record RemovedFromGroup(UUID conversationId, UserResponse subject, List<...> previewPatch) {
    ...
}
```

Hm. But then that kinda breaks the "rely on EventMessage data for updates when we can" approach.

We'd have to first broadcast the `EventMessage.MemberLeft` message insertion via `RealtimeEvent.NewMessage`, THEN broadcast again the `RealtimeEvent.RemovedFromGroup`.

No, that sucks.

If only there was a way to piggyback the patch info along `EventMessage.MemberLeft`, without it necessarily having to live in the JSON body.


# Verdict.

Firstly that +1 fetch idea is really nice.  

And you know what, I think 2 broadcasts are fine here. 

I think I was just bitter about the idea of 2 broadcasts, for no real good reason other than "wahhh I can't find a hacky but also clean way to do both of them at the same time!"
 
But, I'm finding out this is semantically very justifiable.

`EventMessage` is literally just a message of type = 'EVENT'. 

It's not meant to be responsible for UI sync shit.

Whereas `RealtimeEvent`, that's his whole job bro.

So. 2 broadcasts.

1. `RealtimeEvent.NewMessage` broadcast for inserting the `MemberLeft/MemberRemoved` event message.
2. `RealtimeEvent.MembersPreviewPatch` for updating the preview.

```java
record MembersPreviewPatch(UUID conversationId, List<UserResponse> patch, int memberCount) implements RealtimeEvent {
    @Override public Type type() { return Type.MEMBERS_PREVIEW_PATCH; }
}
```

One query instead of loads of per-viewer queries, clean architecture, with a cost of 2 broadcasts.

Sounds like a good deal to me.