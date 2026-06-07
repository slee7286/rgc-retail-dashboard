# Submission Notes

## What I Built

I built a hosted single-page, three section dashboard for the RGC assessment dataset. The goal is to help a brand, product, retail, or insights team understand what consumers are saying, how those signals connect to product and brand positioning, and what commercial tensions are worth investigating.

The app has three main sections:

- Overview
- Consumer Voice Explorer
- Commercial Context

The dashboard uses preprocessed static JSON artifacts generated from the four provided files. The frontend is built with Next.js, React, TypeScript, and Tailwind CSS. The data pipeline is in `scripts/preprocess.py`, and deployment is prepared through Docker Compose with Caddy.

## How To Use The App

Start with the Overview tab. It gives the executive summary: transcript coverage, average rating, purchase intent, sentiment, top positive signals, top frustrations, signal distribution, brand comparison, and a headline commercial opportunity.

Use the Consumer Voice Explorer to inspect transcript-backed evidence. The filters let a user narrow by brand, region, gender, age bucket, reviewer archetype, subcategory, retailer availability, signal category, theme, sentiment, rating band, and search text. Selecting a signal row opens a detail panel with product context, reviewer context, extracted themes, grouped signals, commercial context, transcript summary, and expandable transcript evidence.

Use Commercial Context for the strongest brand-facing analysis. This section compares structured product and brand positioning with reviewer language, shows ranked opportunities, provides grouped aggregation tables, and includes price-positioning checks. Hover notes explain derived metrics such as Delta vs Positioning and Priority score.

## Main Features

The preprocessing pipeline joins:

- transcripts to users on `reviewId` and `personId`
- transcripts to products on `productId`
- products to brands on product `brand` and brand `brandName`

It then creates:

- transcript-user enriched rows
- product aggregates
- brand aggregates
- filter options
- validation reports
- commercial aggregation tables
- positioning-vs-reviewer-reality gaps

Transcript enrichment is deterministic and explainable. Signals are generated from keyword/phrase rules across themes such as taste, health/function, occasion, mixer/pairing, packaging/format, and value/availability. Suggested signals include positive themes, frustrations, usage occasions, purchase drivers, shopper needs, product preferences, routines, co-consumption habits, complaints, retailer mentions, competitor mentions, and comparison mentions.

Every suggested signal shown in the UI includes an evidence snippet. Confidence labels are lightweight heuristic scores based on matched phrases and supporting review metadata. They are not model certainty, nor should they be taken as absolution confidence measures. They are simply a gauge for confidence based on how much evidence is available.

## Key Data Relationships And Insights

The dataset is small but useful for directional insight. There are 130 transcript rows, 130 user rows, 35 products, and 9 brands. Transcript coverage is intentionally partial: 15 products and 4 brands have transcript evidence, while 20 products and 5 brands are catalogue-only context.

Overall consumer response in the transcript-backed sample is positive. The average rating is 4.23, would-buy-after-trying rate is 84.2%, and positive sentiment share is 83.8%.

The strongest positive signals are taste and sensory experience. "Strong flavour appeal" appears in 79 reviews, or 60.8% of transcript-backed reviews. "Good fizz" appears in 48.5%, and "Refreshing taste" appears in 47.7%.

The main frustrations are more specific and lower-frequency. "Bitter, tart, or sour edge" appears in 19.2% of reviews. "Expectation gap" and "Taste rejection" each appear in 13.1%. This suggests the category performs well overall, but individual product experience can still break down around flavour sharpness, sweetness, or whether the product works better as a mixer than standalone drink.

Usage context is commercially important. Health routines and relaxation/wind-down each appear in 28.5% of reviews, while mixer-with-spirits appears in 26.9%. This supports a dashboard structure that separates consumer voice from product positioning, because the same category can serve wellness, adult soft drink, mixer, and alcohol-alternative occasions.

The strongest commercial feature is Positioning vs Reviewer Reality. It compares structured product/brand positioning with mapped transcript signals. For example, Double Dutch is strongly positioned around Low sugar / clean label in structured metadata, but reviewer mention coverage is low: reviewer mention rate is 2.9% against a structured positioning score of 100%, creating a large negative Delta vs Positioning. This does not mean the positioning is wrong; it means the transcripts do not currently show consumers talking about that claim at the same level as the catalogue positioning.

