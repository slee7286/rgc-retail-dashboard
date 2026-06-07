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

### 01:40
**Objective:** Build the commercial aggregation layer and define at least one brand-facing insight feature.  
**What I did:** Aggregated transcript-derived theme signals by product, brand, retailer, category, rating band, and selected structured attributes. Calculated both raw counts and normalized rates such as share of reviews mentioning a pain point, share mentioning a benefit, and most common positive/negative themes by brand. I also started shaping a comparison layer between what products/brands appear to be positioned around in structured data and what reviewers actually talk about in transcripts.  
**Observations:** Relative rates are more decision-useful than raw counts because transcript coverage varies a lot across products and brands. Transcript data also becomes much more commercially interesting when placed next to brand/product context rather than shown in isolation. A simple transcript frequency chart is descriptive, but a “claim/positioning vs. reviewer reality” comparison is much closer to something a brand, insights, or retail team could act on.  
**Decision:** Use both counts and rates, show transcript sample size prominently, and prioritize one insight feature that joins qualitative reviewer signals with structured brand/product intelligence. The main commercial angle will be to highlight where reviewer discussion appears to over-index or under-index relative to brand/product positioning, category norms, or competitor context.  
**Why:** This better answers practical stakeholder questions like:
- Are consumers actually talking about the things a brand seems to be competing on?
- Which pain points or benefits are disproportionately associated with a brand versus competitors?
- Are there pricing or category-positioning mismatches between catalogue context and lived consumer feedback?

**Next:** Create the dashboard UI

### 02:20
**Objective:** Finalize exact dashboard specification for UI build  
**What I did:** Converted the brief, processed data contract, and earlier product decisions into a precise page spec covering layout, sections, cards, supported filters, allowed metrics, and feature limits. Grounded the app in the actual JSON outputs rather than a broader idealized product vision.  
**Observations:** The strongest version of the app is a compact, evidence-led dashboard with three sections: Overview, Consumer Voice Explorer, and Commercial Context. The processed data supports distribution, rates, transcript evidence, positioning-gap analysis, and grouped commercial comparisons, but not real-time analytics or a true momentum model. Catalogue-only brands/products are intentional context and should remain visible without being misrepresented as zero-signal entities.  
**Decision:** Keep the app as a single-page Next.js dashboard reading static JSON artifacts client-side. Use the header, KPI cards, transcript evidence workspace, brand comparison tables, positioning-vs-reviewer-reality feature, price/positioning checks, and a small recommendation area. Avoid features not supported by the data such as live analytics, backend querying, heavy NLP, complex charting, or fabricated retailer/sales intelligence.  
**Why:** This preserves credibility, keeps the UI tightly aligned to the brief, and ensures that every visible insight is backed by sample size, rates, and transcript or metadata evidence. It also keeps scope manageable for a full build-to-deploy cycle within the timebox.  
**Next:** Implement the dashboard components directly against `dashboard_data.json` and the commercial aggregation layer, then style the UI in a simplified Breakthrough Suite-inspired dark theme.

### 02:40
**Objective:** Build the default landing page and make the app visibly useful as early as possible  
**What I did:** Implemented the first complete dashboard slice. Added the header with title, subtitle, processed-dataset status badge, dataset summary, and section tabs. Built the Overview section using real data, including KPI cards for transcript coverage, average rating, would-buy-after-trying, positive sentiment share, top benefit signal, and top pain point. Added consumer signal distribution bars, summary lists for top benefits/pain points/occasions/market context, a brand signal comparison table that correctly renders catalogue-only brands as no transcript evidence, and a Commercial Opportunity Signal card. Applied dark premium dashboard styling with responsive layout.  
**Observations:** Building the overview first creates a credible landing state quickly and proves that the processed data contract is usable end-to-end in the frontend. The brand table and opportunity card already communicate the core commercial story, especially once catalogue-only context is shown explicitly instead of being flattened into zeros. One technical note is that importing the json data directly increases first-load bundle size, though this is acceptable for the small assessment dataset.  
**Decision:** Keep the initial page focused on the executive summary rather than trying to build all sections at once. Use direct JSON import for speed and reliability now, and defer client-side fetching or bundle optimization.  
**Why:** This gives something immediately understandable and visually complete, while reducing integration risk before moving on to the deeper evidence and comparison views. It also keeps effort concentrated on the most important first impression of the app.  
**Next:** Build the Consumer Voice Explorer section with filter controls, transcript-backed signal rows, and a selected-detail evidence panel.

