use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OutputFormat {
    TwitterThread,
    Linkedin,
    Instagram,
    Newsletter,
    EmailSequence,
    Summary,
}

impl std::fmt::Display for OutputFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OutputFormat::TwitterThread => write!(f, "twitter_thread"),
            OutputFormat::Linkedin => write!(f, "linkedin"),
            OutputFormat::Instagram => write!(f, "instagram"),
            OutputFormat::Newsletter => write!(f, "newsletter"),
            OutputFormat::EmailSequence => write!(f, "email_sequence"),
            OutputFormat::Summary => write!(f, "summary"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TonePreset {
    Casual,
    Professional,
    Storytelling,
    Educational,
}

impl std::fmt::Display for TonePreset {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TonePreset::Casual => write!(f, "casual"),
            TonePreset::Professional => write!(f, "professional"),
            TonePreset::Storytelling => write!(f, "storytelling"),
            TonePreset::Educational => write!(f, "educational"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LengthPreset {
    Short,
    Medium,
    Long,
}

impl std::fmt::Display for LengthPreset {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LengthPreset::Short => write!(f, "short"),
            LengthPreset::Medium => write!(f, "medium"),
            LengthPreset::Long => write!(f, "long"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformConfig {
    pub tweet_count: Option<u32>,
    pub hashtag_count: Option<u32>,
    pub include_emojis: Option<bool>,
}

impl Default for PlatformConfig {
    fn default() -> Self {
        Self {
            tweet_count: Some(5),
            hashtag_count: Some(3),
            include_emojis: Some(true),
        }
    }
}
