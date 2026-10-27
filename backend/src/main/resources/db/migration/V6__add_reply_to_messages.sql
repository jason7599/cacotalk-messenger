ALTER TABLE messages
    ADD COLUMN reply_to_seq BIGINT,
    ADD CONSTRAINT messages_reply_to_fk
        FOREIGN KEY (conversation_id, reply_to_seq)
        REFERENCES messages(conversation_id, seq),
    ADD CONSTRAINT chk_messages_reply_to
        CHECK (reply_to_seq IS NULL OR (type = 'USER' AND reply_to_seq < seq));