CREATE TABLE messages (
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    seq BIGINT NOT NULL CHECK (seq > 0),

    sender_id BIGINT REFERENCES users(id),

    type TEXT NOT NULL CHECK (type IN ('USER', 'EVENT')),
    event JSONB,
    content VARCHAR(2000),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_id UUID UNIQUE,

    PRIMARY KEY (conversation_id, seq),

    CONSTRAINT chk_messages_type_fields CHECK (
        (type = 'USER'
            AND sender_id IS NOT NULL
            AND content IS NOT NULL
            AND TRIM(content) <> ''
            AND event IS NULL
            AND client_id IS NOT NULL)
        OR
        (type = 'EVENT'
            AND sender_id IS NULL
            AND event IS NOT NULL
            AND content IS NULL
            AND client_id IS NULL)
    )
);