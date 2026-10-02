# CacoTalk Software Design Document

## 1. Introduction

CacoTalk is a simple real-time web messenger.
The initial goal is to build a small, simple yet reliable and maintainable messaging application with a Spring Boot backend, React frontend, and PostgreSQL database.

**The project is being developed incrementally. Features and architecture may change as the requirements become clearer.**

## 2. Current Scope

### Functional Requirements

#### Authentication
- Users can create an account.
- Users can log in.
- Authenticated users can log out.

#### Contacts
- Users can search for other users by their username.
- Users can add other users to their contacts list.
- Users can view and manage their list of contacts.

#### Blocks
- Users can block other users.
- Blocking a user will remove the user from the contacts list.
- Users can view and manage their list of blocked users.
- The blocked user is not directly notified of the action.

#### Direct Conversations
- Users can open a direct conversation with another user, unless either user has blocked the other.
- Blocking a user will forbid both parties to send messages in their direct conversation, but the existing history is preserved.

#### Group Conversations
- Users can create a group conversation with other users by selecting initial members from their contacts list.
- Users cannot invite users who have blocked them.
- Blocking a user does not affect existing group conversations.
- Only the group creator can invite or remove members.
- Members can leave the group conversation.
- The group creator cannot leave the conversation, but can close it, after which no new messages can be sent. This cannot be undone.
- After a conversation is closed, every user can decide to remove it from their conversation list.

#### Messages
- Users can send a text message.
- Other participants receive new messages in real time, over a WebSocket (STOMP) connection.
- Older messages can be loaded incrementally.
- Each user tracks their own read position per conversation (`last_read_seq`), used to drive an unread-messages divider and unread badges. This is a personal read-tracking mechanism, not read receipts - other participants cannot see whether or when a given user read a message.
- Message content is encrypted at rest (AES/CTR, random IV per message). See `devlog/015-message-encryption.md` for the threat model and the deliberate choice of CTR over GCM.

### Possible Later Features