### 03:20
**Objective:** Build the Consumer Voice Explorer so transcript-backed signals are searchable, explainable, and commercially contextualized  
**What I did:** Implemented the Consumer Voice Explorer. Added working filter controls for brand, subcategory, retailer availability, signal category, theme, sentiment, rating band, region, gender, primary archetype, age bucket, and transcript/product/signal search. Flattened signals into selectable evidence-backed signal rows, sorted primarily by confidence and rating. Built the selected transcript detail panel to show product, brand, rating, sentiment, purchase intent, price and price tier, retailer availability, reviewer archetype, region, age bucket, reviewer tier, extracted themes, grouped signals, selected evidence snippet, transcript summary, and supporting brand/product benefit and pain-point rates.
**Observations:** Flattening nested signals into row-level evidence makes the transcript layer much easier to browse than keeping the original review structure intact. The explorer now demonstrates explainable enrichment clearly because every visible signal is tied back to a specific snippet and reviewer/product context. Adding aggregate brand/product rates beside the transcript detail also helps bridge the gap between individual evidence and broader commercial interpretation.  
**Decision:** Keep the explorer focused on transcript-backed signal rows rather than trying to support every possible review-level browsing mode. Continue using deterministic filters and evidence-first layout, and leave Commercial Context disabled until the strongest joined comparison features are ready.  
**Why:** This creates a credible evidence workspace that contains transcript-backed signals, filtering, browsing, and explainability, while staying tightly within scope. It also ensures the most important user journey after the landing page is working before adding heavier commercial comparison modules.  
**Next:** Build the Commercial Context section, especially the positioning-vs-reviewer-reality feature and grouped commercial comparison tables.

### 03:50
**Objective:** Build the Commercial Context section so the app clearly joins transcript evidence with catalogue, pricing, retailer, and brand intelligence  
**What I did:** Implemented the Commercial Context section. Added the Positioning vs Reviewer Reality feature with a lead opportunity summary and a brand-by-dimension gap table showing reviewer mention rate, reviewed-category baseline, priority, and status. Added a Commercial Aggregation Layer table selector covering brand, product, retailer availability, category, rating band, price tier, market maturity, packaging type, and product label. Added a What To Investigate Next area with three evidence-backed recommendation tiles sourced. Added Price and Positioning Checks with one row per brand, including dominant price tier, average price, benefit and pain-point rates, would-buy-after-trying, and status.
**Observations:** This section is where the dashboard becomes most commercially useful rather than merely descriptive. The positioning-gap table directly answers the brief’s key question about whether reviewer language aligns with how products and brands appear positioned, while the grouped aggregation tables and pricing checks add category and competitor context without requiring unsupported sales or live retail data. The recommendation tiles also help convert analysis into something closer to an action-oriented brand or category review.  
**Decision:** Keep Commercial Context centered on a few strong deterministic views: positioning gaps, grouped comparison tables, pricing checks, and recommendation tiles. Avoid adding any broader “suite” functionality, real-time language, or speculative analytics beyond what is explicitly supported by the processed JSON artifacts.  
**Why:** This satisfies the requirement for a brand-facing commercial insight feature that joins transcript/user signals with product, retail, and brand intelligence, while keeping the implementation credible, explainable, and achievable within the timebox. It also completes the intended three-part app structure without overextending into unsupported features.  
**Next:** Final polish: improve spacing and visual consistency, sanity-check filters and edge cases, verify deployed behavior, and prepare README plus submission notes.


### 04:20
**Objective:** Pause with a concrete restart plan
**What I did:** Wrote a short checklist for the morning: finish app views, clean up UI with CSS, wire filters, add evidence panel, deploy, prepare submission notes, and continue writing up the working log.
**Observations:** The highest risk is spending too long polishing visuals instead of reaching hosted completion.
**Decision:** Tomorrow morning is for app assembly and deployment first; polish only after live URL exists.
**Why:** Hosted working app is the core deliverable.
**Next:** Resume with fresh eyes and build the UI.

### 10:00
**Objective:** Use Next.js and Tailwind CSS to turn the application into a polished page rather than a raw data dump
**What I did:** Structured the landing page in Next.js and used Tailwind CSS utilities to style the Overview content with a dark dashboard shell, card-based layout, responsive grids, typography hierarchy, spacing, badges, borders, and accent colors. Applied consistent visual treatment across the header, KPI cards, signal bars, summary lists, comparison table, and opportunity card so the page reads like a productized dashboard rather than a collection of components.  
**Observations:** Even with relatively simple components, layout and styling make a large difference to perceived quality and usability. Color, font hierarchy, and spacing help separate executive summary content from supporting detail, making the commercial story easier to scan quickly.  
**Decision:** Use Tailwind for fast, consistent styling and keep the visual system restrained: dark background, muted supporting text, clear card boundaries, and selective accent colors for positive, negative, and contextual signals.  
**Why:** This is the fastest way to achieve a polished hosted result within the timebox while keeping the UI readable, credible, and aligned with the Breakthrough Suite-inspired direction.  
**Next:** Do the same with the Consumer Voice Explorer section.

### 11:40
**Objective:** Set up the deployment foundation early by preparing a live VPS hosting path with Docker, Caddy, and a public domain with Hetzner.
**What I did:** Pushed the repo and started configuring the app for live hosting on a VPS using Docker for containerization and Caddy as the reverse proxy and HTTPS layer. Prepared the deployment approach so the application can be attached to a public domain and exposed through a shareable hosted URL.  
**Observations:** Infrastructure and domain issues can easily consume the final hour if left too late, especially when container networking, reverse proxy routing, and public access all need to work together.  
**Decision:** Treat live deployment setup as part of the core build, not a final polish step. Prioritize getting the Docker + Caddy + domain path working so the app can be deployed to a VPS.  
**Why:** A public hosted URL is a required deliverable.  
**Next:** Write up README.md and Submission Notes

### 12:10
