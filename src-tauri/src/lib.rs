use tauri::Manager;

mod commands;
mod db;
mod errors;
mod models;
mod services;

use db::DbState;
use services::claude_api::ClaudeApiClient;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // Initialize DB
            let app_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_dir)?;
            let db_path = app_dir.join("contentengine.db");

            let conn = rusqlite::Connection::open(&db_path)
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;

            // Enable foreign keys
            conn.execute_batch("PRAGMA foreign_keys = ON;")
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;

            // Run migrations
            db::run_migrations(&conn)
                .map_err(|e| Box::new(std::io::Error::new(std::io::ErrorKind::Other, e.to_string())))?;

            let db_state = DbState::new(conn);
            app.manage(db_state);

            // Initialize Claude API client
            let client = ClaudeApiClient::new();
            app.manage(client);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::content::save_content,
            commands::content::fetch_url,
            commands::repurpose::repurpose_content,
            commands::brand_voice::get_brand_voices,
            commands::brand_voice::analyze_brand_voice,
            commands::brand_voice::delete_brand_voice,
            commands::brand_voice::set_default_voice,
            commands::history::get_history,
            commands::history::get_history_detail,
            commands::history::delete_history_item,
            commands::export::export_pdf,
            commands::usage::get_usage_info,
            commands::settings::get_api_key,
            commands::settings::set_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
