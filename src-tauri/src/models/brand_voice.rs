use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrandVoiceProfile {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub style_attributes: StyleAttributes,
    pub is_default: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleAttributes {
    pub tone: String,
    pub vocabulary_level: String,
    pub sentence_style: String,
    pub personality_traits: Vec<String>,
    pub signature_phrases: Vec<String>,
    pub avoid_phrases: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzeVoiceRequest {
    pub name: String,
    pub description: Option<String>,
    pub samples: Vec<String>,
}
