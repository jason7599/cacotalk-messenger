# 010 - Concurrency Control

Realizing many parts of my code are technically concurrency-unsafe.

```java
@Transactional
public UserResponse addContact(long userId, long targetId) {
    ...

    if (userRelationRepository.hasBlocked(userId, targetId)) {
        throw new ApiException(HttpStatus.FORBIDDEN, "Cannot add a blocked user as a contact.");
    }

    // TODO: THIS IS CONCURRENCY-UNSAFE
    userRelationRepository.addContact(userId, targetId);

    ...
}
```

One example out of many.

Mostly boils down to TOCTOU - we check something first, the result say we are safe to do this action, and then we do the action.

And there's a small window where the checked fact might change. 

So far, all these stuff are quite trivial. As in, the worst case scenario isn't that bad.

For example,
- User having a blocked user as his contacts
- Group conversation created with members I shouldn't have been able to invite

But now as I was working on inviting more members in a group convo, another specific scenario arose:
- Group conversation ending up having more members than a specified limit.

Like, that hit kinda different. I mean it's still not like a disaster or anything, but still. 

The idea that this app clearly says "A group can have up to 100 members" then allow that rule to be broken...


## Then I found out about `SELECT ... FOR UPDATE`

Apparently also called "Pessimistic Locking"

Pessimistic in the sense that it assumes conflicts are likely to happen, and therefore preemptively acquiring a lock before doing an action.

Oh I wasn't intending on diving deep into this, but this "Optimistic Locking" is very interesting. I'll come back to pessimistic locking later


## Detour on "Optimistic Locking"

On the contrary is "Optimistic Locking", which assumes conflicts are rare, and takes the "detect and retry" approach. This one is really interesting because **it doesn't use locks at all**. It first reads the record, keeps track of the "version column" (last_modified timestamp for example), and later before committing the change, compares the field to see if someone else made a change before it did. In which case, it rolls back its operation.

That's kinda neat. And I guess I can see that being very easily implemented.

Something like:

```
"SELECT version FROM conversations WHERE id = :convo_id"
int get_version(convo_id);

"UPDATE conversations
SET version = version + 1
WHERE id = :convo_id AND version = :version_key"
int commit(convo_id, version_key);

@Transactional
invite_members(convo_id, user_id, members):
    ver = get_version(convo_id);

    if count_members(convo_id) + members.size > 100:
        throw error;
    
    if !validate_invitable(convo_id, user_id, members):
        throw error;
    
    insert_members(convo_id, members);

    // someone else advanced the version while this function was going
    // rollback, then fail or retry
    if commit(convo_id, ver) == 0:
        throw error; 
```

This is actually very very neat. And of course, the commit error shouldn't be treated like a regular error. Because that is just what happens on 2 concurrent requests. So, ideally, we would want a retry mechanism

```
@Transactional
do_invite_members(convo_id, user_id, members):
    ver = get_version(convo_id);
    
    if count_members ... : throw api_exception;
    if !validate ... : throw api_exception;

    insert_members(convo_id, members);

    if commit(convo_id, ver) == 0:
        throw occ_exception; // forces rollback


invite_members(convo_id, user_id, members):
    repeat (MAX_RETRIES) {
        try {
            do_invite_members(convo_id, user_id, members);
            return;
        } catch (occ_exception) {} // retry
    }
    throw api_exception;
```

Very neat! 

- Suits well if the assumption "conflicts are rare" on this resource really holds.
- Just another lil field is all you need.
- BUT. It is also added complexity, and literally every single write path should respect the version check boilerplate. 
- If any of the code doesn't, the whole thing becomes unreliable.
- Then it's not a db level guarantee the way a lock is.


## Back to Pessimistic Locking

OK... detour over. 

`SELECT ... FOR UPDATE` is standard SQL apparently. (not a Postgres-only thing)

It lock the rows the `SELECT` returns for the duration of the transaction. Only the selected rows. That's nice.

```sql
SELECT member_count FROM conversations WHERE id = :convo_id FOR UPDATE;
```

The lock isn't a separate thing you "acquire" — it's a property of that one statement. No unlock call either, it's released automatically whenever the transaction ends.

### But.. what row do I even lock?

For `inviteMembers`, my first instinct was to lock the `conversations` row itself.

Bad idea. That row also holds `last_seq`, which gets bumped on every single message send, meaning locking it for the duration of an invite would mean sending a message in that conversation has to wait for an unrelated invite to finish.

### Dedicated Lock Table

So instead of locking the whole row just for some specific action.. Why not lock a resource specifically for that action?

```sql
CREATE TABLE group_invite_locks (
    conversation_id UUID PRIMARY KEY REFERENCES conversations(id)
);
```
Then:
```sql
SELECT conversation_id FROM group_invite_locks WHERE conversation_id = :convo_id FOR UPDATE;
```

