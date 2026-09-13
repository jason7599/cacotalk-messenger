CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id BIGINT REFERENCES users(id),

    type VARCHAR(2000) NOT NULL CHECK (type IN ('USER', 'EVENT')),
    event_type TEXT CHECK (
        event_type IN ('GROUP_CREATED',
                       'USER_INVITED',
                       'USER_LEFT',
                       'USER_REMOVED',
                       'GROUP_CLOSED')
    ),
    event_data JSONB,
    content TEXT, -- def should be length limit

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id UUID UNIQUE,

    CONSTRAINT chk_messages_type_fields CHECK (
        (type = 'USER'
            AND sender_id IS NOT NULL
            AND content IS NOT NULL
            AND TRIM(content) <> ''
            AND event_type IS NULL
            AND event_data IS NULL
            AND client_id IS NOT NULL)
        OR
        (type = 'EVENT'
            AND sender_id IS NULL
            AND event_type IS NOT NULL
            -- event_data can be null depending on event_type
            AND content IS NULL
            AND client_id IS NULL)
    )
);

CREATE INDEX idx_messages_conversation_id_id ON messages(conversation_id, id);