Price-positioning checks also help connect transcript evidence with catalogue context. SKIP is marked as "Premium position supported by reviews": it has premium catalogue positioning, 25 linked reviews, 100% positive signal mention rate, 16% frustration mention rate, and 89.5% would-buy-after-trying rate. Catalogue-only brands such as Trip, DASH, Hip Pop, Agua de Madre, and Dalston's remain visible as competitive pricing and category context, but transcript-derived fields are shown as no transcript evidence rather than zero.

## Assumptions And Tradeoffs

I treated missing transcript coverage as intentional. Catalogue-only products and brands are retained for category, competitor, pricing, retailer, product-label, and brand-score context.

I chose deterministic enrichment rather than opaque NLP or model calls. This made the output easier to verify, easier to explain, and safer within the timebox.

I used static JSON artifacts rather than a database. Given the dataset size, this avoids unnecessary backend complexity and keeps the app fast and reliable.

I did not build authentication, saved workflows, exports, editable dashboards, or backend query logic. Those were not central to the brief and would have reduced time available for the actual insight experience.

I avoided unsupported analytics such as real-time data, sales performance, inventory status, and true theme momentum. The UI says "Processed dataset" because the data is static and preprocessed.

The current signal extraction is useful but imperfect. Some transcript language is ambiguous, and keyword methods can miss nuance or pick up context that a human would interpret differently. For that reason, every signal is presented with evidence and should be read as directional.

## AI And Tool Usage

I used Codex as a coding and writing assistant during the assessment. I used it to help implement the preprocessing pipeline, React/Tailwind UI, documentation, and final polish. I directed the architecture, scope, feature choices, data assumptions, and commercial framing based on the brief and exploratory data review.

I also used AI assistance when shaping the transcript signals and UI style direction. The final extraction logic is deterministic code in `scripts/preprocess.py`, not runtime model inference.

I verified the output through:

- join validation reports generated by preprocessing
- spot-checking transcript snippets against suggested signals
- keeping catalogue-only rows visible without treating them as data errors
- checking that every displayed transcript signal has supporting evidence
- running frontend TypeScript checks with `npx tsc --noEmit`
- running a production build with `npm run build`
- reviewing the UI for unsupported claims such as live data or sales analytics

## What I Would Improve With More Time

I would add a better signal QA loop. The current rules are transparent, but I would create a small labelled validation set and measure false positives/false negatives for each signal family. This will refine signals and make generating conclusions from signals easier.

I would improve current bugs in the web app design, such as the CSS error of hover notes being obscured by other elements. I would also improve other styling elements.

I would add stronger sentiment mapping at signal level. Right now signals are grouped commercially, but a richer version could distinguish positive taste mentions from negative taste mentions more precisely. Another option is to implement NLP sentiment analysis using vector embeddings and LLMs/neural networks.

I would add more complex UI features such as live data experience, authentication, user accounts, saved workflows, export flows, editable dashboards, momentum chart, interactive geospatial maps and graphs, and more visual aspects that makes the dashboard feel more complete and easier to interpret.

I would add time-series analysis only if the data supports it. The current dataset has dates, but not enough validated temporal structure to justify a real momentum chart.

I would incorporate other data for the brands, including the Breakthrough Score, Momentum Score, Popularity Score, Archetype, and social media handles. More time will allow me to do a more comprehensive analysis of these three overarching scores compared to the individual transcript and product data.

I would improve product and brand drilldowns. A next version could include dedicated brand/product pages, but I kept the assessment app single-page to reduce routing and deployment complexity.

I would include more complex mappings between transcript/user signals with product, retail, brand, and category intelligence.

I would add richer retailer context if more data were available. Useful additions would include retailer-specific distribution, shelf placement, sales velocity, pricing history, promotion activity, and review volume by retailer.

I would also want access to commercial outcome data such as repeat purchase, basket attachment, sell-through, trial source, and actual SKU performance. That would allow the dashboard to test whether transcript signals predict commercial outcomes rather than only describing consumer language.

Finally, I would optimize data loading. The app currently imports static JSON directly, which is acceptable for this small dataset, but a larger production version should fetch artifacts or query an API to reduce initial bundle size.