use rusqlite::params;
use tauri::AppHandle;
use tauri::Manager;

use crate::db::DbState;
use crate::errors::AppError;
use crate::models::content::{ContentInput, FetchedContent};
use crate::services::url_fetcher;

#[tauri::command]
pub async fn save_content(
    app: AppHandle,
    text: String,
    source_url: Option<String>,
    title: Option<String>,
) -> Result<ContentInput, AppError> {
    if text.trim().is_empty() {
        return Err(AppError::Validation("Content text cannot be empty".to_string()));
    }

    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    let id = uuid::Uuid::new_v4().to_string();
    let word_count = text.split_whitespace().count() as u32;
    let created_at = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO content_inputs (id, source_url, raw_text, title, word_count, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, source_url, text, title, word_count, created_at],
    )?;

    Ok(ContentInput {
        id,
        source_url,
        raw_text: text,
        title,
        word_count,
        created_at,
    })
}

#[tauri::command]
pub async fn fetch_url(url: String) -> Result<FetchedContent, AppError> {
    if url.trim().is_empty() {
        return Err(AppError::Validation("URL cannot be empty".to_string()));
    }

    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(AppError::Validation("URL must start with http:// or https://".to_string()));
    }

    url_fetcher::fetch_url(&url).await
}
