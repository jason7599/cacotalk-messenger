CREATE TABLE conversation_members (
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    last_read_message_id BIGINT REFERENCES messages(id), -- correctness check, default null

    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_user_id ON conversation_members(user_id);