# Competitor Research API

Backend server that researches company competitors by calling multiple external APIs in parallel, with strict timeout constraints at both the provider and request level.

## Features

- **Multi-provider research** — queries Wikipedia (no key required), Tavily web search, and NewsAPI concurrently
- **Per-provider timeout** — each dependency API call is capped (default 10s) via `httpx` and `asyncio.wait_for`
- **Global research timeout** — the entire operation aborts if it exceeds the deadline (default 30s), returning HTTP 504
- **Graceful degradation** — slow or failing providers return timeout/error status while successful ones still contribute results
- **Result merging** — deduplicates competitors across providers, ranked by confidence

## Quick start

```bash
cd competitor-research
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

cp .env.example .env
# Optionally set TAVILY_API_KEY and NEWS_API_KEY

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs).

## API

### `POST /api/v1/research`

```json
{
  "company": "Stripe",
  "industry": "fintech payments"
}
```

### `GET /api/v1/research/{company}?industry=fintech`

### Response shape

```json
{
  "company": "Stripe",
  "industry": "fintech payments",
  "competitors": [
    {
      "name": "Adyen",
      "description": "...",
      "source": "tavily",
      "url": "https://...",
      "confidence": 0.75
    }
  ],
  "providers": [
    {
      "provider": "wikipedia",
      "status": "success",
      "competitors": [...],
      "elapsed_ms": 412.5
    }
  ],
  "summary": {
    "total_providers": 3,
    "successful": 2,
    "timed_out": 0,
    "errors": 0,
    "skipped": 1,
    "elapsed_ms": 890.2,
    "research_timeout_seconds": 30,
    "provider_timeout_seconds": 10
  }
}
```

## Timeout model

| Layer | Default | Config env var | Behavior |
|-------|---------|----------------|----------|
| Provider HTTP | 10s | `PROVIDER_TIMEOUT_SECONDS` | Each provider call is wrapped in `asyncio.wait_for` |
| Overall research | 30s | `RESEARCH_TIMEOUT_SECONDS` | `asyncio.gather` of all providers must finish within deadline |

When a provider times out, its status is `"timeout"` and other providers continue. When the overall deadline is hit, the API returns **504 Gateway Timeout**.

## Configuration

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `PROVIDER_TIMEOUT_SECONDS` | Max wait per dependency API |
| `RESEARCH_TIMEOUT_SECONDS` | Max wait for full research request |
| `TAVILY_API_KEY` | Optional — enables Tavily web search |
| `NEWS_API_KEY` | Optional — enables NewsAPI news search |

Wikipedia works without any API key.

## Tests

```bash
pytest
```

## Project structure

```
app/
├── main.py              # FastAPI app
├── config.py            # Settings from env
├── api/routes.py        # HTTP endpoints
├── services/research.py # Orchestrator with timeout logic
└── providers/           # Pluggable API clients
    ├── base.py
    └── http_providers.py
tests/
```
