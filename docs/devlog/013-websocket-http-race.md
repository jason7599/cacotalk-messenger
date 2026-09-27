# 013 - WebSocket vs Http Race

Now that I introduced a lot of sync events, which I concluded to be necessary due to multi-session / multi-tab users, the HTTP API response's role is getting quite weakened.

For example, `contactsStore#addContact`:
```ts
addContact: async (contactId) => {
    ...
    try {
        const contact = await apiAddContact(contactId);
        get().upsertLocal(contact);
    } finally {
        ...
    }
},
```

That `get().upsertLocal(contact)` part is now technically now redundant.

That's because the `apiAddContact` call in the backend triggers a sync event

```java
@Transactional
public UserResponse addContact(long userId, long targetId) {
    ...
    if (userRelationRepository.addContact(userId, targetId) == 1) {
        realtimeEventPublisher.sendToUser(
                userId,
                new RealtimeEvent.ContactChanged(target, true)
        );
    }

    return target;
}
```

Which, then the frontend's event handler handles:
```ts
function handleContactChanged(subject: UserInfo, added: boolean) {
    if (added) {
        useContactsStore.getState().upsertLocal(subject);
    } else {
        useContactsStore.getState().removeLocal(subject.userId);
    }
}
```

So if anything, listening to both just guarantees one to be redundant and require duplication checks.

Same goes with the message send flow.

```ts
export const useMessageSendStore = create<... {
    const process = async (conversationId: string) => {
        ...
        try {
            ...
            const message = await apiSendMessage(conversationId, ...);
            useActiveConversationStore.getState(),upsertMessage(message);
            ...
            // continue on
            process(conversationId);
        } catch (err) {
        ...
    }
```

This one already is causing a little bug.
I've seen many a time where:
1. Send message "aaa"
2. "aaa" shows up as a pending message
3. A persisted "aaa" message appears
4. The pending "aaa" message goes away

So in this scenario, the WS event arrived first, but the `process` method was still waiting on the API's response. Nasty flicker.

On the flipside, if I only relied on WS events, this could happen:
1. Send message "aaa"
2. Server got it, and successfully handled it, and returns a response (which we ignore)
3. WS event comes late

Here there will be a gap where a message appears to be pending, even if in reality it was persisted.

Which, I guess, is the lesser of 2 evils?

As long as the WS event does arrive eventually, shouldn't be too big a problem.

Of course, the ideal solution would be to wait til whatever arrives first. 

But uh... Is that possible?

```ts
const message = await (apiSendMessage(...) or wsMessageArrivalOrSomethingLikeThat)
useActiveConversationStore.getState().upsertMessage(message);
```

Apparently it is.. Something called `Promise.race`. 

### OK I think there's a simpler solution

Firstly, make `RealtimeEvent.NewMessage` carry also the `clientId` for user messages.

When the FE event handler receives this, it sees if this message is the first in queue in `messageSendStore`. If so, remove it.

Now when `process` finishes its wait for the api call, instead of popping from the queue unconditionally, check if the WS event already took care of it.

Ok this will work.

To be clear, this solves the flicker problem, but doesn't solve the case where the API response arrives later than the WS event.

`process` still will have to wait for the api call, so even if a WS event arrived to confirm a message was sent, the user won't know it went thru until the API responds.

I think that's a fair middle ground.