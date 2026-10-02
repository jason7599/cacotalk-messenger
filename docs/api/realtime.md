# Realtime (WebSocket) API

## Transport

- Protocol: STOMP over WebSocket.
- Endpoint: `/ws` (CORS-gated by `app.frontend-origin`, see `WebSocketConfig`).
- Per-user queue the client subscribes to: `/user/queue/events`. The server resolves "user" via the session-authenticated principal injected by `SessionAuthenticationFilter` (the same session cookie used for the HTTP API — the WebSocket handshake is just another HTTP request to that filter).
- Broker: Spring's in-memory simple broker (`enableSimpleBroker`). Single-instance only — there is no external broker (e.g. RabbitMQ) wired up, so this does not horizontally scale past one backend instance as-is.

Every event on `/user/queue/events` is one of the `RealtimeEvent` variants below, serialized as JSON with a `type` discriminator field.

## Connect-before-bootstrap-buffer-then-live pattern

The frontend's `WsClient` (`features/realtime/wsClient.ts`) connects and subscribes immediately, but buffers every received frame in memory until `goLive(handler)` is called (after bootstrap HTTP calls resolve). Buffered frames are then replayed, in order, into the real handler. This is why `WsClient` has both a "connected" state and a separate "live" state.

## Events (`RealtimeEvent`)

### `NEW_MESSAGE`
```json
{ "type": "NEW_MESSAGE", "message": MessageResponse, "clientId": "uuid-or-absent" }
```

Sent to every member of a conversation whenever a new message (user or event type) is persisted. `clientId` is present (the sender's idempotency key) for user messages so the sending client's own session can reconcile this against its optimistic/pending send; it's absent for system-generated event messages (`GROUP_CREATED`, `MEMBERS_INVITED`, `MEMBER_LEFT`, `MEMBER_REMOVED`, `GROUP_CLOSED`) since those have no originating client.

### `CONTACT_CHANGED`
```json
{ "type": "CONTACT_CHANGED", "subject": UserResponse, "added": boolean }
```
Sent only to the acting user's own other sessions when a contact is added or removed (`added` distinguishes which). Not broadcast to the other party — see `devlog/009-blockstatus-events.md` for why relation-status changes aren't announced to the other side.

### `BLOCK_CHANGED`
```json
{ "type": "BLOCK_CHANGED", "subject": UserResponse, "added": boolean }
```
Same shape and same "self-sync only" reasoning as `CONTACT_CHANGED`, for blocks.

### `REMOVED_FROM_GROUP`
```json
{ "type": "REMOVED_FROM_GROUP", "conversationId": "uuid" }
```
Sent to the leaving/removed user's own other sessions after they leave or are removed from a group, so every open tab/device drops the conversation. Not to be confused with `MEMBER_REMOVED` below, which goes to the *remaining* members.

### `MEMBER_REMOVED`
```json
{
  "type": "MEMBER_REMOVED",
  "conversationId": "uuid",
  "subject": UserResponse,
  "previewPatch": UserResponse[],
  "newMemberCount": number
}
```
Sent to the remaining members (not the removed/leaving user) after a member leaves or is removed. Covers both the voluntary-leave and creator-removed cases.

`previewPatch` is the "+1 over-fetch trick" (see `devlog/012-member-preview-sync.md`): it holds up to `SUMMARY_MEMBER_PREVIEW_COUNT + 1` (currently 4) members, freshly queried after the removal. Since the members-preview shown on a conversation list excludes the *viewing* user, and that set differs per viewer, the server can't precompute one correct preview for everyone — so it sends one oversized list and lets each client self-correct:
- If the viewing user is *not* in `previewPatch`, take the first `SUMMARY_MEMBER_PREVIEW_COUNT` entries and ignore the extra one.
- If the viewing user *is* in `previewPatch`, remove themselves from it; what's left is already the correct size.

`newMemberCount` is the new total member count, already excluding the viewing user (so it's usable as-is for the "N other members" label regardless of who's viewing).

### `MEMBERS_ADDED`
```json
{ "type": "MEMBERS_ADDED", "conversationId": "uuid", "newMembers": UserResponse[] }
```
Sent to all members (including the newly invited ones) after an invite. This is a deliberately redundant structural-sync signal — the same information is technically recoverable by parsing the `MEMBERS_INVITED` event message that was just broadcast via `NEW_MESSAGE`, but the frontend handler is kept "dumb" on purpose: it reacts to typed realtime events for state transitions and treats `EventMessage` content as display-only chat history, never as a trigger for store mutations. See `devlog/011-self-sync-events.md`.

### `GROUP_CLOSED`
```json
{ "type": "GROUP_CLOSED", "conversationId": "uuid" }
```
Sent to all members when the creator closes the group. Same "dedicated structural event, not inferred from the event message" reasoning as `MEMBERS_ADDED`.

### `MARKED_AS_READ`
```json
{ "type": "MARKED_AS_READ", "conversationId": "uuid", "seq": number }
```
Sent only to the acting user's own other sessions when their read position actually advances (via `PATCH /conversations/{id}/read`, including the implicit ack that happens when they send a message). Lets other open tabs/devices move their unread-divider/ack state without re-fetching.