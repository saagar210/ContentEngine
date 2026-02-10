use tauri::AppHandle;
use tauri::Manager;

use crate::commands::history::get_history_detail;
use crate::errors::AppError;
use crate::services::pdf_export;

#[tauri::command]
pub async fn export_pdf(app: AppHandle, content_input_id: String) -> Result<String, AppError> {
    let detail = get_history_detail(app.clone(), content_input_id.clone()).await?;

    if detail.outputs.is_empty() {
        return Err(AppError::Validation(
            "No outputs to export".to_string(),
        ));
    }

    // Create output path in app data dir
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::PdfExport(format!("Failed to get app data dir: {}", e)))?;
    let exports_dir = app_dir.join("exports");
    std::fs::create_dir_all(&exports_dir)
        .map_err(|e| AppError::PdfExport(format!("Failed to create exports dir: {}", e)))?;

    let filename = format!(
        "export_{}_{}.pdf",
        &content_input_id[..8],
        chrono::Utc::now().format("%Y%m%d_%H%M%S")
    );
    let output_path = exports_dir.join(&filename);
    let output_path_str = output_path
        .to_str()
        .ok_or_else(|| AppError::PdfExport("Invalid path encoding".to_string()))?;

    pdf_export::export_to_pdf(&detail.input, &detail.outputs, output_path_str)?;

    Ok(output_path_str.to_string())
}
