use futures::future::join_all;
use serde::{Deserialize, Serialize};

use crate::errors::AppError;
use crate::models::brand_voice::StyleAttributes;
use crate::models::content::KeyPoints;
use crate::models::platform::{LengthPreset, OutputFormat, PlatformConfig, TonePreset};

#[derive(Debug, Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    temperature: f32,
    system: String,
    messages: Vec<ClaudeMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct ClaudeResponse {
    content: Vec<ClaudeContentBlock>,
}

#[derive(Debug, Deserialize)]
struct ClaudeContentBlock {
    text: Option<String>,
}

pub struct ClaudeApiClient {
    client: reqwest::Client,
}

impl ClaudeApiClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    pub async fn call_claude(
        &self,
        api_key: &str,
        system: &str,
        user: &str,
        max_tokens: u32,
        temperature: f32,
    ) -> Result<String, AppError> {
        if api_key.is_empty() {
            return Err(AppError::ApiKeyMissing);
        }

        let request = ClaudeRequest {
            model: "claude-sonnet-4-5-20250514".to_string(),
            max_tokens,
            temperature,
            system: system.to_string(),
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: user.to_string(),
            }],
        };

        let response = self
            .client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| AppError::ClaudeApi(format!("Request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Unable to read response body".to_string());
            return Err(AppError::ClaudeApi(format!(
                "API returned status {}: {}",
                status, body
            )));
        }

        let claude_response: ClaudeResponse = response
            .json()
            .await
            .map_err(|e| AppError::ClaudeApi(format!("Failed to parse response: {}", e)))?;

        claude_response
            .content
            .first()
            .and_then(|block| block.text.clone())
            .ok_or_else(|| AppError::ClaudeApi("Empty response from Claude".to_string()))
    }

    pub async fn extract_key_points(
        &self,
        api_key: &str,
        content: &str,
    ) -> Result<KeyPoints, AppError> {
        let system = r#"You are a content analysis expert. Your task is to extract the key points from the provided content and return them in a structured JSON format.

You MUST return ONLY valid JSON with no additional text, markdown formatting, or code blocks. The JSON must match this exact structure:
{
    "main_thesis": "The central argument or main point of the content",
    "key_arguments": ["First key argument", "Second key argument", ...],
    "supporting_data": ["First data point or statistic", "Second data point", ...],
    "target_audience": "Description of who this content is for",
    "emotional_tone": "The emotional tone of the content (e.g., inspiring, urgent, informative)",
    "call_to_action": "The desired action for the reader, or null if none"
}

Be thorough but concise. Extract 3-7 key arguments and any supporting data points."#;

        let response = self
            .call_claude(api_key, system, content, 2048, 0.0)
            .await?;

        let key_points: KeyPoints = serde_json::from_str(&response).map_err(|e| {
            AppError::ClaudeApi(format!(
                "Failed to parse key points JSON: {}. Raw response: {}",
                e, response
            ))
        })?;

        Ok(key_points)
    }

    pub async fn adapt_to_format(
        &self,
        api_key: &str,
        key_points_json: &str,
        format: &OutputFormat,
        tone: &TonePreset,
        length: &LengthPreset,
        config: &PlatformConfig,
    ) -> Result<String, AppError> {
        let system = self.get_format_system_prompt(format, tone, length, config);
        let user_prompt = format!(
            "Here are the extracted key points from the original content. Adapt them into the requested format:\n\n{}",
            key_points_json
        );

        self.call_claude(api_key, &system, &user_prompt, 2048, 0.7)
            .await
    }

    pub async fn refine_with_voice(
        &self,
        api_key: &str,
        draft: &str,
        style: &StyleAttributes,
        format: &OutputFormat,
    ) -> Result<String, AppError> {
        let system = format!(
            r#"You are a brand voice specialist. Your task is to refine the provided draft content to match a specific brand voice while preserving the content's message and format.

Brand Voice Profile:
- Tone: {}
- Vocabulary Level: {}
- Sentence Style: {}
- Personality Traits: {}
- Signature Phrases to incorporate (where natural): {}
- Phrases to avoid: {}

Content Format: {}

Rules:
1. Maintain the original format structure (if it's a Twitter thread, keep it as a thread; if LinkedIn, keep the LinkedIn format, etc.)
2. Adjust vocabulary, sentence structure, and tone to match the brand voice
3. Incorporate signature phrases naturally — don't force them
4. Remove or replace any phrases from the "avoid" list
5. Keep the core message and key points intact
6. Return ONLY the refined content, no explanations or meta-commentary"#,
            style.tone,
            style.vocabulary_level,
            style.sentence_style,
            style.personality_traits.join(", "),
            style.signature_phrases.join(", "),
            style.avoid_phrases.join(", "),
            format
        );

        self.call_claude(api_key, &system, draft, 2048, 0.7).await
    }

    pub async fn repurpose(
        &self,
        api_key: &str,
        content: &str,
        formats: &[OutputFormat],
        tone: &TonePreset,
        length: &LengthPreset,
        voice: Option<&StyleAttributes>,
        config: &PlatformConfig,
    ) -> Result<Vec<(OutputFormat, String)>, AppError> {
        // Stage 1: Extract key points
        let key_points = self.extract_key_points(api_key, content).await?;
        let key_points_json = serde_json::to_string(&key_points)?;

        // Stage 2: Adapt to each format in parallel
        let adaptation_futures: Vec<_> = formats
            .iter()
            .map(|format| {
                let kp_json = key_points_json.clone();
                let fmt = format.clone();
                let t = tone.clone();
                let l = length.clone();
                let c = config.clone();
                let key = api_key.to_string();
                async move {
                    let result = self
                        .adapt_to_format(&key, &kp_json, &fmt, &t, &l, &c)
                        .await;
                    (fmt, result)
                }
            })
            .collect();

        let adapted_results = join_all(adaptation_futures).await;

        // Collect results, propagating errors
        let mut drafts: Vec<(OutputFormat, String)> = Vec::new();
        for (fmt, result) in adapted_results {
            let text = result?;
            drafts.push((fmt, text));
        }

        // Stage 3: Refine with brand voice if provided
        if let Some(style) = voice {
            let refinement_futures: Vec<_> = drafts
                .into_iter()
                .map(|(fmt, draft)| {
                    let s = style.clone();
                    let f = fmt.clone();
                    let key = api_key.to_string();
                    async move {
                        let result = self.refine_with_voice(&key, &draft, &s, &f).await;
                        (fmt, result)
                    }
                })
                .collect();

            let refined_results = join_all(refinement_futures).await;

            let mut final_outputs = Vec::new();
            for (fmt, result) in refined_results {
                let text = result?;
                final_outputs.push((fmt, text));
            }
            Ok(final_outputs)
        } else {
            Ok(drafts)
        }
    }

    pub async fn analyze_voice(
        &self,
        api_key: &str,
        samples: &[String],
    ) -> Result<StyleAttributes, AppError> {
        let system = r#"You are a brand voice analyst. Analyze the provided writing samples to identify the writer's unique voice characteristics.

Return ONLY valid JSON with no additional text, markdown formatting, or code blocks. The JSON must match this exact structure:
{
    "tone": "Description of the overall tone (e.g., 'warm and authoritative', 'witty and irreverent')",
    "vocabulary_level": "Description of vocabulary complexity (e.g., 'accessible, avoids jargon', 'technical but clear')",
    "sentence_style": "Description of sentence patterns (e.g., 'short punchy sentences with occasional long flowing ones', 'complex compound sentences')",
    "personality_traits": ["trait1", "trait2", "trait3"],
    "signature_phrases": ["phrase1", "phrase2", "phrase3"],
    "avoid_phrases": ["phrase1", "phrase2"]
}

Analyze deeply:
- What makes this voice distinctive?
- What patterns recur across samples?
- What vocabulary choices stand out?
- What sentence structures are favored?
- Are there signature expressions or turns of phrase?
- What would this voice NEVER say?

Provide 3-5 personality traits, 3-5 signature phrases, and 2-4 phrases to avoid."#;

        let user_prompt = samples
            .iter()
            .enumerate()
            .map(|(i, s)| format!("--- Sample {} ---\n{}", i + 1, s))
            .collect::<Vec<_>>()
            .join("\n\n");

        let response = self
            .call_claude(api_key, system, &user_prompt, 2048, 0.3)
            .await?;

        let style: StyleAttributes = serde_json::from_str(&response).map_err(|e| {
            AppError::ClaudeApi(format!(
                "Failed to parse voice analysis JSON: {}. Raw response: {}",
                e, response
            ))
        })?;

        Ok(style)
    }

    fn get_format_system_prompt(
        &self,
        format: &OutputFormat,
        tone: &TonePreset,
        length: &LengthPreset,
        config: &PlatformConfig,
    ) -> String {
        match format {
            OutputFormat::TwitterThread => self.twitter_prompt(tone, length, config),
            OutputFormat::Linkedin => self.linkedin_prompt(tone, length, config),
            OutputFormat::Instagram => self.instagram_prompt(tone, length, config),
            OutputFormat::Newsletter => self.newsletter_prompt(tone, length, config),
            OutputFormat::EmailSequence => self.email_sequence_prompt(tone, length, config),
            OutputFormat::Summary => self.summary_prompt(tone, length),
        }
    }

    fn twitter_prompt(&self, tone: &TonePreset, length: &LengthPreset, config: &PlatformConfig) -> String {
        let tweet_count = config.tweet_count.unwrap_or(5);
        let hashtag_count = config.hashtag_count.unwrap_or(3);
        let use_emojis = config.include_emojis.unwrap_or(true);
        let emoji_instruction = if use_emojis {
            "Use relevant emojis to add visual interest and break up text."
        } else {
            "Do NOT use any emojis."
        };

        format!(
            r#"You are a social media content expert specializing in Twitter/X threads. Create a compelling thread from the provided key points.

Tone: {}
Length: {} ({} tweets in the thread)
Hashtags: Include {} relevant hashtags in the final tweet
Emojis: {}

Thread Structure:
1. Hook tweet — grab attention immediately. Use a bold claim, surprising stat, or provocative question.
2. Body tweets — each tweet should make ONE clear point. Use line breaks for readability.
3. Final tweet — summarize the key takeaway, include hashtags, and add a call-to-action if appropriate.

Rules:
- Each tweet MUST be under 280 characters
- Number each tweet (1/, 2/, etc.)
- Make each tweet standalone-worthy (people may see individual tweets)
- Use thread-specific connectors ("Here's why...", "But here's the thing...", "The result?")
- Front-load the value — don't save the best insight for last
- Return ONLY the thread text, no explanations"#,
            tone, length, tweet_count, hashtag_count, emoji_instruction
        )
    }

    fn linkedin_prompt(&self, tone: &TonePreset, length: &LengthPreset, config: &PlatformConfig) -> String {
        let use_emojis = config.include_emojis.unwrap_or(true);
        let emoji_instruction = if use_emojis {
            "Use emojis as bullet point markers and section separators."
        } else {
            "Do NOT use any emojis. Use traditional bullet points or dashes instead."
        };

        format!(
            r#"You are a LinkedIn content strategist. Create a high-engagement LinkedIn post from the provided key points.

Tone: {}
Length: {}
Emojis: {}

LinkedIn Post Structure:
1. Hook line — first 2 lines are critical (they show before "see more"). Make them count.
2. Line break after hook for visual separation.
3. Body — share the insight, story, or lesson. Use short paragraphs (1-2 sentences each).
4. Use line breaks liberally — LinkedIn rewards white space.
5. End with a question or call-to-action to drive engagement.
6. Add 3-5 relevant hashtags at the very end.

Rules:
- Maximum 3,000 characters
- Short paragraphs (1-2 sentences)
- Each line should add value
- Write in first person where appropriate
- Be authentic, not corporate-speak
- Include a "pattern interrupt" (unexpected insight or contrarian take)
- Return ONLY the post text, no explanations"#,
            tone, length, emoji_instruction
        )
    }

    fn instagram_prompt(&self, tone: &TonePreset, length: &LengthPreset, config: &PlatformConfig) -> String {
        let hashtag_count = config.hashtag_count.unwrap_or(15);
        let use_emojis = config.include_emojis.unwrap_or(true);
        let emoji_instruction = if use_emojis {
            "Use emojis generously — they're essential for Instagram captions."
        } else {
            "Minimize emoji usage. Use sparingly if at all."
        };

        format!(
            r#"You are an Instagram content creator. Create an engaging Instagram caption from the provided key points.

Tone: {}
Length: {}
Hashtags: Include {} relevant hashtags
Emojis: {}

Instagram Caption Structure:
1. Hook — first line must stop the scroll. Bold statement, question, or relatable moment.
2. Body — tell a micro-story or share the insight. Keep paragraphs short.
3. Call-to-action — ask a question, encourage saves/shares, or direct to link in bio.
4. Hashtag block — separate from caption with line breaks. Mix popular and niche hashtags.

Rules:
- Maximum 2,200 characters for the caption
- Use line breaks and spacing for readability
- Write conversationally — Instagram is personal
- Include a CTA (save this, share with someone who needs this, comment below)
- Hashtags go at the end, separated by a few line breaks
- Return ONLY the caption text (including hashtags), no explanations"#,
            tone, length, hashtag_count, emoji_instruction
        )
    }

    fn newsletter_prompt(&self, tone: &TonePreset, length: &LengthPreset, config: &PlatformConfig) -> String {
        let use_emojis = config.include_emojis.unwrap_or(false);
        let emoji_instruction = if use_emojis {
            "Use emojis sparingly for visual interest in headers and key points."
        } else {
            "Do not use emojis. Keep it clean and professional."
        };

        format!(
            r#"You are a newsletter writer who creates compelling, value-packed email newsletters. Create a newsletter edition from the provided key points.

Tone: {}
Length: {}
Emojis: {}

Newsletter Structure:
1. Subject line — compelling, curiosity-driven, under 50 characters. Put on its own line prefixed with "SUBJECT: "
2. Preview text — the snippet that shows in inbox. Put on its own line prefixed with "PREVIEW: "
3. Opening hook — personal anecdote, timely reference, or bold statement
4. Main content — break into 2-3 sections with clear headers
5. Key takeaways — bullet-pointed summary of actionable insights
6. Closing — personal sign-off with a question or teaser for next issue

Rules:
- Write like you're emailing a smart friend
- Every paragraph should earn its place — cut the fluff
- Use subheadings to break up content
- Include at least one specific, actionable takeaway
- End sections with transitions that pull readers forward
- Return the FULL newsletter content with SUBJECT and PREVIEW lines at the top"#,
            tone, length, emoji_instruction
        )
    }

    fn email_sequence_prompt(&self, tone: &TonePreset, length: &LengthPreset, config: &PlatformConfig) -> String {
        let use_emojis = config.include_emojis.unwrap_or(false);
        let emoji_instruction = if use_emojis {
            "Use emojis sparingly in subject lines for attention."
        } else {
            "Do not use emojis."
        };

        format!(
            r#"You are an email marketing expert. Create a 3-email nurture sequence from the provided key points.

Tone: {}
Length: {}
Emojis: {}

Email Sequence Structure:
For EACH of the 3 emails, provide:
- "EMAIL 1:" / "EMAIL 2:" / "EMAIL 3:" header
- "SUBJECT: " line
- "SEND TIMING: " line (e.g., "Day 1", "Day 3", "Day 5")
- Email body

Email 1 — The Hook:
- Lead with the most compelling insight
- Establish credibility and relevance
- End with anticipation for email 2

Email 2 — The Deep Dive:
- Expand on the key arguments
- Provide specific examples or data
- Include a soft call-to-action

Email 3 — The Close:
- Summarize the transformation/value
- Strong call-to-action
- Create urgency without being pushy

Rules:
- Each email should stand alone but build on previous ones
- Subject lines under 50 characters, curiosity-driven
- Short paragraphs (1-3 sentences)
- Use "you" language — focus on the reader
- Include PS lines where appropriate
- Return ALL 3 emails clearly separated"#,
            tone, length, emoji_instruction
        )
    }

    fn summary_prompt(&self, tone: &TonePreset, length: &LengthPreset) -> String {
        let word_range = match length {
            LengthPreset::Short => "50-100",
            LengthPreset::Medium => "100-200",
            LengthPreset::Long => "200-400",
        };

        format!(
            r#"You are an expert summarizer. Create a clear, comprehensive summary from the provided key points.

Tone: {}
Length: {} ({} words)

Summary Structure:
1. One-sentence overview — capture the essence
2. Key points — the most important arguments or insights, as a bulleted list
3. Bottom line — the "so what?" — why this matters

Rules:
- Be concise but don't sacrifice clarity
- Preserve the original's most important nuances
- Use active voice
- No filler words or hedging language
- Return ONLY the summary, no explanations or meta-commentary"#,
            tone, length, word_range
        )
    }
}
