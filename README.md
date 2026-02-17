# ContentEngine

<p align="center">
  <strong>Privacy-first desktop app for repurposing content into platform-ready formats using Claude AI</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#privacy">Privacy</a>
</p>

---

## What It Does

ContentEngine transforms your written content into **6 platform-specific formats** in one click. All processing happens locally—your data never leaves your device except for Claude API calls.

### Core Features

- 📝 **Multi-Format Generation**: Transform content into Twitter threads, LinkedIn posts, Instagram captions, newsletters, email sequences, and summaries
- 🎨 **Brand Voice Profiles**: Analyze writing samples to create custom brand voices
- 📊 **Generation History**: Browse, search, and manage all past generations
- 💾 **Markdown Export**: Export all formats to universally-compatible Markdown files
- 🔒 **Local-First**: All data stored on your device—no cloud sync, no tracking
- 📈 **Usage Tracking**: Monitor monthly generation usage with configurable limits

### Supported Output Formats

- Twitter/X Thread
- LinkedIn Post
- Instagram Caption
- Newsletter excerpt
- Email Sequence (3-part)
- Summary

## Installation

### End Users

Download the latest release for your platform:
- **macOS**: `ContentEngine-macos-universal.dmg`
- **Windows**: `ContentEngine-windows-x64.msi`
- **Linux**: `ContentEngine-linux-x64.AppImage`

Use the releases page for installation assets and platform-specific install instructions.

### Developers

1. Install prerequisites: Node.js 20+, pnpm 8+, Rust 1.70+, and Tauri dependencies.
2. Install dependencies: `pnpm install`
3. Start dev app: `pnpm tauri:dev`

## Usage

### Quick Start

1. **Launch** ContentEngine
2. **Add API Key**: Settings → Enter your Claude API key ([get one here](https://console.anthropic.com/))
3. **Create Content**: Paste text or enter a URL
4. **Select Formats**: Choose which platforms you need
5. **Generate**: Click generate and get all formats instantly

### Brand Voice

1. Navigate to **Brand Voice** page
2. Upload 1-10 writing samples
3. Claude analyzes and extracts your unique voice
4. Set as default to apply to all generations

### Export

1. Go to **History** page
2. Click any generation
3. Click **Export to Markdown**
4. Files saved to `{app_data_dir}/exports/`

## Privacy

**Your data stays on your device.** We don't collect analytics, crash reports, or telemetry.

- All content stored locally in SQLite
- API key secured in OS keyring
- No cloud sync, no third-party tracking
- See [PRIVACY.md](PRIVACY.md) for details

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Zustand (state management)
- Tailwind CSS 4
- Vite 7

**Backend:**
- Rust + Tauri v2
- SQLite (local database)
- Tracing (structured logging)
- reqwest (HTTP client)

**Testing:**
- Vitest (frontend)
- Cargo test (backend)
- 85+ tests, 48% coverage

## Development

### Prerequisites

- Node.js 20+ + pnpm 8+
- Rust 1.70+
- Tauri prerequisites ([install guide](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setup

```bash
# Install dependencies
pnpm install

# Run app in normal dev mode
pnpm tauri:dev

# Run app in lean dev mode (temp build caches + auto-clean on exit)
pnpm lean:dev

# Run tests
pnpm test              # Frontend
cargo test --manifest-path src-tauri/Cargo.toml  # Backend

# Lint & format
pnpm lint
pnpm format
```

### Normal vs Lean Dev

- `pnpm tauri:dev` keeps build artifacts (faster restarts, higher disk usage)
- `pnpm lean:dev` stores Rust/Vite build caches in a temporary folder and removes heavy artifacts on exit (lower disk usage, slower cold starts)
- If port `1420` is already used, `pnpm lean:dev` automatically tries ports `1421-1425`

### Cleanup Commands

```bash
# Remove heavy build artifacts only (safe for daily use)
pnpm clean:heavy

# Remove all reproducible local caches, including node_modules
pnpm clean:local
```

### Build

```bash
# Production build
pnpm tauri:build

# Output: src-tauri/target/release/
```

## Contributing

- Open an issue with a clear problem statement and reproduction details.
- Keep pull requests focused and include validation steps.
- For code changes, run `pnpm type-check`, `pnpm test`, and `pnpm build` before submitting.

## Roadmap

- [ ] Full-text search in history
- [ ] Batch URL processing
- [ ] Custom format templates
- [ ] Dark mode
- [ ] Auto-updater

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 🐛 [Report Bug](https://github.com/YOUR_USERNAME/ContentEngine/issues)
- 💡 [Request Feature](https://github.com/YOUR_USERNAME/ContentEngine/issues)

---

<p align="center">Made with ❤️ using Claude AI</p>
