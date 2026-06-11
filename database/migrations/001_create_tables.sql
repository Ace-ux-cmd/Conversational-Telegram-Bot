CREATE TABLE IF NOT EXISTS users(
    id BIGINT PRIMARY KEY, --Telegram ID
    username VARCHAR NOT NULL UNIQUE, --Telegram username
    first_name VARCHAR,
    role TEXT CHECK (role IN ('owner', 'admin', 'user')) DEFAULT 'user',
    status TEXT  CHECK (status IN ('active', 'banned')) DEFAULT 'active',
    last_interacted TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups(
    id BIGINT PRIMARY KEY, --Telegram group ID
    name VARCHAR,
    type  TEXT CHECK (type IN ('group', 'supergroup')),
    owner_id BIGINT,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_interacted TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    user_id BIGINT,
    name VARCHAR,
    role TEXT CHECK (role IN ('administrator', 'member', 'creator')),
    joined_at TIMESTAMP, 
    CONSTRAINT pk_group_user PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS leaderboard(
    user_id BIGINT,
    username VARCHAR,
    score INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT pk_user_id PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS ai_requests(
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    chat_type TEXT CHECK (chat_type IN ('private', 'group', 'supergroup')),
    request_type TEXT CHECK (request_type IN ( 'image_gen', 'audio_gen', 'image_read', 'voice_listen')),
    result TEXT CHECK (result IN ('success', 'fail')),
    error_message TEXT, --null for successful queries
    created_at TIMESTAMP DEFAULT NO()
);

CREATE TABLE IF NOT EXISTS bot_health(
    id SERIAL PRIMARY KEY,
    checked_at TIMESTAMP DEFAULT NOW(), --Self Ping
    response_time_ms NUMERIC --DB Ping
);

CREATE TABLE IF NOT EXISTS messages(
    message_id BIGINT, --Telegram message ID
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'model')),
    content TEXT,
    reply_to_message_id BIGINT, --nullable, only populated on model rows
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_usage (
    user_id BIGINT NOT NULL,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_type TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, usage_date, request_type)
);