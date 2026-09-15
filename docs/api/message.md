# Message API

## `MessageResponse`

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
