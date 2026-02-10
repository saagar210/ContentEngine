use rusqlite::params;
use tauri::AppHandle;
use tauri::Manager;

use crate::db::DbState;
use crate::errors::AppError;

#[tauri::command]
pub async fn get_api_key(app: AppHandle) -> Result<String, AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    let key: String = conn
        .query_row(
            "SELECT value FROM app_settings WHERE key = 'claude_api_key'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| AppError::Database(format!("Failed to get API key: {}", e)))?;

    // Return masked version for display (don't expose full key to frontend)
    if key.is_empty() {
        Ok(String::new())
    } else {
        let masked = if key.len() > 8 {
            format!("{}...{}", &key[..4], &key[key.len() - 4..])
        } else {
            "****".to_string()
        };
        Ok(masked)
    }
}

#[tauri::command]
pub async fn set_api_key(app: AppHandle, api_key: String) -> Result<(), AppError> {
    let trimmed = api_key.trim().to_string();

    if !trimmed.is_empty() && !trimmed.starts_with("sk-ant-") {
        return Err(AppError::Validation(
            "Invalid API key format. Anthropic API keys start with 'sk-ant-'".to_string(),
        ));
    }

    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('claude_api_key', ?1)",
        params![trimmed],
    )?;

    Ok(())
}
