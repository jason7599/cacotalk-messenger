# User Relation API

## DTO Schema

### `UserResponse`
```
{
  "username": string,
  "userId": number
}
```

## Errors

See [API Errors](./errors.md) for the response shape and the full `ApiErrorCodes` table.

#### `401 Unauthorized` — `UNAUTHORIZED`

The request does not contain a valid authenticated session.

## Search Users

Searches for users by username.

The authenticated user is excluded from the results.

Search results are limited to 20 users and are not paginated.

### Request

```
GET /users/search?query={query}
```

The query must contain at least 3 characters after trimming whitespace.

### Response

#### `200 OK`

```json
[
  {
    "userId": 12,
    "username": "alice",
    "relation": "CONTACT"
  },
]
```

`relation` represents the authenticated user's relationship with the returned user.
- `NONE` — The user is neither a contact nor blocked.
- `CONTACT` — The user is already in the authenticated user's contacts.
- `BLOCKED` — The user is blocked by the authenticated user.

The relationship in the opposite direction is not considered.


## Get Contacts

Returns the authenticated user's contacts.

### Request

```
GET /users/me/contacts
```

### Response

#### `200 OK`

```json
[
  {
    "userId": 12,
    "username": "alice"
  },
  {
    "userId": 37,
    "username": "bob"
  }
]
```


## Add Contact

### Request

```
POST /users/me/contacts/{targetId}
```
### Response

#### `200 OK`

```json
{
  "userId": 12,
  "username": "alice"
}
```

The user was successfully added as a contact, or already existed.

A `CONTACT_CHANGED` realtime event (`added: true`) is sent to the authenticated user's own other sessions on an actual insert (not on the already-existed no-op). See [realtime docs](./realtime.md#contact_changed).

#### `400 Bad Request` — `CANNOT_CONTACT_SELF`

User tried to add self as a contact.

#### `403 Forbidden` — `CANNOT_CONTACT_BLOCKED_USER`

The authenticated user has blocked the target user.

> Note: this does not check the reverse direction. If the target has blocked the authenticated user (but not vice versa), this still succeeds — see the TOCTOU note in `devlog/010-concurrency_control.md` for a related edge case on this same code path.

#### `404 Not Found` — `USER_NOT_FOUND`

The target user does not exist.


## Remove Contact

Removes another user from the authenticated user's contacts.

### Request

```
DELETE /users/me/contacts/{targetId}
```

### Response

#### `204 No Content`

The contact was removed successfully.

Same behavior when the relationship does not exist, making it idempotent.

A `CONTACT_CHANGED` realtime event (`added: false`) is sent to the authenticated user's own other sessions on an actual removal (not on the idempotent no-op).


## Get Blocked Users

Returns users blocked by the authenticated user.

### Request

```
GET /users/me/blocks
```

### Response

#### `200 OK`

```json
[
  {
    "userId": 12,
    "username": "alice"
  }
]
```


## Block User

Blocks another user.

Blocking a user also removes the user from the contacts list if exists 

### Request

```
POST /users/me/blocks/{targetId}
```

### Response

#### `200 OK`

```json
{
  "userId": 12,
  "username": "alice"
}
```

The user was successfully blocked, or was already blocked.

If the target was also an existing contact, the contact relationship is removed first (own `CONTACT_CHANGED` realtime event, `added: false`), then the block is added (own `BLOCK_CHANGED` realtime event, `added: true`, only on an actual insert). Both are self-sync events only — the target is never notified either way.

#### `400 Bad Request` — `CANNOT_BLOCK_SELF`

User tried to block self.

#### `404 Not Found` — `USER_NOT_FOUND`

The target user does not exist.


## Unblock User

Removes an existing block.

### Request

```
DELETE /users/me/blocks/{targetId}
```

### Response

#### `204 No Content`

The block was removed successfully, or block didn't exist.

A `BLOCK_CHANGED` realtime event (`added: false`) is sent to the authenticated user's own other sessions on an actual removal.


## Get Invitable Users

Returns the user's contacts, excluding any who have blocked the requester.

Used by the group conversation creation flow to populate the invitable-members list. This is the conversation-agnostic form; see also [the conversation-scoped variant](./conversation.md#get-invitable-users) used when inviting into an *existing* group, which additionally excludes current members.

### Request
```
GET /users/me/invitable
```

### Response

#### `200 OK`

Returns a list of `UserResponse`.