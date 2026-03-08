# AI Website Roaster

Paste any website URL and get a brutally honest, AI-powered roast of its design, performance, accessibility, and SEO — complete with scores, specific issues, code fix suggestions, and an actionable improvement plan.

## Architecture

```
                    +-------------------+
                    |   Next.js Frontend |
                    |   (Pages Router)   |
                    +--------+----------+
                             |
                    POST /api/roast
                             |
                    +--------v----------+
                    |  API Orchestrator  |
                    | rate limit + route |
                    +--------+----------+
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+          +--------v--------+
     | Playwright Worker|          | Direct HTML Fetch|
     | (Express :9222)  |          | (fallback)       |
     +--------+---------+          +--------+---------+
              |                             |
              +-------------+---------------+
                            |
                   +--------v--------+
                   | DOM Analysis    |
                   | (title, meta,   |
                   |  images, etc.)  |
                   +--------+--------+
                            |
                   +--------v--------+
                   | OpenAI GPT-4o   |
                   | (roast + JSON)  |
                   +--------+--------+
                            |
                   +--------v--------+
                   | Structured JSON  |
                   | scores, issues,  |
                   | fixes, steps     |
                   +-----------------+
```

## Tech Stack

- **Frontend**: Next.js 16 (Pages Router), TypeScript, Tailwind CSS v3
- **Backend**: Next.js API routes + standalone Playwright worker
- **AI**: OpenAI GPT-4o-mini (fallback: GPT-4o)
- **Testing**: Jest (unit), Playwright (e2e)
- **CI**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js >= 20
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Setup

```bash
git clone <repo-url>
cd ai-website-roaster
cp .env.example .env       # Edit and add your OPENAI_API_KEY
npm install
```

### Development

```bash
# Start Next.js dev server
npm run dev
```

The app runs at http://localhost:3000. Without the worker, it falls back to direct HTML fetching (no screenshots).

### Running the Worker (optional, for screenshots)

**Without Docker:**
```bash
cd worker
npm install
npm run dev    # Starts on http://localhost:9222
```

**With Docker:**
```bash
docker build -t roaster-worker ./worker
docker run --init --ipc=host -p 9222:9222 roaster-worker
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | (required) |
| `WORKER_URL` | Playwright worker URL | `http://localhost:9222` |
| `RATE_LIMIT` | Requests per IP per minute | `30` |
| `UPLOAD_RETENTION_HOURS` | Not persisted (in-memory) | `24` |
| `NODE_ENV` | Environment | `development` |

## API Reference

### POST /api/roast

**Request:**
```json
{ "url": "https://example.com" }
```

Or with HTML fallback (for bot-protected sites):
```json
{ "url": "https://example.com", "html": "<html>..." }
```

**Response:**
```json
{
  "roast": {
    "headline": "...",
    "roast": "...",
    "scores": { "performance": 75, "accessibility": 60, "seo": 45 },
    "issues": [{ "title": "...", "severity": "high", ... }],
    "fixes": [{ "issueTitle": "...", "suggestion": "...", "codeSnippet": "..." }],
    "actionable_steps": ["..."],
    "confidence": "high"
  },
  "screenshot": "base64...",
  "url": "https://example.com",
  "timestamp": 1709900000000
}
```

### GET /api/health

Returns `{ "status": "ok", "timestamp": "..." }`

## Testing

```bash
npm test              # Unit tests (Jest) — 9 tests
npm run test:e2e      # E2E tests (Playwright) — requires build
```

## Rate Limiting

- 30 requests per IP per minute (in-memory token bucket)
- Returns HTTP 429 with `X-RateLimit-Remaining` header when exceeded

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `OPENAI_API_KEY` to environment variables
4. Deploy — works without worker (HTML-only mode)

### Worker (Docker/VPS)

1. Build: `docker build -t roaster-worker ./worker`
2. Run: `docker run --init --ipc=host -p 9222:9222 roaster-worker`
3. Set `WORKER_URL` env var on Vercel to your VPS address

## Creating the GitHub Repository

Since `gh` CLI is not installed, follow these steps:

1. Go to https://github.com/new
2. Name: `ai-website-roaster`, set visibility
3. Do NOT initialize with README/.gitignore
4. Run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-website-roaster.git
git branch -M main
git push -u origin main
```

5. Add `OPENAI_API_KEY` as a repository secret (Settings > Secrets > Actions)

## Privacy & Security

- **No server-side storage**: HTML is processed in-memory only, never persisted
- **Screenshots**: Generated on-demand, not stored beyond the response
- **History**: Stored in browser `localStorage` only (client-side)
- **Rate limiting**: Protects against abuse (30 req/min per IP)
- **Bot-protected sites**: Some sites block automated access — use the HTML upload fallback

## Known Limitations

- Sites with aggressive bot protection (Cloudflare, reCAPTCHA) may not be screenshotable
- Lighthouse analysis requires Chrome and is only available inside the Docker worker
- OpenAI scores are AI estimates, not ground-truth measurements
- Rate limits are per-instance (in-memory); not shared across deployments

## Demo Video

To create a 30-60s demo for LinkedIn/portfolio:

1. Screen-record the landing page
2. Paste a well-known URL (e.g., a popular site)
3. Show the progress animation
4. Highlight the roast, scores, issues, and fixes
5. Show the bot-protection fallback with HTML paste
6. End with the history feature

## License

MIT
