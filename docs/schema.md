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
- blocker_id
- blocked_id

Constraints:
- Forbid `blocker_id = blocked_id`


## conversations
- id
- type = DIRECT | GROUP
- direct_user_id1 (DIRECT only)
- direct_user_id2 (DIRECT only)
- group_creator_id (GROUP only)
- is_closed (GROUP only)
- last_seq
- last_message_at
- created_at

Constraints / Invariants:
- DIRECT conversations have exactly two rows in `conversation_members`
- `direct_user_id1` and `direct_user_id2` must match those two members
- Direct user IDs are stored in canonical order to allow unique lookup, e.g. `direct_user_id1` < `direct_user_id2`


## conversation_members
- conversation_id
- user_id
- last_read_seq


## messages
- conversation_id
- type = USER | EVENT
- event_type = GROUP_CREATED | USER_INVITED | USER_LEFT | USER_REMOVED | GROUP_CLOSED (EVENT type only)
- event_data (EVENT type only)
- seq
- sender_id (USER type only)
- content (USER type only)
- created_at

Constraints / Invariants:
- `seq` is unique within a conversation
- Messages are ordered by `seq`, not by `created_at`
- `seq` values are assigned monotonically within each conversation
- EVENT messages are created by the system as part of conversation state changes
- `event_data` contains event-specific metadata and is expected to be stored as JSONB.