# 001 - Message Sequencing Strategy

Per-conversation message sequence vs Global message IDs

## Per conversation sequence (Composite with `conversation_id`)

### Pros
- Natural ordering within a conversation, can't get better than this semantic-wise
- Very very easy to calculate "unread message count"
### Cons
- Seq allocation needs heavy concurrency control; Atomically incrementing `conversations.last_seq` for every message
- Meaning in busy conversations that becomes a serialization point
    - I guess this is the case also for `last_message_at`. If I have a problem with this I should also drop that one
- Also just more complex to deal with


## Global increasing ID

### Pros
- Simple af, no custom allocation logic
- uuidv7 can double as a client id 
### Cons
- Metadata leak if I were to use monotonic increasing counters (being able to deduce how many messages were processed in the BE during a timeframe). but i guess a uuidv7 or snowflake would solve this one
- Unread counts can no longer simply be derived


# Decision

Unread message count is nice, but i think this is way too much hassle for just that. Especially considering potential perf downsides, I say not worth it. Speaking of which, I will also drop `last_message_at` for the same reason. uuidv7 it is. i'll have to figure out a different way for unread counts later 