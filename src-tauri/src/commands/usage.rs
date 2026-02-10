use tauri::AppHandle;
use tauri::Manager;

use crate::db::DbState;
use crate::errors::AppError;
use crate::models::usage::UsageInfo;
use crate::services::usage_tracker;

#[tauri::command]
pub async fn get_usage_info(app: AppHandle) -> Result<UsageInfo, AppError> {
    let db = app.state::<DbState>();
    usage_tracker::get_usage_info(&db).await
}
