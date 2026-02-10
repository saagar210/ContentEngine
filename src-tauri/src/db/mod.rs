pub mod migrations;

use std::sync::Arc;
use tokio::sync::Mutex;

use crate::errors::AppError;

pub struct DbState {
    pub conn: Arc<Mutex<rusqlite::Connection>>,
}

impl DbState {
    pub fn new(conn: rusqlite::Connection) -> Self {
        Self {
            conn: Arc::new(Mutex::new(conn)),
        }
    }
}

pub fn run_migrations(conn: &rusqlite::Connection) -> Result<(), AppError> {
    let migrations = migrations::get_migrations();

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );"
    ).map_err(|e| AppError::Database(format!("Failed to create migrations table: {}", e)))?;

    let applied: Vec<i64> = {
        let mut stmt = conn.prepare("SELECT id FROM schema_migrations ORDER BY id")?;
        let rows = stmt.query_map([], |row| row.get(0))?;
        rows.filter_map(|r| r.ok()).collect()
    };

    for (i, migration) in migrations.iter().enumerate() {
        let migration_id = (i + 1) as i64;
        if !applied.contains(&migration_id) {
            conn.execute_batch(migration)
                .map_err(|e| AppError::Database(format!("Migration {} failed: {}", migration_id, e)))?;
            conn.execute(
                "INSERT INTO schema_migrations (id) VALUES (?1)",
                rusqlite::params![migration_id],
            )?;
        }
    }

    Ok(())
}