- Muting conversations
- Read receipts (i.e., letting other participants see that you've read a message — distinct from the personal read-tracking above, which already exists)
- Presence / online status
- File attachments
- User avatars
- Email auth
- Horizontal scaling of the realtime layer (the current WebSocket broker is in-memory and single-instance, see `docs/api/realtime.md`)

## 3. High-Level Architecture

React frontend\
↓\
HTTP + WebSocket\
↓\
Spring Boot backend\
↓\
PostgreSQL database + Redis

PostgreSQL is used for persistent application data such as user, converstations, messages, etc.\
Redis is used for session storage.

## 4. Initial Domain Model

The current expected core entities are:

- User
- Contact
- Block
- Conversation
- ConversationMember
- Message

The exact schema is still undecided and will be refined during implementation.


## 5. Main Flows

### Register
User submits a username and password\
→ backend validates the submitted data\
→ backend checks that the username is available\
→ backend securely stores the new user's credentials and account data\
→ backend returns a successful registration response\
→ frontend signs them in automatically

### Login
User submits username and password\
→ backend issues an authentication token\
→ frontend stores the authenticated state\
→ frontend loads the user's initial data

### Searching for a User
User enters a username search query\
→ frontend sends the query to the backend\
→ backend searches matching users\
→ backend returns the results\
→ frontend displays matching users

### Adding a Contact
User selects another user through the search result\
→ frontend sends an add-contact request\
→ backend validates the relationship\
→ backend stores the contact entry\
→ frontend updates the contacts list

### Blocking a User
User chooses to block another user\
→ frontend sends a block request\
→ backend stores the block relationship\
→ backend disables direct messaging between the two users\
→ frontend updates the relevant UI state

### Opening a Direct Conversation
User selects another user, or an existing direct conversation from their list\
→ if opened via another user (not an existing conversation), frontend first resolves/creates the direct conversation ID for that user pair (idempotent — creating is a side effect of first resolving, not deferred to the first message)\
→ frontend requests the conversation detail and recent messages by that ID\
→ backend retrieves the conversation and recent messages (block status is reported in the detail response, not independently re-validated here)\
→ frontend displays the conversation

### Creating a Group Conversation
User requests to create a group conversation\
→ Frontend requests the list of invitable users (contacts minus those who blocked the requesting user).\
→ User selects the initial members.\
→ Frontend sends the group creation request\
→ Backend validates the selected members\
→ If some members cannot be invited (not in contacts, or have blocked the user), creation fails and the frontend prompts the user to update the selection and retry.\
→ Backend creates the conversation and membership records.\
→ Frontend opens the newly created group conversation.

### Managing Group Members
Group creator chooses to invite or remove a member\
→ frontend sends the membership update request\
→ backend verifies that the requester is the group creator\
→ backend validates the target user(s) (invitable, or not already a member for invites; not the creator themself, for removal)\
→ backend updates the group membership, persisting a corresponding event message (`MEMBERS_INVITED` / `MEMBER_REMOVED`) into the conversation's history\
→ connected participants receive the updated group state over two channels: the event message (as a `NEW_MESSAGE` realtime event, for chat history) and a dedicated structural realtime event (`MEMBERS_ADDED` / `MEMBER_REMOVED`) that the frontend actually reacts to for updating its membership/sidebar state — see `docs/api/realtime.md`\
→ a removed (or self-leaving) member additionally receives a `REMOVED_FROM_GROUP` event on their own other sessions, so every open tab/device drops the conversation

### Leaving a Group Conversation
Group member chooses to leave\
→ frontend sends a leave request\
→ backend verifies that the user is not the group creator\
→ backend removes the user's membership\
→ frontend removes the conversation from the user's active conversations

### Closing a Group Conversation
Group creator chooses to close the conversation\
→ frontend sends a close request\
→ backend verifies that the requester is the group creator\
→ backend marks the conversation as closed\
→ no further messages can be sent\
→ existing message history remains available

### Sending a Message
User sends a message\
→ frontend generates a client-side idempotency key (`clientId`) and sends it along with the message\
→ backend validates membership and conversation state\
→ backend encrypts and stores the message, atomically allocating its sequence number\
→ backend marks the message as read for the sender (so it never appears unread in the sender's other sessions)\
→ backend broadcasts a `NEW_MESSAGE` realtime event (carrying `clientId`) to connected participants\
→ clients update their UI, reconciling any optimistic/pending local copy of the message by `clientId`

Retrying the same `clientId` is safe and returns the original message rather than creating a duplicate.

### Marking Messages as Read
Frontend tracks the highest message sequence the user has seen in an open conversation (debounced locally)\
→ frontend sends the read position to the backend\
→ backend advances the user's stored read position, taking the greater of the stored and requested value (idempotent)\
→ if the position actually advanced, backend sends a `MARKED_AS_READ` realtime event to the user's own other sessions, so other open tabs/devices move their unread state too

### Loading Older Messages
User scrolls toward the beginning of the loaded message history\
→ frontend requests an older page of messages\
→ backend retrieves messages preceding the current oldest loaded message\
→ frontend prepends the older messages to the conversation history


## 6. Low-Level Architecture

| Area | Current Decision |
|---|---|
| Backend | Spring Boot |
| Frontend | React + TypeScript, Zustand for state |
| Database | PostgreSQL |
| Real-time communication | STOMP over WebSocket, in-memory single-instance broker (see `docs/api/realtime.md`) |
| Authentication | Opaque random session tokens, hashed (SHA-256) and stored in Redis with a sliding TTL; `HttpOnly` + `SameSite=Lax` + `Secure` (outside dev) cookie |
| Concurrency control | Mix of pessimistic locking (Postgres advisory locks, e.g. group-size invariant on invite) and relying on the database's own constraints/row locking for simpler cases; optimistic concurrency (version columns) was considered and deliberately not used — see `devlog/010-concurrency_control.md` |
| Message content at rest | Encrypted (AES/CTR, random IV per message) — see `devlog/015-message-encryption.md` |
| Error handling | Structured `ApiErrorCodes` enum + `{ code, message }` JSON body for all API errors, rather than branching on bare HTTP status; see any `docs/api/*.md` file's "Error Response Shape" section |
| Cross-origin / CSRF | Single allowed frontend origin via CORS; CSRF mitigated structurally (`SameSite=Lax` cookie + no state-changing `GET` endpoints) rather than with CSRF tokens — see `devlog/016-web-security.md` |
| Deployment | Docker Compose |
