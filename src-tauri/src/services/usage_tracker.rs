use chrono::{Datelike, Utc};
use rusqlite::params;

use crate::db::DbState;
use crate::errors::AppError;
use crate::models::usage::UsageInfo;

pub async fn get_usage_info(db: &DbState) -> Result<UsageInfo, AppError> {
    let conn = db.conn.lock().await;

    let now = Utc::now();
    let month_start = format!("{}-{:02}-01 00:00:00", now.year(), now.month());

    let used: u32 = conn
        .query_row(
            "SELECT COALESCE(SUM(format_count), 0) FROM usage_records WHERE created_at >= ?1",
            params![month_start],
            |row| row.get(0),
        )
        .map_err(|e| AppError::Database(format!("Failed to query usage: {}", e)))?;

    let limit: u32 = conn
        .query_row(
            "SELECT CAST(value AS INTEGER) FROM app_settings WHERE key = 'monthly_usage_limit'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(50);

    // Calculate reset date (first of next month)
    let next_month = if now.month() == 12 {
        format!("{}-01-01 00:00:00", now.year() + 1)
    } else {
        format!("{}-{:02}-01 00:00:00", now.year(), now.month() + 1)
    };

    Ok(UsageInfo {
        used,
        limit,
        resets_at: next_month,
    })
}

pub async fn check_usage_limit(db: &DbState) -> Result<(), AppError> {
    let info = get_usage_info(db).await?;
    if info.used >= info.limit {
        return Err(AppError::UsageLimitExceeded {
            used: info.used,
            limit: info.limit,
        });
    }
    Ok(())
}

pub async fn record_usage(
    db: &DbState,
    content_input_id: &str,
    format_count: u32,
) -> Result<(), AppError> {
    let conn = db.conn.lock().await;
    let id = uuid::Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO usage_records (id, content_input_id, format_count) VALUES (?1, ?2, ?3)",
        params![id, content_input_id, format_count],
    )?;

    Ok(())
}

pub async fn get_api_key(db: &DbState) -> Result<String, AppError> {
    let conn = db.conn.lock().await;
    let key: String = conn
        .query_row(
            "SELECT value FROM app_settings WHERE key = 'claude_api_key'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| AppError::Database(format!("Failed to get API key: {}", e)))?;

    if key.is_empty() {
        return Err(AppError::ApiKeyMissing);
    }

    Ok(key)
}
