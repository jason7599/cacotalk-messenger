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
- event_type = GROUP_CREATED | USER_INVITED | USER_LEFT | USER_REMOVED | GROUP_CLOSED (EVENT type only)
- event_data (EVENT type only)
- sender_id (USER type only)
- content (USER type only)
- created_at
- client_id

Constraints / Invariants:
- `(conversation_id, seq)` uniquely identifies a message.
- `seq` > 0, meaning the first message has `seq` value of 1.
- EVENT messages are created by the system as part of conversation state changes
- `event_data` contains event-specific metadata and is expected to be stored as JSONB.