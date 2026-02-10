use rusqlite::params;
use tauri::AppHandle;
use tauri::Manager;

use crate::db::DbState;
use crate::errors::AppError;
use crate::models::brand_voice::StyleAttributes;
use crate::models::content::{RepurposeRequest, RepurposeResponse, RepurposedOutput};
use crate::services::claude_api::ClaudeApiClient;
use crate::services::usage_tracker;

#[tauri::command]
pub async fn repurpose_content(
    app: AppHandle,
    request: RepurposeRequest,
) -> Result<RepurposeResponse, AppError> {
    if request.content.trim().is_empty() {
        return Err(AppError::Validation("Content cannot be empty".to_string()));
    }

    if request.formats.is_empty() {
        return Err(AppError::Validation(
            "At least one output format must be selected".to_string(),
        ));
    }

    let db = app.state::<DbState>();

    // Check usage limit
    usage_tracker::check_usage_limit(&db).await?;

    // Get API key
    let api_key = usage_tracker::get_api_key(&db).await?;

    // Load brand voice if specified
    let voice: Option<StyleAttributes> = if let Some(ref voice_id) = request.voice_id {
        let conn = db.conn.lock().await;
        let style_json: String = conn
            .query_row(
                "SELECT style_attributes_json FROM brand_voice_profiles WHERE id = ?1",
                params![voice_id],
                |row| row.get(0),
            )
            .map_err(|_| AppError::NotFound(format!("Brand voice profile '{}' not found", voice_id)))?;
        let style: StyleAttributes = serde_json::from_str(&style_json)?;
        Some(style)
    } else {
        // Check for default voice
        let conn = db.conn.lock().await;
        let result: Result<String, _> = conn.query_row(
            "SELECT style_attributes_json FROM brand_voice_profiles WHERE is_default = 1",
            [],
            |row| row.get(0),
        );
        match result {
            Ok(style_json) => {
                let style: StyleAttributes = serde_json::from_str(&style_json)?;
                Some(style)
            }
            Err(_) => None,
        }
    };

    let config = request.config.unwrap_or_default();

    // Save content input
    let content_input_id = uuid::Uuid::new_v4().to_string();
    let word_count = request.content.split_whitespace().count() as u32;
    let created_at = chrono::Utc::now().to_rfc3339();

    {
        let conn = db.conn.lock().await;
        conn.execute(
            "INSERT INTO content_inputs (id, source_url, raw_text, title, word_count, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![content_input_id, request.source_url, request.content, request.title, word_count, created_at],
        )?;
    }

    // Call Claude API
    let claude = app.state::<ClaudeApiClient>();
    let results = claude
        .repurpose(
            &api_key,
            &request.content,
            &request.formats,
            &request.tone,
            &request.length,
            voice.as_ref(),
            &config,
        )
        .await?;

    // Save outputs
    let mut outputs = Vec::new();
    {
        let conn = db.conn.lock().await;
        for (format, text) in &results {
            let output_id = uuid::Uuid::new_v4().to_string();
            let output_created_at = chrono::Utc::now().to_rfc3339();
            let format_str = format.to_string();

            conn.execute(
                "INSERT INTO repurposed_outputs (id, content_input_id, format, output_text, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![output_id, content_input_id, format_str, text, output_created_at],
            )?;

            outputs.push(RepurposedOutput {
                id: output_id,
                content_input_id: content_input_id.clone(),
                format: format_str,
                output_text: text.clone(),
                created_at: output_created_at,
            });
        }
    }

    // Record usage
    let format_count = results.len() as u32;
    usage_tracker::record_usage(&db, &content_input_id, format_count).await?;

    Ok(RepurposeResponse {
        content_input_id,
        outputs,
    })
}
