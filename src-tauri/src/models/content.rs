use serde::{Deserialize, Serialize};

use super::platform::OutputFormat;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentInput {
    pub id: String,
    pub source_url: Option<String>,
    pub raw_text: String,
    pub title: Option<String>,
    pub word_count: u32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPoints {
    pub main_thesis: String,
    pub key_arguments: Vec<String>,
    pub supporting_data: Vec<String>,
    pub target_audience: String,
    pub emotional_tone: String,
    pub call_to_action: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepurposedOutput {
    pub id: String,
    pub content_input_id: String,
    pub format: String,
    pub output_text: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryPage {
    pub items: Vec<HistoryItem>,
    pub total: u32,
    pub page: u32,
    pub page_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryItem {
    pub id: String,
    pub title: Option<String>,
    pub word_count: u32,
    pub format_count: u32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryDetail {
    pub input: ContentInput,
    pub outputs: Vec<RepurposedOutput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FetchedContent {
    pub title: Option<String>,
    pub text: String,
    pub word_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepurposeRequest {
    pub content: String,
    pub source_url: Option<String>,
    pub title: Option<String>,
    pub formats: Vec<OutputFormat>,
    pub tone: super::platform::TonePreset,
    pub length: super::platform::LengthPreset,
    pub voice_id: Option<String>,
    pub config: Option<super::platform::PlatformConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepurposeResponse {
    pub content_input_id: String,
    pub outputs: Vec<RepurposedOutput>,
}
