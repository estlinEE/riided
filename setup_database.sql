-- Copy and paste this SQL into your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS clothing_items (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    color VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    home VARCHAR(50) NOT NULL,
    image_data TEXT NOT NULL,
    uploader VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL DEFAULT 'default',
    profile_picture TEXT,
    theme VARCHAR(50) DEFAULT 'banana',
    language VARCHAR(10) DEFAULT 'en',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO user_profiles (user_id, theme, language) 
VALUES ('default', 'banana', 'en') 
ON CONFLICT (user_id) DO NOTHING;