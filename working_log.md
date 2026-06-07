# Working Log

## Overview
- Start time: June 6th, 20:00
- Deadline: June 7th, 12:30
- Goal: Live hosted interactive dashboard

---

## Log Entries

### 20:00
**Objective:** Understand the brief and define scope  
**What I did:** Read brief, reviewed deliverables, skimmed dataset files  
**Observations:** Need to build a hosted dashboard, not just analysis. Focus should be usefulness over completeness.  
**Decision:** Prioritise an end-to-end working app with 2–3 strong insight views instead of many half-finished features. Plan to use Docker with Caddy VPS to host application. As coding with an AI agent will speed up process, focusing on refining AI agent output to match objectives and meet the overall project goal. Debug in person to avoid hallucination and generating unnecessary bloatware. I will still be making choices of the architecture, tools, framework, and more myself.  
**Why:** 24-hour (now 16 hour) timebox; likely better to show judgement and shipping ability.  
**Next:** Identify strongest ways to showcase relationships between transcript, user, product, brand, and retail data.

### 20:30
**Objective:** Research best way to display data  
**What I did:** Researched Really Good Culture's website to get inspiration  
**Observations:** Breakthrough Suite combines signals with interactive graphs.  
**Decision:** Make a simplified version of the RGC Breakthrough Suite for the dataset given constraints.  
**Why:** Task is very much aligned with what the Breakthrough Suite does for brand customers.  
**Next:** Inspect dataset.

### 23:00
**Objective:** Inspect dataset and map join paths  
**What I did:** Opened all four files in R Studio with tidyverse, checked row counts, field names, nesting, and likely primary/foreign keys. Apply exploratory data analysis principles. Confirmed joins between transcripts and products.  
**Observations:** Transcript coverage is partial by design, so missing transcript links should not be treated as data quality failure. Product and brand files provide broader market context even where transcript evidence is absent.  
**Decision:** Build the dashboard around two connected layers: transcript-backed consumer voice and wider catalogue/brand context.  
**Why:** This matches the brief’s emphasis on joining consumer voice to commercial product, retail, and brand signals.  
**Next:** Profile key fields for completeness and decide which columns are worth using.

### 23:30
**Objective:** Define plan of action for app  
**What I did:** Listed possible dashboards features and compared them to the brief. Considered reviewer sentiment explorer, brand/product comparison, and retail plus transcript insights.  
**Options considered:**

1. Reviewer sentiment explorer
2. Brand/product performance comparison
3. Retail + transcript insight dashboard

**Decision:** Build around “What are consumers saying, and which brands/products/retail contexts are associated with those signals?”  
**Why:** Best balance of technical feasibility, time constraint, transcript evidence, and commercial usefulness.  
**Next:** Sketch app screens and define exact views.

### 23:40
**Objective:** Lock the dashboard structure  
**What I did:** Designed the app around 3 core views plus filtering:

1. Brand overview with top KPIs and strongest themes, insights, and opportunities
2. Consumer Voice Explorer with transcript-backed tags/themes and evidence
3. Brand/Product Context with comparisons by brand, category, retailer, price tier, rating, or attributes  

**Observations:** The brief wants a dashboard view, browse/explore capability, explainable enrichment, and at least one strong commercial insight feature. These screens cover all of that.  
**Decision:** Keep the UI simple with three lightweight page with sections and filters. If need be, focus on the most important signals and don't overcomplicate with graphs and advanced features.  
**Why:** Faster to ship, easier to host, and less navigation overhead for assessors.  
**Next:** Choose stack based on fastest path to a hosted result.

### 23:50
**Objective:** Choose implementation stack  
**What I did:** Evaluated stack options against the brief, current progress, dataset shape, hosting plan, and the need to ship a polished hosted dashboard within a tight timebox. Compared staying in R versus moving to a JavaScript full-stack app with lightweight preprocessing.  

**Observations:**
* The brief explicitly values shipping a useful hosted app quickly over architectural complexity.
* Dataset is small: 130 transcripts, 130 users, 35 products, 9 brands, so no heavy backend or database is required.
* Data includes JSON + CSV with nested/unstructured transcript content, which is easier to flatten in a one-time preprocessing step than to parse repeatedly at runtime.
* The product needs interactive filtering, searchable exploration, evidence display, and joined commercial views, which are very natural in a React-based UI. Already planned Docker + Caddy on VPS, so a single containerised web app is ideal.
* R was useful for inspection/EDA, but using R now would likely slow down UI iteration, styling, and deployment polish versus a modern frontend stack
**Decision:** Use Next.js + TypeScript + Tailwind CSS + Python preprocessing scripts + static JSON artifacts, deployed via Docker behind Caddy on the VPS.  

