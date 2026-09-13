# Conversation API

#### `401 Unauthorized`

The request does not contain a valid authenticated session.


## Get Conversation Summaries

Fetch lightweight information about conversations that the authenticated user is a member of.

Empty direct conversations are not returned.

### Request

```http
GET /conversations/me
```

### Response

#### `200 OK`

```
[
  {
    "id": string,
    "type": "DIRECT" | "GROUP",
    "membersPreview": string[],
    "memberCount": number,
    "blockStatus": "NONE" | "BLOCKED_BY_ME" | "BLOCKED_ME" | null,
    "groupCreatorId": number | null,
    "isClosed": boolean,
    "lastReadMessageId": number | null,
    "createdAt": string,
    "lastMessage": MessageResponse
  },
]
```
- `membersPreview` contains the usernames of at most 3 other members, in lexicographical order. It does not include the authenticated user.
- `memberCount` does not include the authenticated user. e.g., A direct conversation has a `memberCount` of 1, not 2.
- `blockStatus` is only used for direct conversations and is `null` for group conversations.
- `BLOCKED_BY_ME` takes precedence over `BLOCKED_ME` if both users have blocked each other.
- `groupCreatorId` is only used for group conversations and is `null` for direct conversations.
- `isClosed` is only meaningful for group conversations and is always `false` for direct conversations.
- `lastReadMessageId` is `null` if the authenticated user has not yet read any messages in the conversation.
- `lastMessage` uses the standard `MessageResponse` shape defined in the [Message API documentation](./message.md).