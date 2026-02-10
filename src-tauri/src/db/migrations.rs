pub fn get_migrations() -> Vec<&'static str> {
    vec![
        // Migration 1: content_inputs + repurposed_outputs
        r#"
        CREATE TABLE IF NOT EXISTS content_inputs (
            id TEXT PRIMARY KEY,
            source_url TEXT,
            raw_text TEXT NOT NULL,
            title TEXT,
            word_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS repurposed_outputs (
            id TEXT PRIMARY KEY,
            content_input_id TEXT NOT NULL,
            format TEXT NOT NULL,
            output_text TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (content_input_id) REFERENCES content_inputs(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_repurposed_outputs_content_input_id
            ON repurposed_outputs(content_input_id);
        CREATE INDEX IF NOT EXISTS idx_content_inputs_created_at
            ON content_inputs(created_at DESC);
        "#,

        // Migration 2: brand_voice_profiles + brand_voice_samples
        r#"
        CREATE TABLE IF NOT EXISTS brand_voice_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            style_attributes_json TEXT NOT NULL,
            is_default INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS brand_voice_samples (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            sample_text TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (profile_id) REFERENCES brand_voice_profiles(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_brand_voice_samples_profile_id
            ON brand_voice_samples(profile_id);
        "#,

        // Migration 3: usage_records
        r#"
        CREATE TABLE IF NOT EXISTS usage_records (
            id TEXT PRIMARY KEY,
            content_input_id TEXT NOT NULL,
            format_count INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (content_input_id) REFERENCES content_inputs(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_usage_records_created_at
            ON usage_records(created_at);
        "#,

        // Migration 4: app_settings with defaults
        r#"
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        INSERT OR IGNORE INTO app_settings (key, value) VALUES ('monthly_usage_limit', '50');
        INSERT OR IGNORE INTO app_settings (key, value) VALUES ('claude_api_key', '');
        INSERT OR IGNORE INTO app_settings (key, value) VALUES ('default_tone', 'professional');
        INSERT OR IGNORE INTO app_settings (key, value) VALUES ('default_length', 'medium');
        "#,
    ]
}
