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
- Other participants receive new messages in real time.
- Older messages can be loaded incrementally.

### Possible Later Features

- Muting conversations
- Read receipts
- Presence / online status
- File attachments
- User avatars
- Email auth

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
User selects another user or an existing direct conversation\
→ frontend requests the conversation and recent messages\
→ backend validates that neither user has blocked the other\
→ backend retrieves the conversation and recent messages\
→ frontend displays the conversation

If no direct conversation exists yet, one may be created when the user sends the first message.

### Creating a Group Conversation
User selects the initial members\
→ frontend sends the group creation request\
→ backend validates the selected members\
→ backend creates the conversation and membership records\
→ frontend opens the newly created group conversation

### Managing Group Members
Group creator chooses to invite or remove a member\
→ frontend sends the membership update request\
→ backend verifies that the requester is the group creator\
→ backend validates the target user\
→ backend updates the group membership\
→ connected participants receive the updated group state

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
→ frontend sends the message to the backend\
→ backend validates membership and conversation state\
→ backend stores the message\
→ backend broadcasts the message to connected participants\
→ clients update their UI

### Loading Older Messages
User scrolls toward the beginning of the loaded message history\
→ frontend requests an older page of messages\
→ backend retrieves messages preceding the current oldest loaded message\
→ frontend prepends the older messages to the conversation history


## 6. Low-Level Architecture

| Area | Current Decision |
|---|---|
| Backend | Spring Boot |
| Frontend | React |
| Database | PostgreSQL |
| Real-time communication | STOMP over WebSocket |
| Authentication | Sessions using Redis |
| Deployment | Docker Compose |
