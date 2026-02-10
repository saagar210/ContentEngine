# ContentEngine

ContentEngine is a local-first desktop app for repurposing source content (pasted text or a URL) into multiple platform-ready outputs using Anthropic Claude.

## What It Does

- Paste text or fetch an article from a URL and generate multiple output formats in one run.
- Choose tone and length presets.
- Create and manage Brand Voice profiles (analyze writing samples, set a default voice, and apply it to outputs).
- Browse generation history and view/delete past runs.
- Export generated outputs to PDF.
- Track monthly usage with a configurable limit (default: 50 generated formats/month, resets monthly).

### Supported Output Formats

- Twitter/X Thread
- LinkedIn Post
- Instagram Caption
- Newsletter excerpt
- Email Sequence (3-part)
- Summary

## Tech Stack

- Desktop shell: Tauri (v2)
- Frontend: React + React Router + Zustand + Vite + Tailwind CSS
- Backend: Rust + SQLite (rusqlite) + reqwest (URL fetch + Claude API) + printpdf (PDF export)

## Setup

### Prerequisites

- Node.js + pnpm
- Rust toolchain
- Tauri prerequisites for your OS

### Install

```bash
pnpm install
```

### Run (Desktop App)

```bash
pnpm tauri dev
```

### Build (Desktop App)

```bash
pnpm tauri build
```

## Configuration

### Anthropic API Key

The app uses Anthropic Claude for repurposing and brand voice analysis.

- Open `Settings` in the app and paste an Anthropic key (expects the `sk-ant-...` format).
- The key is stored locally in the app's SQLite settings table and is masked when displayed in the UI.

## Data Storage

Content inputs, generated outputs, brand voice profiles, and usage records are stored locally in SQLite under the app data directory.

## Tests (Optional)

Frontend:

```bash
pnpm exec vitest
```

Rust:

```bash
cd src-tauri
cargo test
```