Now inviting members lock only this tiny lil boi not the whole actual row.

In other words, inviting member requests only contend with other inviting member requests.

Very nice... Exactly how it should be.

#### Downsides about this tho

So obviously, this lock table has to be populated first. Either by automatically creating one along when a group conversation is created, or creating it upon lock request. So.. that is duplication. Feels somewhat icky.


#### Alt Approach? (failed miserably)

I did think about having a "insert on acquire, delete on release" design, but Claude rightfully talked me out of that. 

It would be very fucking nice in practice. I mean like perfect, in theory. Create a lock resource at the beginning of the transaction, then delete at the end. 

But the risk is just way too high. I don't like talking hypotheticals but I kinda have to here. Like imagine, I forget to release/delete a lock somewhere in the code. Or, not even my fault, the server crashes or something. And there's now an orphaned lock. 

THis would be so fucking bad that it literally made me laugh just imagining the consequences. Problem is that it won't be very visible either.. You just find out you can't add members to one specific group conversation. Oh boy.


### This isn't actually new — I'd been doing it all along

Realized while writing this: a plain `UPDATE` *always* takes a row lock, implicitly, no `FOR UPDATE` needed. Think of my monstrous message-insert query:

```sql
WITH next_seq AS (
    UPDATE conversations
    SET last_seq = last_seq + 1
    WHERE id = :conversationId
    RETURNING last_seq
)
INSERT INTO messages (...) SELECT ... FROM next_seq
```

That `UPDATE` locks the conversation row for the duration of the transaction, same mechanism, no name needed for it to already be correct.


### LOL apparently there's even a built-in version of the lock-row trick

Quoting Claude here bcuz I'm lazy

> What it actually is: Postgres's own built-in mechanism for locking something that isn't a row in any table — you give it an arbitrary number (or a pair of 32-bit numbers), and Postgres tracks "is this number currently locked" in its own internal lock table, completely decoupled from your schema. These are called advisory locks specifically because the system doesn't enforce their meaning — it's up to your application to use them consistently; Postgres just gives you a place to register "this number is locked" and makes everyone else wait if they ask for the same number.
>
> Two forms, and the difference matters:
> **pg_advisory_lock(key)** — session-level. Held until you explicitly call pg_advisory_unlock, or the session (connection) ends. Session-level advisory lock requests don't honor transaction semantics — a lock acquired inside a transaction that later rolls back is still held. That's a sharp edge: forget to unlock, and it leaks for the whole connection's lifetime — this is precisely the "insert-then-forget-to-delete" nightmare scenario you and I laughed about earlier tonight, just via a different mechanism. 
> **pg_advisory_xact_lock(key)** — transaction-level. Obtained locks are released when the transaction ends — no explicit unlock possible or needed. This is the one you'd actually want, since it mirrors exactly the lifetime your lock-row's FOR UPDATE already has (tied to the transaction, not something you manage by hand).
>
> Advisory locks are faster, avoid table bloat, and are automatically cleaned up by the server at the end of the session

OK this pg_advisory_xact_lock thing is amazing

### `pg_advisory_xact_lock`

- Transaction level (auto releases on commit/rollback)
- Key shape: 1 64 bit integer (`bigint`) or a pair of 32 bit integers.


## Also. What I came to agreement with. Not all TOCTOUs are equal.


```java
if (userRelationRepository.hasBlocked(userId, targetId)) {
    throw new ApiException(HttpStatus.FORBIDDEN, "Cannot add a blocked user as a contact.");
}

// This is technically a TOCTOU scenario.
// One that I will consciously overlook.
// Tiny possibility, non-catastrophic outcome.
// Scenario: User A adds user B. But this devilish mofo user A with another tab open, blocks user B
// Outcome: User A has user B as contact, despite also having user B blocked.
// Good job dude
userRelationRepository.addContact(userId, targetId);
```

I'll let my comment speak for itself

So, yeah, there's room for subjectivity on what race deserves a robust guard mechanism and what doesn't.

I say adding a blocked user as contact, and inviting users that are not invitable, these can be overlooked.

But a race resulting in a group conversation with more than a 100 users, I won't accept that.

# Decision

So. Will leave the 2 earlier examples as is, but guard inviteMembers with a transaction scoped advisory lock.

```java
@Query(value = """
SELECT pg_advisory_xact_lock(hashtextextended(CAST(:conversationId AS TEXT), 0))
""", nativeQuery = true)
void lockGroupInvite(UUID conversationId);
```

Have to hash it to fit the key shape.

The key space is entirely mine, Postgres doesn't use it for internals or whatever.

But since it's hashed, it is theoretically possible that collisions could happen.

For example if a lock on conversation A is being held, and conversation B's request arrives,

and if (big if) their hash values collide, B has to wait for A, despite them being unrelated. 

But that's fine. Trivial. Done. 