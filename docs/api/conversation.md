# Conversation API

## DTO Schema

### `ConversationSummary`
```
{
  "id": UUID string,
  "type": "DIRECT" | "GROUP",
  "membersPreview": string[],
  "memberCount": number,
  "groupCreatorId": number | null,
  "lastSeq": number,
  "lastReadSeq": number,
  "createdAt": string,
  "lastMessage": MessageResponse
}
```
- `membersPreview` contains the usernames of at most 3 other members, in lexicographical order. It does not include the authenticated user.
- `memberCount` does not include the authenticated user. e.g., A direct conversation has a `memberCount` of 1, not 2.
- `BLOCKED_BY_ME` takes precedence over `BLOCKED_ME` if both users have blocked each other.
- `groupCreatorId` is only used for group conversations and is `null` for direct conversations.
- `lastReadSeq` is the highest conversation sequence the authenticated user has read.
  - A value of 0 means no messages have been read.
- `lastMessage` uses the standard `MessageResponse` shape defined in the [Message API documentation](./message.md).


## Global Error Codes

#### `401 Unauthorized`

The request does not contain a valid authenticated session.

## Get Conversation Summaries

Fetch lightweight information about conversations that the authenticated user is a member of.

Empty direct conversations are not returned.

### Request
```
GET /conversations/me
```

### Response
#### `200 OK`
Returns an array of `ConversationSummary`.

## Get or Create Direct Conversation

Fetch the direct conversation between the authenticated user and the target user.

If it didn't exist, one is created and returned, making it idempotent.

### Request
```
POST /conversations/direct/{targetId}
```

### Response

#### `200 OK`

Returns a `ConversationSummary`.

#### `400 BAD REQUEST`

Authenticated user attempted to create a direct conversation with themselves.

#### `404 NOT FOUND`

Target user was not found.