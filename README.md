# RGC Retail Intelligence Dashboard

A single-page three section dashboard for the Really Good Culture full-stack intern technical assessment. It connects transcript-backed consumer voice with product, brand, retailer, pricing, and positioning context.

The core question:

> What are consumers actually saying, and where does that align or misalign with how products and brands are positioned in the catalogue?

## What It Does

The app turns the supplied assessment dataset into a compact, client-facing intelligence workspace with three sections:

- **Overview**: KPI cards, transcript coverage, normalized signal distribution, brand comparison, and one headline commercial opportunity.
- **Consumer Voice Explorer**: searchable, filterable transcript-backed signals with reviewer context, product metadata, confidence labels, evidence snippets, and expanded transcript text.
- **Commercial Context**: positioning-vs-reviewer-reality analysis, ranked opportunities, aggregation tables by business dimension, price-positioning checks, and recommendation tiles.

The dashboard is deliberately evidence-led. Every displayed signal is traceable to a phrase, snippet, count, rate, status, or structured catalogue field.

## Data Reality

Transcript coverage is intentionally partial and the UI treats that as a feature, not an error.

- 130 transcript rows
- 130 user profile rows
- 35 catalogue products
- 9 brands
- 15 products have linked reviewer transcripts
- 20 products are catalogue-only context
- 4 brands have transcript evidence: Double Dutch, Fix8, SKIP, UNAI
- 5 brands are catalogue-only competitor/category context: Trip, DASH, Hip Pop, Agua de Madre, Dalston's

Catalogue-only products and brands remain visible for product, retailer, pricing, brand-score, and competitive comparisons. Transcript-derived metrics show `No transcript evidence` when no linked review data exists.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Preprocessing**: Python standard library
- **Data delivery**: static JSON artifacts loaded client-side
- **Backend**: minimal Express health/message service, not used for analytics
- **Deployment**: Docker Compose with Caddy reverse proxy

The dataset is small enough that a database or query backend would add more complexity than value. The preprocessing step creates ready-to-render JSON so the dashboard stays fast and simple.

## Project Structure

```text
.
|-- app/
|   |-- frontend/              # Next.js dashboard UI
|   `-- backend/               # Minimal Express service
|-- Dataset/                   # Raw assessment files
|-- data/                      # Generated JSON artifacts
|-- scripts/preprocess.py      # Data cleaning, joins, enrichment, aggregation
|-- dashboard.md               # Product/dashboard specification
|-- dashboard_ui.md            # UI style guide
|-- docker-compose.yml         # Frontend, backend, Caddy
`-- Caddyfile                  # Reverse proxy config
```

## Data Pipeline

Run preprocessing from the project root:

```bash
python scripts/preprocess.py
```

This reads:

- `Dataset/transcripts.json`
- `Dataset/users.json`
- `Dataset/products.csv`
- `Dataset/brands.csv`

And writes/mirrors:

- `data/dashboard_data.json`
- `data/transcript_user_enriched.json`
- `data/transcript_product_aggregates.json`
- `data/brand_level_aggregates.json`
- `data/commercial_aggregation_layer.json`
- `data/filter_options.json`
- `data/validation_report.json`
- matching copies under `app/frontend/public/data/`

The frontend primarily consumes `dashboard_data.json`.

## Enrichment Approach

The transcript enrichment is deterministic and explainable:

- rule-based theme and signal extraction
- keyword/phrase matches with evidence snippets
- simple confidence labels based on matched phrase support
- normalized commercial rates for comparison across uneven transcript coverage
- positioning-vs-reviewer-reality gaps using structured product/brand metadata and mapped transcript signals

The confidence values are not model certainty. They are lightweight heuristic scores to help reviewers understand signal strength within the processed data.

## Key Commercial Feature

**Positioning vs Reviewer Reality** compares two layers:

- **Structured positioning score**: how strongly brand/product metadata maps to a positioning dimension.
- **Reviewer mention rate**: how often transcript-backed reviews mention mapped signals for that same dimension.

The resulting gaps highlight:

- positioned claims that reviewers are not talking about
- emergent reviewer-led strengths
- validated positioning
- over-indexing or under-indexing versus reviewed-category baselines

This is intended as directional insight support, not statistical proof.

## Run With Docker

From the project root:

```bash
docker compose up --build
```

This starts:

- frontend on the internal `3000` service port
- backend on the internal `5000` service port

Caddy is configured for `dashboard.vpsdomain.co.uk`.

Routes:
- `/api/*` proxies to the backend container on `backend:5000`
- all other paths proxy to the frontend container on `frontend:3000`

For local Docker testing, either point that domain to the machine running Docker or temporarily change the Caddy site address to `localhost`.

## Run Locally

Install and run the frontend:

```bash
cd app/frontend
npm install
npm run dev
```

The frontend defaults to:

```text
http://localhost:3000
```

Build check:

```bash
cd app/frontend
npx tsc --noEmit
npm run build
```

## Design System

The interface follows a dense, dark, premium analytics style with compact tabs, low-contrast panels, restrained neon accents, evidence snippets, semantic no-data states, and responsive dashboard grids.

The app avoids fake live-data language. The status badge says `Processed dataset` because the analytics come from static preprocessed JSON.

## Tradeoffs

- No database: static artifacts are simpler and appropriate for the dataset size.
- No heavy NLP or model calls: deterministic enrichment is easier to inspect and justify.
- Minimal backend: analytics do not require server-side routes.
- No auth, exports, or saved workflows: out of scope for the assessment and timebox.
- No true momentum chart: the current processed layer supports rates and distributions, not validated time-series momentum.