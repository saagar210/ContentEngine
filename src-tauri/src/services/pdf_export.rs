use printpdf::*;
use std::collections::BTreeMap;

use crate::errors::AppError;
use crate::models::content::{ContentInput, RepurposedOutput};

pub fn export_to_pdf(
    input: &ContentInput,
    outputs: &[RepurposedOutput],
    output_path: &str,
) -> Result<String, AppError> {
    let title = input.title.as_deref().unwrap_or("Untitled Content");

    let mut html = String::new();
    html.push_str("<html><body>");
    html.push_str(&format!("<h1>{}</h1>", escape_html(title)));
    html.push_str(&format!(
        "<p><small>Word Count: {} | Created: {}</small></p>",
        input.word_count, input.created_at
    ));

    if let Some(ref url) = input.source_url {
        html.push_str(&format!("<p><small>Source: {}</small></p>", escape_html(url)));
    }

    html.push_str("<hr/>");

    for output in outputs {
        let format_label = format_display_name(&output.format);
        html.push_str(&format!("<h2>{}</h2>", escape_html(&format_label)));

        let text = &output.output_text;
        for line in text.split('\n') {
            if line.trim().is_empty() {
                html.push_str("<br/>");
            } else {
                html.push_str(&format!("<p>{}</p>", escape_html(line)));
            }
        }

        html.push_str("<hr/>");
    }

    html.push_str("</body></html>");

    let options = GeneratePdfOptions {
        page_width: Some(210.0),
        page_height: Some(297.0),
        margin_top: Some(20.0),
        margin_right: Some(15.0),
        margin_bottom: Some(20.0),
        margin_left: Some(15.0),
        ..Default::default()
    };

    let mut warnings = Vec::new();
    let doc = PdfDocument::from_html(
        &html,
        &BTreeMap::new(),
        &BTreeMap::new(),
        &options,
        &mut warnings,
    )
    .map_err(|e| AppError::PdfExport(format!("Failed to generate PDF: {}", e)))?;

    let save_opts = PdfSaveOptions::default();
    let bytes = doc.save(&save_opts, &mut warnings);

    std::fs::write(output_path, &bytes)
        .map_err(|e| AppError::PdfExport(format!("Failed to write PDF file: {}", e)))?;

    Ok(output_path.to_string())
}

fn format_display_name(format: &str) -> String {
    match format {
        "twitter_thread" => "Twitter/X Thread".to_string(),
        "linkedin" => "LinkedIn Post".to_string(),
        "instagram" => "Instagram Caption".to_string(),
        "newsletter" => "Newsletter".to_string(),
        "email_sequence" => "Email Sequence".to_string(),
        "summary" => "Summary".to_string(),
        other => other.to_string(),
    }
}

fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}
