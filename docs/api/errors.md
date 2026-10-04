# API Errors

Shared reference for how every endpoint in `docs/api/*.md` reports failures. 

Endpoint docs link back here instead of repeating this.

## Response Shape

Every non-2xx response is a JSON body shaped as:
```json
{
  "code": "SOME_ERROR_CODE",
  "message": "Human readable message"
}
```

`code` is one of the values of the backend's `ApiErrorCodes` enum (table below).

**Clients branch on `code`, not on the HTTP status** — the status is informative but not load-bearing, since several unrelated conditions can legitimately share a status (e.g. both `400 GROUP_TOO_SMALL` and `400 GROUP_TOO_BIG` are `400`s, but mean different things), and conversely a few codes are deliberately vague about which of several conditions occurred (e.g. `CANNOT_SEND_MESSAGE` covers not-a-member, blocked, closed, and clientId-collision alike — see `docs/api/message.md#send-message`).

Bean-validation failures (`@Valid` request bodies) return the same shape under the single code `VALIDATION_ERROR`, with `message` set to the first failing field's validation message (not a generic string) - see individual DTO field constraints in each endpoint doc for what can trigger this.


## Error Codes

| Code | HTTP Status | Message | Thrown by |
|---|---|---|---|
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error | Fallback for any unhandled exception |
| `VALIDATION_ERROR` | 400 | Invalid request (overridden with the first failing field's message) | Any `@Valid` request body failure |
| `UNAUTHORIZED` | 401 | Unauthorized | No valid session cookie on an authenticated endpoint |
| `USER_NOT_FOUND` | 404 | User not found | Target user doesn't exist (contacts, blocks, direct conversation resolution, `GET /auth/me`) |
| `USERNAME_TAKEN` | 409 | This username is already taken | Register, with a username already in use |
| `BAD_CREDENTIALS` | 401 | Bad credentials | Login, with an unknown username or wrong password (not distinguished) |
| `CANNOT_CONTACT_SELF` | 400 | Cannot add self as contact | Add Contact, targeting self |
| `CANNOT_CONTACT_BLOCKED_USER` | 403 | Cannot add blocked user as contact | Add Contact, where the authenticated user has blocked the target |
| `CANNOT_BLOCK_SELF` | 400 | Cannot block self | Block User, targeting self |
| `CONVERSATION_NOT_FOUND` | 404 | Conversation not found | Conversation lookup where the row genuinely doesn't exist (or isn't a GROUP, for group-only operations) |
| `MEMBERSHIP_NOT_FOUND` | 404 | Not a member of this conversation | Any membership-gated lookup where the (conversationId, userId) row isn't found — doubles as "conversation doesn't exist" and "not a member," not distinguished |
| `NO_SELF_DIRECT_CONVERSATION` | 400 | Cannot have a direct conversation with self | Resolving a direct conversation with self as target |
| `GROUP_TOO_SMALL` | 400 | A group needs at least 3 initial members | Create Group, with fewer than 2 other members |
| `GROUP_TOO_BIG` | 400 | A group can have at most 100 members | Create Group or Invite Members, pushing the group over 100 members |
| `MEMBERS_NOT_INVITABLE` | 409 | Some members cannot be invited | Create Group or Invite Members, where one or more targets aren't contacts, have blocked the requester, or (for invites) are already members |
| `CREATOR_CANNOT_LEAVE` | 400 | Creator cannot leave the group | Leave Group, called by the group's creator |
| `NOT_GROUP_CREATOR` | 403 | Not the creator of this group | Invite/Remove/Close, called by a non-creator member |
| `CANNOT_REMOVE_SELF` | 400 | Cannot remove self | Remove Group Member, creator targeting self |
| `GROUP_CLOSED` | 409 | Group closed | Invite/Leave, on an already-closed group |
| `CANNOT_SEND_MESSAGE` | 409 | Cannot send a message in this conversation | Send Message — not a member, blocked (DIRECT), closed (GROUP), or a `clientId` collision/probe, all collapsed into this one code |
| `RATE_LIMITED` | 429 | Rate limited | Send Message |

This table is as is defined from `exceptions/ApiErrorCodes.java`.