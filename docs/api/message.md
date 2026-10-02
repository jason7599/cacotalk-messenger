# Message API

## DTO Schema

### `MessageResponse`

```
{
  "conversationId": UUID string,
  "seq": number,
  "senderId": number | null,
  "senderName": string | null,
  "type": "USER" | "EVENT",
  "event": EventData | null,
  "content": string | null,
  "createdAt": string
}
```
- `event` is populated only for event messages.
- `senderId`, `senderName`, and `content` is only populated for user messages.
- `content` is always plaintext in the API response. Message content is stored encrypted at rest (AES/CTR, random IV per message, see `devlog/015-message-encryption.md`) but the backend decrypts it before serializing any `MessageResponse` — this is purely a storage-layer concern and not visible at the API boundary.

### `EventData`

`EventData` is a discriminated union, where the shape is determined by the `type` field.

```
EventData =
  | GroupCreatedEvent
  | MembersInvitedEvent
  | MemberLeftEvent
  | MemberRemovedEvent
  | GroupClosedEvent
```

#### `GroupCreatedEvent`
```
{
  "type": "GROUP_CREATED",
  "initMembers": UserResponse[]
}
```
Contains a snapshot of the members initially invited when the group was created.

This is always the first message of a GROUP conversation.

#### `MembersInvitedEvent`
```
{
  "type": "MEMBERS_INVITED",
  "members": UserResponse[]
}
```
Describes which users were invited by the group creator.

#### `MemberLeftEvent`
```
{
  "type": "MEMBER_LEFT",
  "subject": UserResponse
}
```
Describes which user voluntarily left the group conversation.

#### `MemberRemovedEvent`
```
{
  "type": "MEMBER_REMOVED",
  "subject": UserResponse
}
```
Describes which user has been removed from the group by the group creator.

#### `GroupClosedEvent`
```
{
  "type": "GROUP_CLOSED"
}
```
Indicates that the group creator closed the conversation.

As this action cannot be undone, it is always the last message in a closed group conversation.

### `MessagePage`
```
{
  "messages": MessageResponse[],
  "hasOlder": boolean
}
```
- `messages` contains the returned messages in conversation order, i.e., ascending `seq`.
- `hasOlder` is technically redundant with the current `seq` strategy, as it can be derived from whether `messages` isn't empty and the first message doesn't have a `seq` of 1, but keeping it for now.


## Errors

See [API Errors](./errors.md) for the response shape and the full `ApiErrorCodes` table.

#### `401 Unauthorized` — `UNAUTHORIZED`

The request does not contain a valid authenticated session.


## Initial Message Load

Loads messages centered around the user's unread boundary.

The initial load attempts to include the user's unread messages, along with a limited amount of older context.

The result is subject to a server-defined maximum size (currently 500).

If the number of messages from the unread boundary onward exceeds that limit, older messages will be omitted.

This means the first messages in the result may not begin near the unread boundary, but assures the last message will be the newest in the conversation, in a continuous range.

### Request
```
GET /conversations/{conversationId}/messages
```

### Response
#### `200 OK`
Returns a `MessagePage` object.

#### `404 Not Found` — `MEMBERSHIP_NOT_FOUND`
The authenticated user is not a member of the conversation, or it doesn't exist. (Not `403` — membership lookup for reads is a combined existence+membership check and always reports this code; see the same note in the [conversation docs](./conversation.md#get-conversation-detail).)


## Load Older Messages

Loads messages older than the specified sequence.

### Request
```
GET /conversations/{conversationId}/messages?before={before}
```

- `before` is exclusive.

### Response
#### `200 OK`
Returns a `MessagePage` object.

#### `404 Not Found` — `MEMBERSHIP_NOT_FOUND`
Same as Initial Message Load above.


## Send Message

Sends a user message in a conversation.

The authenticated user must be a member of the conversation and must currently be allowed to send messages. This means:
- For DIRECT conversations, the other user has not blocked the user or vice versa.
- For GROUP conversations, the conversation is not closed.

This method is idempotent, and will not create additional messages on retries (matched by `clientId`).

Sending a message also implicitly marks it as read for the sender (see [Mark As Read](./conversation.md#mark-as-read)) — this is why your own sent messages never show up as unread in your other open sessions.

### Request
```
POST /conversations/{conversationId}/messages
```

#### Body
```
{
  "content": string,
  "clientId": UUID string
}
```
- `content` must contain between 1 and 2000 characters after trimming.
- `clientId` should be generated per new message, and reused only when retrying the exact same attempt.

### Response

#### `201 Created`
Returns the created (or already existing, if this was a retry with a previously-used `clientId`) `MessageResponse` object. On an actual new send, a `NEW_MESSAGE` realtime event (carrying this `clientId`) is also broadcast to all members — see [realtime docs](./realtime.md#new_message).

#### `400 Bad Request` — `VALIDATION_ERROR`
`content` is invalid (empty after trimming, or over 2000 characters).

#### `409 Conflict` — `CANNOT_SEND_MESSAGE`
One combined error code covers several distinct conditions, all collapsed into the same response on purpose so a client (or an attacker probing `clientId`s) can't distinguish them:
- The authenticated user is not a member of the conversation.
- The conversation is a closed GROUP.
- The conversation is a DIRECT conversation and either party has blocked the other.
- `clientId` already belongs to a different sender or a different conversation (genuine UUID collision, or a malicious probe for an existing `clientId`) — logged server-side as a warning, but the client gets the same `CANNOT_SEND_MESSAGE` response as the ordinary cases above.
