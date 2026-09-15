# Message API

## DTO Schema

### `MessageResponse`

```
{
  "conversationId": UUID string,
  "seq": number,
  "senderId": number | null,
  "senderName": string | null,
  "type": MessageType,
  "eventType": EventMessageType | null,
  "eventData": json object | null,
  "content": string | null,
  "createdAt": string,
}
```
- `eventType` and `eventData` are only populated for event messages.
  - `eventData` might still be null depending on the `eventType`.
- `content` is only populated for user messages.

### `MessageType`
```
USER | EVENT
```

### `EventMessageType`
```
GROUP_CREATED | USER_INVITED | USER_LEFT | USER_REMOVED | GROUP_CLOSED
```

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