use scraper::{Html, Selector};

use crate::errors::AppError;
use crate::models::content::FetchedContent;

pub async fn fetch_url(url: &str) -> Result<FetchedContent, AppError> {
    let client = reqwest::Client::builder()
        .user_agent("ContentEngine/1.0")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| AppError::UrlFetch(format!("Failed to create HTTP client: {}", e)))?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| AppError::UrlFetch(format!("Failed to fetch URL: {}", e)))?;

    let status = response.status();
    if !status.is_success() {
        return Err(AppError::UrlFetch(format!(
            "URL returned status {}",
            status
        )));
    }

    let html = response
        .text()
        .await
        .map_err(|e| AppError::UrlFetch(format!("Failed to read response body: {}", e)))?;

    let document = Html::parse_document(&html);

    // Extract title
    let title = extract_title(&document);

    // Extract main text content
    let text = extract_text_content(&document);

    if text.trim().is_empty() {
        return Err(AppError::UrlFetch(
            "No text content found at URL".to_string(),
        ));
    }

    let word_count = text.split_whitespace().count() as u32;

    Ok(FetchedContent {
        title,
        text,
        word_count,
    })
}

fn extract_title(document: &Html) -> Option<String> {
    // Try og:title first
    if let Ok(selector) = Selector::parse(r#"meta[property="og:title"]"#) {
        if let Some(el) = document.select(&selector).next() {
            if let Some(content) = el.value().attr("content") {
                let title = content.trim().to_string();
                if !title.is_empty() {
                    return Some(title);
                }
            }
        }
    }

    // Fall back to <title> tag
    if let Ok(selector) = Selector::parse("title") {
        if let Some(el) = document.select(&selector).next() {
            let title = el.text().collect::<String>().trim().to_string();
            if !title.is_empty() {
                return Some(title);
            }
        }
    }

    None
}

fn extract_text_content(document: &Html) -> String {
    // Selectors for elements to remove
    let remove_selectors = [
        "nav", "footer", "header", "aside", "script", "style", "noscript",
        ".sidebar", ".navigation", ".footer", ".header", ".nav", ".menu",
        ".comments", ".comment", ".social-share", ".advertisement", ".ad",
    ];

    // Try to find article content first, then main, then body
    let content_selectors = ["article", "main", "[role=\"main\"]", ".post-content", ".article-content", ".entry-content", "body"];

    for selector_str in &content_selectors {
        if let Ok(selector) = Selector::parse(selector_str) {
            if let Some(element) = document.select(&selector).next() {
                let mut texts: Vec<String> = Vec::new();
                collect_text_recursive(&element, &remove_selectors, &mut texts);
                let result = texts.join(" ");
                let cleaned = clean_text(&result);
                if !cleaned.is_empty() && cleaned.split_whitespace().count() > 50 {
                    return cleaned;
                }
            }
        }
    }

    // Fallback: just get all paragraph text
    if let Ok(selector) = Selector::parse("p") {
        let texts: Vec<String> = document
            .select(&selector)
            .map(|el| el.text().collect::<String>())
            .collect();
        return clean_text(&texts.join(" "));
    }

    String::new()
}

fn collect_text_recursive(
    element: &scraper::ElementRef,
    remove_selectors: &[&str],
    texts: &mut Vec<String>,
) {
    // Check if this element matches any remove selector
    for sel_str in remove_selectors {
        if let Ok(sel) = Selector::parse(sel_str) {
            if sel.matches(element) {
                return;
            }
        }
    }

    for child in element.children() {
        if let Some(text) = child.value().as_text() {
            let t = text.trim().to_string();
            if !t.is_empty() {
                texts.push(t);
            }
        } else if let Some(child_el) = scraper::ElementRef::wrap(child) {
            collect_text_recursive(&child_el, remove_selectors, texts);
        }
    }
}

fn clean_text(text: &str) -> String {
    // Collapse whitespace and trim
    text.split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ")
        .trim()
        .to_string()
}
