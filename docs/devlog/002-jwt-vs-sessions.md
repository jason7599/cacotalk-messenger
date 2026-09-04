# 002 - JWT vs Server-side Sessions

I need to decide whether auth should use:

* JWTs
* traditional server-side sessions
* some cursed hybrid bs

The JWT is basically just:

```
request
→ verify JWT
→ get user ID
→ query current user/business data
```

Business data still lives in the database where they belong anyway.

## Decision

Using **thin JWTs**.

If I used traditional sessions, the flow would be something like:

```
request
→ session ID
→ look up session db
→ ok you are user 5
→ query whatever actual data I need
```

With the current JWT setup:
```
request
→ verify token
→ oh hi user 5
→ query whatever actual data I need
```

So adding sessions would just add another lookup and another piece of state. and literally no benefit, for now.

## What I maybe lose by not having sessions

- **Only allow 1 device login**
- Log out everywhere

But i don't think i need that at this point. If I do, the fix won't be too hard to add.