import Head from "next/head";
import { dashboardData } from "../lib/dashboardData";
import type {
  CommercialBrandGroup,
  CommercialGroupRecord,
  PositioningOpportunity,
  SignalCount,
} from "../types/dashboard";

const signalGroupLabels: Record<string, string> = {
  benefits: "Benefits",
  painPoints: "Pain Points",
  occasions: "Occasions",
  marketContext: "Market Context",
};

const signalGroupAccents: Record<string, string> = {
  benefits: "#39d98a",
  painPoints: "#ff9f43",
  occasions: "#8ea7ff",
  marketContext: "#41d7e7",
};

const tabs = ["Overview", "Consumer Voice", "Commercial Context"];

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) {
    return "No data";
  }
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "No transcript evidence";
  }
  return `${Math.round(value * 100)}%`;
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "No data";
  }
  return formatNumber(value, 1);
}

function truncate(value: string, length = 150) {
  if (!value || value.length <= length) {
    return value;
  }
  return `${value.slice(0, length).trim()}...`;
}

function MetricCard({
  title,
  value,
  detail,
  accent,
}: {
  title: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-header">
        <span className="accent-dot" style={{ background: accent }} />
        <span>{title}</span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function RateBar({
  label,
  value,
  count,
  accent,
}: {
  label: string;
  value: number | null;
  count: number | null;
  accent: string;
}) {
  const width = value === null ? 0 : Math.max(2, Math.round(value * 100));

  return (
    <div className="rate-row">
      <div className="rate-label">
        <span>{label}</span>
        <span>
          {formatPercent(value)}
          {count !== null ? ` · ${count} mentions` : ""}
        </span>
      </div>
      <div className="bar-track" aria-hidden="true">
        <div
          className="bar-fill"
          style={{ width: `${width}%`, background: accent }}
        />
      </div>
    </div>
  );
}

function SignalList({
  title,
  items,
  accent,
}: {
  title: string;
  items: SignalCount[];
  accent: string;
}) {
  return (
    <div className="signal-list">
      <h3>{title}</h3>
      <div className="signal-items">
        {items.slice(0, 4).map((item) => (
          <div className="signal-item" key={item.label}>
            <span className="signal-name">
              <span className="mini-dot" style={{ background: accent }} />
              {item.label}
            </span>
            <span className="signal-meta">
              {item.count} · {formatPercent(item.shareOfReviews)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandComparisonTable({ brands }: { brands: CommercialBrandGroup[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Role</th>
            <th>Reviews</th>
            <th>Benefit</th>
            <th>Pain</th>
            <th>Avg Rating</th>
            <th>BTS</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.brand}>
              <td>
                <strong>{brand.brand}</strong>
              </td>
              <td>
                <span className="role-pill">{brand.transcriptCoverageRole}</span>
              </td>
              <td>{brand.reviewCount}</td>
              <td>{formatPercent(brand.mentionRates.benefits)}</td>
              <td>{formatPercent(brand.mentionRates.painPoints)}</td>
              <td>{formatScore(brand.averageRating)}</td>
              <td>
                <span className="score-pill">
                  {formatScore(brand.breakthroughScore)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommercialOpportunityCard({
  opportunity,
}: {
  opportunity: PositioningOpportunity | undefined;
}) {
  if (!opportunity) {
    return (
      <section className="card opportunity-card">
        <p>No commercial opportunity signal is available.</p>
      </section>
    );
  }

  const evidence = opportunity.transcriptEvidence;
  const productMatches =
    opportunity.structuredEvidence.productMatches
      .map((item) => item.productName)
      .slice(0, 3)
      .join(", ") || "No structured product evidence";

  return (
    <section className="card opportunity-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">Commercial Opportunity Signal</span>
          <h2>{opportunity.status}</h2>
        </div>
        <span className="priority-pill">
          Priority {formatScore(opportunity.priorityScore)}
        </span>
      </div>

      <div className="opportunity-grid">
        <div>
          <p className="opportunity-statement">
            <strong>{opportunity.brand}</strong> shows a{" "}
            <strong>{opportunity.dimension}</strong> gap between catalogue
            positioning and reviewer language.
          </p>
          <div className="evidence-lines">
            <p>
              Reviewer mention rate is{" "}
              <strong>{formatPercent(opportunity.reviewerMentionRate)}</strong>{" "}
              across <strong>n={opportunity.reviewCount}</strong> linked
              reviews.
            </p>
            <p>
              Structured positioning score is{" "}
              <strong>{formatPercent(opportunity.structuredPositioningScore)}</strong>
              , versus a reviewed-category baseline of{" "}
              <strong>{formatPercent(opportunity.reviewedCategoryBaselineRate)}</strong>.
            </p>
            <p>Structured product evidence: {productMatches}.</p>
          </div>
        </div>

        <dl className="opportunity-metrics">
          <div>
            <dt>Brand</dt>
            <dd>{opportunity.brand}</dd>
          </div>
          <div>
            <dt>Dimension</dt>
            <dd>{opportunity.dimension}</dd>
          </div>
          <div>
            <dt>Delta vs Positioning</dt>
            <dd>{formatPercent(opportunity.deltaVsStructuredPositioning)}</dd>
          </div>
          <div>
            <dt>Delta vs Category</dt>
            <dd>{formatPercent(opportunity.deltaVsReviewedCategory)}</dd>
          </div>
        </dl>
      </div>

      {evidence ? (
        <blockquote>
          <span>Transcript evidence</span>
          {truncate(evidence.snippet, 260)}
        </blockquote>
      ) : (
        <blockquote>
          <span>Transcript evidence</span>
          No transcript evidence is available for this signal.
        </blockquote>
      )}
    </section>
  );
}

function OverviewSection({ overview }: { overview: CommercialGroupRecord }) {
  const coverage = dashboardData.validation.coverage;
  const kpis = dashboardData.kpis;
  const topBenefit = overview.topBenefits[0];
  const topPainPoint = overview.topPainPoints[0];
  const topOpportunity =
    dashboardData.commercialAggregationLayer.insightFeature.topOpportunities[0];

  return (
    <section className="overview-section" aria-labelledby="overview-title">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 id="overview-title">Retail intelligence from evidence-backed signals</h1>
        </div>
        <p>
          Rates are normalized across <strong>n={overview.reviewCount}</strong>{" "}
          transcript-backed reviews. Catalogue-only brands remain visible as
          competitive context.
        </p>
      </div>

      <div className="metric-grid">
        <MetricCard
          title="Transcript Coverage"
          value={`${coverage.reviewedProducts}/${kpis.products}`}
          detail={`${coverage.brandsWithTranscripts} of ${kpis.brands} brands have review evidence`}
          accent="#41d7e7"
        />
        <MetricCard
          title="Average Rating"
          value={formatScore(kpis.averageRating)}
          detail={`Based on n=${kpis.transcripts} transcript-linked reviews`}
          accent="#8ea7ff"
        />
        <MetricCard
          title="Would Buy After Trying"
          value={formatPercent(kpis.wouldBuyAfterTryingRate)}
          detail="Purchase intent from review metadata"
          accent="#39d98a"
        />
        <MetricCard
          title="Positive Sentiment"
          value={formatPercent(kpis.positiveSentimentShare)}
          detail="Sentiment skews positive; inspect pain signals too"
          accent="#ffcc66"
        />
        <MetricCard
          title="Top Benefit Signal"
          value={topBenefit?.label ?? "No data"}
          detail={
            topBenefit
              ? `${topBenefit.count} mentions · ${formatPercent(
                  topBenefit.shareOfReviews
                )}`
              : "No benefit signals available"
          }
          accent="#39d98a"
        />
        <MetricCard
          title="Top Pain Point"
          value={topPainPoint?.label ?? "No data"}
          detail={
            topPainPoint
              ? `${topPainPoint.count} mentions · ${formatPercent(
                  topPainPoint.shareOfReviews
                )}`
              : "No pain signals available"
          }
          accent="#ff9f43"
        />
      </div>

      <div className="overview-grid">
        <section className="card signal-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Consumer Signal Distribution</span>
              <h2>Share of reviews mentioning each signal group</h2>
            </div>
            <span className="sample-pill">n={overview.reviewCount}</span>
          </div>

          <div className="rate-stack">
            {Object.entries(overview.mentionRates).map(([key, value]) => (
              <RateBar
                key={key}
                label={signalGroupLabels[key] ?? key}
                value={value}
                count={overview.mentionCounts[key as keyof typeof overview.mentionCounts]}
                accent={signalGroupAccents[key] ?? "#8ea7ff"}
              />
            ))}
          </div>

          <div className="signal-summary-grid">
            <SignalList
              title="Top Benefits"
              items={overview.topBenefits}
              accent="#39d98a"
            />
            <SignalList
              title="Top Pain Points"
              items={overview.topPainPoints}
              accent="#ff9f43"
            />
            <SignalList
              title="Top Occasions"
              items={overview.topOccasions}
              accent="#8ea7ff"
            />
            <SignalList
              title="Market Context"
              items={overview.topMarketContext}
              accent="#41d7e7"
            />
          </div>
        </section>

        <section className="card brand-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Brand Signal Comparison</span>
              <h2>Reviewed brands and catalogue-only context</h2>
            </div>
          </div>
          <BrandComparisonTable
            brands={dashboardData.commercialAggregationLayer.byBrand}
          />
        </section>
      </div>

      <CommercialOpportunityCard opportunity={topOpportunity} />
    </section>
  );
}

export default function Home() {
  const overview = dashboardData.commercialAggregationLayer.overview;
  const summary = `${dashboardData.kpis.transcripts} transcripts | ${dashboardData.kpis.products} products | ${dashboardData.kpis.brands} brands | ${dashboardData.kpis.reviewedProducts} reviewed products`;

  return (
    <>
      <Head>
        <title>RGC Retail Intelligence Dashboard</title>
        <meta
          name="description"
          content="Consumer voice, product context, and brand positioning signals."
        />
      </Head>

      <main className="page-shell">
        <header className="app-header">
          <div className="header-main">
            <div>
              <span className="eyebrow">RGC Assessment Module</span>
              <h1>RGC Retail Intelligence Dashboard</h1>
              <p>Consumer voice, product context, and brand positioning signals</p>
            </div>
            <div className="status-block">
              <span className="status-pill">Processed dataset</span>
              <span>{summary}</span>
            </div>
          </div>

          <nav className="tabs" aria-label="Dashboard sections">
            {tabs.map((tab) => (
              <button
                aria-current={tab === "Overview" ? "page" : undefined}
                className={tab === "Overview" ? "active" : ""}
                disabled={tab !== "Overview"}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        <OverviewSection overview={overview} />
      </main>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
          background: #0a0d14;
          color: #f7fafc;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        :global(button),
        :global(input),
        :global(select) {
          font: inherit;
        }

        .page-shell {
          min-height: 100vh;
          padding: 24px;
          background:
            linear-gradient(180deg, rgba(18, 24, 38, 0.92), rgba(10, 13, 20, 1)),
            #0a0d14;
        }

        .app-header,
        .overview-section {
          width: min(1400px, 100%);
          margin: 0 auto;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 10;
          padding: 18px 0 14px;
          background: rgba(10, 13, 20, 0.94);
          border-bottom: 1px solid rgba(148, 163, 184, 0.16);
        }

        .header-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .header-main h1,
        .section-title-row h1,
        .card h2 {
          margin: 0;
          letter-spacing: 0;
        }

        .header-main h1 {
          margin-top: 6px;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.04;
        }

        .header-main p,
        .section-title-row p,
        .metric-card p,
        .evidence-lines p {
          color: #9aa6b5;
        }

        .header-main p {
          margin: 10px 0 0;
          font-size: 15px;
        }

        .eyebrow {
          color: #8bd3ff;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          color: #a8b3c4;
          font-size: 13px;
          text-align: right;
        }

        .status-pill,
        .sample-pill,
        .priority-pill,
        .score-pill,
        .role-pill {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 999px;
          padding: 5px 10px;
          color: #dbeafe;
          background: rgba(15, 23, 42, 0.88);
          white-space: nowrap;
        }

        .status-pill {
          color: #b7f7cc;
          border-color: rgba(57, 217, 138, 0.38);
          background: rgba(57, 217, 138, 0.1);
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-top: 18px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tabs button {
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 999px;
          padding: 8px 14px;
          color: #9aa6b5;
          background: rgba(15, 23, 42, 0.66);
          cursor: default;
          white-space: nowrap;
        }

        .tabs button.active {
          color: #ffffff;
          border-color: rgba(65, 215, 231, 0.44);
          background: rgba(65, 215, 231, 0.12);
        }

        .tabs button:disabled {
          opacity: 0.64;
        }

        .overview-section {
          padding: 34px 0 56px;
        }

        .section-title-row {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .section-title-row h1 {
          margin-top: 8px;
          max-width: 760px;
          font-size: clamp(28px, 4vw, 46px);
          line-height: 1.06;
        }

        .section-title-row p {
          max-width: 420px;
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .metric-card,
        .card {
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.78);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.22);
        }

        .metric-card {
          min-height: 154px;
          padding: 16px;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a8b3c4;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .accent-dot,
        .mini-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          flex: 0 0 auto;
        }

        .metric-card strong {
          display: block;
          min-height: 70px;
          margin-top: 14px;
          color: #ffffff;
          font-size: clamp(24px, 2.6vw, 34px);
          line-height: 1.03;
          overflow-wrap: anywhere;
        }

        .metric-card p {
          margin: 10px 0 0;
          font-size: 13px;
          line-height: 1.4;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(460px, 0.85fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        .card {
          padding: 18px;
        }

        .card-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .card h2 {
          margin-top: 5px;
          font-size: 19px;
          line-height: 1.25;
        }

        .rate-stack {
          display: grid;
          gap: 14px;
        }

        .rate-row {
          display: grid;
          gap: 8px;
        }

        .rate-label {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #dbe4f0;
          font-size: 13px;
        }

        .rate-label span:last-child {
          color: #a8b3c4;
          text-align: right;
        }

        .bar-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.13);
        }

        .bar-fill {
          height: 100%;
          border-radius: inherit;
        }

        .signal-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
        }

        .signal-list h3 {
          margin: 0 0 10px;
          color: #f8fafc;
          font-size: 14px;
        }

        .signal-items {
          display: grid;
          gap: 9px;
        }

        .signal-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          color: #cbd5e1;
          font-size: 13px;
        }

        .signal-name {
          display: inline-flex;
          align-items: flex-start;
          gap: 8px;
          min-width: 0;
        }

        .mini-dot {
          width: 6px;
          height: 6px;
          margin-top: 6px;
        }

        .signal-meta {
          color: #8d99aa;
          white-space: nowrap;
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 8px;
        }

        table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
          font-size: 13px;
        }

        th,
        td {
          padding: 11px 12px;
          text-align: left;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        th {
          color: #8d99aa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        td {
          color: #dbe4f0;
          white-space: nowrap;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        .role-pill,
        .score-pill {
          min-height: 24px;
          padding: 3px 8px;
          color: #cdd8e8;
          font-size: 12px;
        }

        .opportunity-card {
          padding: 20px;
        }

        .opportunity-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 0.35fr);
          gap: 18px;
        }

        .opportunity-statement {
          max-width: 820px;
          margin: 0;
          color: #f8fafc;
          font-size: 20px;
          line-height: 1.45;
        }

        .evidence-lines {
          display: grid;
          gap: 8px;
          margin-top: 14px;
        }

        .evidence-lines p {
          margin: 0;
          font-size: 14px;
          line-height: 1.48;
        }

        .opportunity-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 0;
        }

        .opportunity-metrics div {
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 8px;
          padding: 10px;
          background: rgba(2, 6, 23, 0.24);
        }

        .opportunity-metrics dt {
          color: #8d99aa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .opportunity-metrics dd {
          margin: 5px 0 0;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 700;
        }

        blockquote {
          margin: 18px 0 0;
          border-left: 3px solid #41d7e7;
          border-radius: 6px;
          padding: 12px 14px;
          color: #cbd5e1;
          background: rgba(65, 215, 231, 0.08);
          font-size: 14px;
          line-height: 1.55;
        }

        blockquote span {
          display: block;
          margin-bottom: 5px;
          color: #8bd3ff;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        @media (max-width: 1180px) {
          .metric-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .page-shell {
            padding: 16px;
          }

          .header-main,
          .section-title-row,
          .card-heading,
          .opportunity-grid {
            flex-direction: column;
            display: flex;
            align-items: flex-start;
          }

          .status-block {
            align-items: flex-start;
            text-align: left;
          }

          .metric-grid,
          .signal-summary-grid,
          .opportunity-metrics {
            grid-template-columns: 1fr;
          }

          .metric-card strong {
            min-height: auto;
          }
        }
      `}</style>
    </>
  );
}
