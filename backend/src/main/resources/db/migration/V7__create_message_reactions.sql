CREATE TABLE message_reactions (
    conversation_id UUID NOT NULL,
    message_seq BIGINT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    reaction TEXT NOT NULL CHECK (reaction IN (
        'BLOOD', 'SKULL', 'CANDLE', 'HEART', 'FIRE'
    )),

    PRIMARY KEY (conversation_id, message_seq, user_id),
    FOREIGN KEY (conversation_id, message_seq) REFERENCES messages(conversation_id, seq)
);