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
  "createdAt": string,
}
```
- `event` is populated only for event messages.
- `senderId`, `senderName`, and `content` is only populated for user messages.

### `EventData`

`EventData` is a discriminated union, where the shape is determined by the `type` field.

```
EventData =
  | GroupCreatedEvent
  | UserInvitedEvent
  | UserLeftEvent
  | UserRemovedEvent
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

#### `UserInvitedEvent`
```
{
  "type": "USER_INVITED",
  "subject": UserResponse
}
```
Describes which user was invited by the group creator.

#### `UserLeftEvent`
```
{
  "type": "USER_LEFT",
  "subject": UserResponse
}
```
Describes which user voluntarily left the group conversation.

#### `UserRemovedEvent`
```
{
  "type": "USER_REMOVED",
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
- `hasOlder` is techinically redundant with the current `seq` strategy, as it can be derived from whether the `messages` isn't empty and the first message doesn't have a `seq` of 1, but keeping it for now.


## Global Error Codes

#### `401 Unauthorized`

The request does not contain a valid authenticated session.

#### `403 Forbidden`

The authenticated user is not a member of the conversation.


## Initial Message Load

Loads messages centered around the user's unread boundary.

The initial load attempts to include the user's unread messages, along with a limited amount of older context.

The result is subject to a server-defined maximum size.

If the number of messages from the unread boundary onward exceed that limit, older messages will be omitted.

This means the first messages in the result may not begin near the unread boundary, but assures the last message will be the newest in the conversation, in a continuous range.

### Request
```
GET /conversations/{conversationId}/messages
```

### Response
#### `200 OK`
Returns a `MessagePage` object.


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


## Send Message

Sends a user message in a conversation.

The authenticated user must be a member of the conversation and must currently be allowed to send messages. This means:
- For DIRECT conversations, the other user has not blocked the user or vice versa.
- For GROUP conversations, the conversation is not closed.

This method is idempotent, and will not create additional messages on retries.

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

#### `201 CREATED`
Returns the created (or already existing) `MessageResponse` object.

#### `400 BAD REQUEST`
`content` is invalid.

#### `403 FORBIDDEN`
User is not a member of the conversation, or is not currently available to send messages - the response does not distinguish which.

#### `409 CONFLICT`
`clientId` already belongs to a different sender or conversation.
It should be noted that this is not the regular conflict flow. This would only happen in genuine UUID collision or malicious attempts.