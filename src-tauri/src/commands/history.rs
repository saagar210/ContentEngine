use rusqlite::params;
use tauri::AppHandle;
use tauri::Manager;

use crate::db::DbState;
use crate::errors::AppError;
use crate::models::content::{ContentInput, HistoryDetail, HistoryItem, HistoryPage, RepurposedOutput};

#[tauri::command]
pub async fn get_history(
    app: AppHandle,
    page: Option<u32>,
    page_size: Option<u32>,
) -> Result<HistoryPage, AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    let page = page.unwrap_or(1).max(1);
    let page_size = page_size.unwrap_or(20).min(100);
    let offset = (page - 1) * page_size;

    let total: u32 = conn.query_row(
        "SELECT COUNT(*) FROM content_inputs",
        [],
        |row| row.get(0),
    )?;

    let mut stmt = conn.prepare(
        "SELECT ci.id, ci.title, ci.word_count, ci.created_at, \
         (SELECT COUNT(*) FROM repurposed_outputs WHERE content_input_id = ci.id) as format_count \
         FROM content_inputs ci \
         ORDER BY ci.created_at DESC \
         LIMIT ?1 OFFSET ?2",
    )?;

    let items = stmt
        .query_map(params![page_size, offset], |row| {
            Ok(HistoryItem {
                id: row.get(0)?,
                title: row.get(1)?,
                word_count: row.get(2)?,
                created_at: row.get(3)?,
                format_count: row.get(4)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(HistoryPage {
        items,
        total,
        page,
        page_size,
    })
}

#[tauri::command]
pub async fn get_history_detail(app: AppHandle, id: String) -> Result<HistoryDetail, AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    let input = conn
        .query_row(
            "SELECT id, source_url, raw_text, title, word_count, created_at FROM content_inputs WHERE id = ?1",
            params![id],
            |row| {
                Ok(ContentInput {
                    id: row.get(0)?,
                    source_url: row.get(1)?,
                    raw_text: row.get(2)?,
                    title: row.get(3)?,
                    word_count: row.get(4)?,
                    created_at: row.get(5)?,
                })
            },
        )
        .map_err(|_| AppError::NotFound(format!("Content input '{}' not found", id)))?;

    let mut stmt = conn.prepare(
        "SELECT id, content_input_id, format, output_text, created_at FROM repurposed_outputs WHERE content_input_id = ?1 ORDER BY created_at ASC",
    )?;

    let outputs = stmt
        .query_map(params![id], |row| {
            Ok(RepurposedOutput {
                id: row.get(0)?,
                content_input_id: row.get(1)?,
                format: row.get(2)?,
                output_text: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(HistoryDetail { input, outputs })
}

#[tauri::command]
pub async fn delete_history_item(app: AppHandle, id: String) -> Result<(), AppError> {
    let db = app.state::<DbState>();
    let conn = db.conn.lock().await;

    // Delete outputs first (in case CASCADE isn't enabled)
    conn.execute(
        "DELETE FROM repurposed_outputs WHERE content_input_id = ?1",
        params![id],
    )?;

    // Delete usage records
    conn.execute(
        "DELETE FROM usage_records WHERE content_input_id = ?1",
        params![id],
    )?;

    // Delete the input
    let affected = conn.execute("DELETE FROM content_inputs WHERE id = ?1", params![id])?;

    if affected == 0 {
        return Err(AppError::NotFound(format!(
            "Content input '{}' not found",
            id
        )));
    }

    Ok(())
}
