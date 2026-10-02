## users
- id
- username
- password_hash
- created_at

Constraints:
- `username` is unique


## contacts
- user_id
- contact_id

Constraints:
- Forbid `user_id = contact_id`


## blocks
- user_id
- blocked_id

Constraints:
- Forbid `user_id = blocked_id`


## conversations
- id
- type = DIRECT | GROUP
- direct_user_id1 (DIRECT only)
- direct_user_id2 (DIRECT only)
- group_creator_id (GROUP only)
- is_closed (GROUP only)
- last_seq
- created_at

Constraints / Invariants:
- `last_seq` is the highest sequence number allocated in the conversation.
- `last_seq` >= 0, and `last_seq` of 0 means an empty conversation.
- DIRECT conversations have exactly two rows in `conversation_members`
- `direct_user_id1` and `direct_user_id2` must match those two members
- Direct user IDs are stored in canonical order to allow unique lookup, e.g. `direct_user_id1` < `direct_user_id2`


## conversation_members
- conversation_id
- user_id
- last_read_seq

Constraints / Invariants:
- `last_read_seq` >= 0 and `last_read_seq` <= `conversations.last_seq`.
- When a user is newly added to a conversation, `last_read_seq` is initialized to the conversation's `last_seq`.


## messages
- conversation_id
- seq
- type = USER | EVENT
- event (EVENT type only)
- sender_id (USER type only)
- content (USER type only)
- created_at
- client_id

Constraints / Invariants:
- `(conversation_id, seq)` uniquely identifies a message.
- `seq` > 0, meaning the first message has a `seq` value of 1.
- EVENT messages are created by the system as part of conversation state changes.
- `event` contains event-specific metadata and is stored as JSONB.
- `content` is stored as `BYTEA`, not plaintext. It holds a 16-byte random IV followed by AES/CTR ciphertext (see `devlog/015-message-encryption.md`). The column keeps the name `content` rather than something like `encrypted_content` — the `BYTEA` type already signals that it isn't raw text, and the type itself was deliberately chosen (over a Base64-encoded `TEXT` column) to make it a compile error to pass a plain `String` where ciphertext bytes are expected.
- `client_id` is unique (nullable — only set for `USER` type messages) and is the idempotency key used to dedupe retried sends.
- A `CHECK` constraint enforces the two type shapes: `USER` requires `sender_id`, `content`, `client_id` non-null and `event` null; `EVENT` requires the opposite (`event` non-null, the other three null).