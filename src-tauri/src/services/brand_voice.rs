use crate::errors::AppError;
use crate::models::brand_voice::StyleAttributes;
use crate::services::claude_api::ClaudeApiClient;

pub async fn analyze_voice_samples(
    client: &ClaudeApiClient,
    api_key: &str,
    samples: &[String],
) -> Result<StyleAttributes, AppError> {
    if samples.is_empty() {
        return Err(AppError::Validation(
            "At least one writing sample is required".to_string(),
        ));
    }

    if samples.len() > 10 {
        return Err(AppError::Validation(
            "Maximum 10 writing samples allowed".to_string(),
        ));
    }

    for (i, sample) in samples.iter().enumerate() {
        if sample.trim().is_empty() {
            return Err(AppError::Validation(format!(
                "Writing sample {} is empty",
                i + 1
            )));
        }
        if sample.len() < 50 {
            return Err(AppError::Validation(format!(
                "Writing sample {} is too short (minimum 50 characters)",
                i + 1
            )));
        }
    }

    client.analyze_voice(api_key, samples).await
}
