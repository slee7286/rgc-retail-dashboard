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
**Decision:** Prioritise an end-to-end working app with 2–3 strong insight views instead of many half-finished features. Plan to use Docker with Caddy VPS to host application.  
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