**Why:**
* Fastest path to a polished hosted result: Next.js gives a strong UI/dev experience, simple routing, and easy deployment.
* Best fit for dashboard UX: React components make filters, metric cards, drilldowns, transcript evidence panels, and comparison tables much easier to build cleanly.
* No need for a real backend/database: the dataset is tiny, so preprocessing into ready-to-query JSON avoids backend overhead and reduces failure points.
* Explainable enrichment is easy to implement: Python can generate lightweight transcript-backed signals, confidence scores, snippets, and denormalised brand/product/user joins ahead of time.
* Good tradeoff for the assessment: shows full-stack judgement without wasting time on auth, APIs, ORM setup, or infra complexity the brief explicitly says not to prioritise.
* Easy to document: clear separation between scripts/ for data prep and app/ for UI makes the approach easy for assessors to understand.
* Reliable hosting: one Dockerised Next.js app serving static processed data is simpler and safer under deadline pressure than coordinating multiple services.  

**Next:** Set up project skeleton, data loading scripts, and preprocessing pipeline

### 00:00
**Objective:** Set up repo and base application
**What I did:** Created repository structure with app folder, data processing scripts, cached outputs, README stub, and working log file. Added environment setup, dependency file, and initial hosted-app scaffold.
**Observations:** Having the skeleton in place reduces context switching tomorrow and helps ensure there is always something runnable.
**Decision:** Build preprocessing as separate scripts that output cleaned tables for the app to read.
**Why:** Keeps the app responsive and makes debugging easier than parsing raw JSON/CSV in the UI layer repeatedly.
**Next:** Deploy skeleton application

### 00:30
**Objective:** Deploy hosted skeleton application
**What I did:** Pushed the repo, configured deployment with Docker and Caddy.
**Observations:** Deployment issues can eat the final hour if left too late.
**Decision:** Treat deployment as mandatory before any cosmetic improvement.
**Why:** A working hosted URL is a required deliverable.
**Next:** Implement data cleaning and join pipeline.

### 00:45
**Objective:** Build preprocessing pipeline  
**What I did:** Wrote scripts to load raw files, flatten nested JSON where needed, standardise column names, normalise text fields, and produce joined analytical tables. Use GenAI to parse transcript to find theme keywords.  
**Observations:** Transcript and user joins may not be perfectly clean, so I need transparent assumptions, data cleansing, and validation checks.  
**Decision:** Create 3 joined outputs:
1. transcript-user enriched table (transcripts-users joined on (`reviewId`, `personId`))
2. transcript-product aggregated table (transcripts-products joined on `productId`)
3. brand-level aggregated table  (products-brand joined on `brand` and `brand_name`)

Also create filter options, which will be used later on in the dashboard.

**Why:** These map directly to dashboard views and simplify charting/filtering.  
**Next:** Design the enrichment logic for transcript-backed signals.

### 01:10
**Objective:** Implement explainable transcript enrichment  
**What I did:** Defined a small set of useful, commercial transcript-backed signals such as praise, pain points, usage occasions, purchase drivers, complaints, retailer mentions, and competitor/comparison mentions. Also includes themes such as . Used a rule-based keyword approach with confidence based on the number of matched keywords.  
**Observations:** The brief does requires useful and explainable signal extraction. Basic signal extraction is sufficient for the task, and just requires reading the transcript data and finding patterns. Many limitations, however, exist.
**Decision:** Prefer deterministic heuristics and visible evidence over opaque scoring. Add confidence labels only where they can be justified simply.  
**Why:** Easier to verify, easier to explain in notes, and safer within the timebox.  
**Next:** Test the extracted signals on a sample of transcripts and refine false positives.

At the same time, I iterated the following to refine signals:

### 01:10
**Objective:** Validate transcript signals  
**What I did:** Spot-checked sample transcripts against generated tags, reviewed evidence snippets, and adjusted matching rules to reduce noisy classifications.  
**Observations:** Some signals are strong and obvious; others are ambiguous. Over-tagging will hurt credibility.  
**Decision:** Keep only the strongest signal families that produce believable evidence. Drop anything that feels speculative.  
**Why:** The submission will be judged on clear thinking and explainability, not maximum feature count.  
**Next:** Create commercial aggregations linking signals to products, brands, retailers, ratings, and attributes.