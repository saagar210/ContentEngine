use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageInfo {
    pub used: u32,
    pub limit: u32,
    pub resets_at: String,
}
