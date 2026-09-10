CREATE TABLE contacts (
    user_id BIGINT NOT NULL references users(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL references users(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, contact_id),

    CHECK (user_id <> contact_id)
);

CREATE TABLE blocks (
    user_id BIGINT NOT NULL references users(id) ON DELETE CASCADE,
    blocked_id BIGINT NOT NULL references users(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, blocked_id),

    CHECK (user_id <> blocked_id)
);