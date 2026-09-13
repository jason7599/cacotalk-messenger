CREATE TABLE conversations (
    id UUID PRIMARY KEY,

    type TEXT NOT NULL CHECK (type IN ('DIRECT', 'GROUP')),

    direct_user_id1 BIGINT REFERENCES users(id),
    direct_user_id2 BIGINT REFERENCES users(id),

    group_creator_id BIGINT REFERENCES users(id),

    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_conversations_type_fields CHECK (
        (type = 'DIRECT'
            AND direct_user_id1 IS NOT NULL
            AND direct_user_id2 IS NOT NULL
            AND direct_user_id1 < direct_user_id2
            AND group_creator_id IS NULL
            AND NOT is_closed)
        OR
        (type = 'GROUP'
            AND group_creator_id IS NOT NULL
            AND direct_user_id1 IS NULL
            AND direct_user_id2 IS NULL)
    )
);

CREATE UNIQUE INDEX uq_conversations_direct_users
    ON conversations(direct_user_id1, direct_user_id2)
    WHERE type = 'DIRECT'
;