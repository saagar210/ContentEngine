use rusqlite::params;
use tauri::AppHandle;
use tauri::Manager;

use crate::db::DbState;
use crate::errors::AppError;
use crate::models::brand_voice::{AnalyzeVoiceRequest, BrandVoiceProfile, StyleAttributes};
use crate::services::brand_voice as brand_voice_service;
use crate::services::claude_api::ClaudeApiClient;
use crate::services::usage_tracker;

#[tauri::command]
pub async fn get_brand_voices(app: AppHandle) -> Result<Vec<BrandVoiceProfile>, AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    let mut stmt = conn.prepare(
        "SELECT id, name, description, style_attributes_json, is_default, created_at, updated_at FROM brand_voice_profiles ORDER BY is_default DESC, name ASC",
    )?;

    let profiles = stmt
        .query_map([], |row| {
            let style_json: String = row.get(3)?;
            let style: StyleAttributes =
                serde_json::from_str(&style_json).unwrap_or_else(|_| StyleAttributes {
                    tone: String::new(),
                    vocabulary_level: String::new(),
                    sentence_style: String::new(),
                    personality_traits: vec![],
                    signature_phrases: vec![],
                    avoid_phrases: vec![],
                });

            Ok(BrandVoiceProfile {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                style_attributes: style,
                is_default: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(profiles)
}

#[tauri::command]
pub async fn analyze_brand_voice(
    app: AppHandle,
    request: AnalyzeVoiceRequest,
) -> Result<BrandVoiceProfile, AppError> {
    if request.name.trim().is_empty() {
        return Err(AppError::Validation(
            "Brand voice name cannot be empty".to_string(),
        ));
    }

    let db = app.state::<DbState>();
    let api_key = usage_tracker::get_api_key(&db).await?;

    let claude = app.state::<ClaudeApiClient>();
    let style =
        brand_voice_service::analyze_voice_samples(&claude, &api_key, &request.samples).await?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let style_json =
        serde_json::to_string(&style).map_err(|e| AppError::Validation(e.to_string()))?;

    // Check if this is the first profile (make it default)
    let conn = db.conn.lock().await;
    let count: u32 = conn.query_row(
        "SELECT COUNT(*) FROM brand_voice_profiles",
        [],
        |row| row.get(0),
    )?;
    let is_default = count == 0;

    conn.execute(
        "INSERT INTO brand_voice_profiles (id, name, description, style_attributes_json, is_default, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![id, request.name, request.description, style_json, is_default as i32, now, now],
    )?;

    // Save samples
    for sample in &request.samples {
        let sample_id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO brand_voice_samples (id, profile_id, sample_text) VALUES (?1, ?2, ?3)",
            params![sample_id, id, sample],
        )?;
    }

    Ok(BrandVoiceProfile {
        id,
        name: request.name,
        description: request.description,
        style_attributes: style,
        is_default,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn delete_brand_voice(app: AppHandle, id: String) -> Result<(), AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    let affected = conn.execute("DELETE FROM brand_voice_profiles WHERE id = ?1", params![id])?;

    if affected == 0 {
        return Err(AppError::NotFound(format!(
            "Brand voice profile '{}' not found",
            id
        )));
    }

    // Also delete samples (cascade should handle this, but be explicit)
    conn.execute(
        "DELETE FROM brand_voice_samples WHERE profile_id = ?1",
        params![id],
    )?;

    Ok(())
}

#[tauri::command]
pub async fn set_default_voice(app: AppHandle, id: String) -> Result<(), AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    // Verify the profile exists
    let exists: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM brand_voice_profiles WHERE id = ?1",
            params![id],
            |row| row.get::<_, u32>(0),
        )
        .map(|count| count > 0)?;

    if !exists {
        return Err(AppError::NotFound(format!(
            "Brand voice profile '{}' not found",
            id
        )));
    }

    // Clear all defaults
    conn.execute(
        "UPDATE brand_voice_profiles SET is_default = 0",
        [],
    )?;

    // Set the new default
    conn.execute(
        "UPDATE brand_voice_profiles SET is_default = 1, updated_at = ?1 WHERE id = ?2",
        params![chrono::Utc::now().to_rfc3339(), id],
    )?;

    Ok(())
}
