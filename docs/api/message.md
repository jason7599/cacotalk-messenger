# Message API

### `MessageResponse`

```text
{
  "id": number,
  "conversationId": UUID,
  "senderId": number | null,
  "type": MessageType,
  "eventType": EventMessageType | null,
  "eventData": object | null,
  "content": string | null,
  "createdAt": string
}
```
