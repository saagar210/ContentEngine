use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),
    #[error("Claude API error: {0}")]
    ClaudeApi(String),
    #[error("URL fetch failed: {0}")]
    UrlFetch(String),
    #[error("PDF export error: {0}")]
    PdfExport(String),
    #[error("Usage limit reached: {used}/{limit} repurposings used this month")]
    UsageLimitExceeded { used: u32, limit: u32 },
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("API key not configured")]
    ApiKeyMissing,
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::ClaudeApi(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Validation(e.to_string())
    }
}
