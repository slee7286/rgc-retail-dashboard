import Head from "next/head";
import { useMemo, useState } from "react";
import { dashboardData } from "../lib/dashboardData";
import type {
  CommercialBrandGroup,
  CommercialGroupRecord,
  PositioningOpportunity,
  PricePositioningCheck,
  Signal,
  SignalCategory,
  SignalCount,
  TranscriptRow,
} from "../types/dashboard";

type ActiveSection = "Overview" | "Consumer Voice" | "Commercial Context";

type SignalRow = {
  id: string;
  row: TranscriptRow;
  category: SignalCategory;
  signal: Signal;
};

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

const tabs: ActiveSection[] = ["Overview", "Consumer Voice", "Commercial Context"];
const implementedTabs: ActiveSection[] = [
  "Overview",
  "Consumer Voice",
  "Commercial Context",
];

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

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "No data";
  }
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function formatCategoryLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function getRatingBand(rating: number | null | undefined) {
  if (rating === null || rating === undefined) {
    return "No rating";
  }
  if (rating >= 4) {
    return "High rating (4-5)";
  }
  if (rating === 3) {
    return "Mid rating (3)";
  }
  return "Low rating (1-2)";
}

function flattenTranscriptSignals(rows: TranscriptRow[]): SignalRow[] {
  return rows.flatMap((row) =>
    (Object.entries(row.signals) as [SignalCategory, Signal[]][]).flatMap(
      ([category, signals]) =>
        signals.map((signal, index) => ({
          category,
          id: `${row.reviewId}-${category}-${signal.label}-${index}`,
          row,
          signal,
        }))
    )
  );
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
          {count !== null ? ` - ${count} mentions` : ""}
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
              {item.count} - {formatPercent(item.shareOfReviews)}
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

function CommercialRateTable({
  rows,
  title,
}: {
  rows: CommercialGroupRecord[];
  title: string;
}) {
  return (
    <div>
      <h3 className="subsection-heading">{title}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Products</th>
              <th>Reviews</th>
              <th>Avg Rating</th>
              <th>Would Buy</th>
              <th>Benefit</th>
              <th>Pain</th>
              <th>Occasion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.group}>
                <td>
                  <strong>{row.group}</strong>
                </td>
                <td>{row.productCount}</td>
                <td>{row.reviewCount}</td>
                <td>{formatScore(row.averageRating)}</td>
                <td>{formatPercent(row.wouldBuyAfterTryingRate)}</td>
                <td>{formatPercent(row.mentionRates.benefits)}</td>
                <td>{formatPercent(row.mentionRates.painPoints)}</td>
                <td>{formatPercent(row.mentionRates.occasions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PositioningGapTable({
  opportunities,
}: {
  opportunities: PositioningOpportunity[];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Dimension</th>
            <th>Status</th>
            <th>Reviews</th>
            <th>Reviewer Rate</th>
            <th>Baseline</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.slice(0, 10).map((item) => (
            <tr key={`${item.brand}-${item.dimension}`}>
              <td>
                <strong>{item.brand}</strong>
              </td>
              <td>{item.dimension}</td>
              <td>
                <span className="role-pill">{item.status}</span>
              </td>
              <td>{item.reviewCount}</td>
              <td>{formatPercent(item.reviewerMentionRate)}</td>
              <td>{formatPercent(item.reviewedCategoryBaselineRate)}</td>
              <td>
                <span className="score-pill">
                  {formatScore(item.priorityScore)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceCheckTable({ checks }: { checks: PricePositioningCheck[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Status</th>
            <th>Tier</th>
            <th>Products</th>
            <th>Reviews</th>
            <th>Avg Price</th>
            <th>Benefit</th>
            <th>Pain</th>
            <th>Would Buy</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.brand}>
              <td>
                <strong>{check.brand}</strong>
              </td>
              <td>
                <span className="role-pill">{check.status}</span>
              </td>
              <td>{check.dominantPriceTier}</td>
              <td>{check.productCount}</td>
              <td>{check.reviewCount}</td>
              <td>{formatCurrency(check.averagePrice)}</td>
              <td>{formatPercent(check.benefitMentionRate)}</td>
              <td>{formatPercent(check.painPointMentionRate)}</td>
              <td>{formatPercent(check.wouldBuyAfterTryingRate)}</td>
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
              ? `${topBenefit.count} mentions - ${formatPercent(
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
              ? `${topPainPoint.count} mentions - ${formatPercent(
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

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="detail-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConsumerVoiceSection() {
  const [selectedSignalId, setSelectedSignalId] = useState<string>("");
  const [filters, setFilters] = useState({
    ageBucket: "All",
    archetype: "All",
    brand: "All",
    gender: "All",
    region: "All",
    subcategory: "All",
    retailer: "All",
    signalCategory: "All",
    theme: "All",
    sentiment: "All",
    ratingBand: "All",
    search: "",
  });

  const signalRows = useMemo(
    () => flattenTranscriptSignals(dashboardData.transcriptUserEnriched),
    []
  );

  const ratingBands = useMemo(
    () =>
      dashboardData.commercialAggregationLayer.byRatingBand.map(
        (item) => item.group
      ),
    []
  );

  const genderOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dashboardData.transcriptUserEnriched
            .map((row) => row.gender)
            .filter(Boolean)
        )
      ).sort(),
    []
  );

  const ageBucketOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dashboardData.transcriptUserEnriched
            .map((row) => row.ageBucket)
            .filter(Boolean)
        )
      ).sort(),
    []
  );

  const brandGroupsByBrand = useMemo(
    () =>
      new Map(
        dashboardData.commercialAggregationLayer.byBrand.map((brand) => [
          brand.brand,
          brand,
        ])
      ),
    []
  );

  const productGroupsById = useMemo(
    () =>
      new Map(
        dashboardData.commercialAggregationLayer.byProduct.map((product) => [
          product.productId,
          product,
        ])
      ),
    []
  );

  const filteredSignalRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return signalRows
      .filter(({ category, row, signal }) => {
        if (filters.brand !== "All" && row.brand !== filters.brand) {
          return false;
        }
        if (filters.region !== "All" && row.region !== filters.region) {
          return false;
        }
        if (filters.gender !== "All" && row.gender !== filters.gender) {
          return false;
        }
        if (
          filters.archetype !== "All" &&
          row.primaryArchetype !== filters.archetype
        ) {
          return false;
        }
        if (
          filters.ageBucket !== "All" &&
          row.ageBucket !== filters.ageBucket
        ) {
          return false;
        }
        if (
          filters.subcategory !== "All" &&
          row.subcategory !== filters.subcategory
        ) {
          return false;
        }
        if (
          filters.retailer !== "All" &&
          !row.retailers.includes(filters.retailer)
        ) {
          return false;
        }
        if (
          filters.signalCategory !== "All" &&
          category !== filters.signalCategory
        ) {
          return false;
        }
        if (
          filters.theme !== "All" &&
          !row.themes.some((theme) => theme.theme === filters.theme)
        ) {
          return false;
        }
        if (filters.sentiment !== "All" && row.sentiment !== filters.sentiment) {
          return false;
        }
        if (
          filters.ratingBand !== "All" &&
          getRatingBand(row.rating) !== filters.ratingBand
        ) {
          return false;
        }
        if (!search) {
          return true;
        }

        const searchableText = [
          row.brand,
          row.productName,
          row.subcategory,
          row.summary,
          row.transcriptText,
          row.primaryArchetype,
          row.region,
          signal.label,
          signal.snippet,
          category,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(search);
      })
      .sort((left, right) => {
        if (right.signal.confidence !== left.signal.confidence) {
          return right.signal.confidence - left.signal.confidence;
        }
        return (right.row.rating ?? 0) - (left.row.rating ?? 0);
      });
  }, [filters, signalRows]);

  const visibleSignalRows = filteredSignalRows.slice(0, 80);
  const selectedSignal =
    filteredSignalRows.find((item) => item.id === selectedSignalId) ??
    filteredSignalRows[0];
  const selectedRow = selectedSignal?.row;
  const selectedBrandContext = selectedRow
    ? brandGroupsByBrand.get(selectedRow.brand)
    : undefined;
  const selectedProductContext = selectedRow
    ? productGroupsById.get(selectedRow.productId)
    : undefined;

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      ageBucket: "All",
      archetype: "All",
      brand: "All",
      gender: "All",
      ratingBand: "All",
      region: "All",
      retailer: "All",
      search: "",
      sentiment: "All",
      signalCategory: "All",
      subcategory: "All",
      theme: "All",
    });
    setSelectedSignalId("");
  };

  return (
    <section className="consumer-section" aria-labelledby="consumer-title">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Consumer Voice</span>
          <h1 id="consumer-title">Explore transcript-backed signals</h1>
        </div>
        <p>
          Every row is backed by a deterministic transcript signal and evidence
          snippet. Filters use the actual processed data contract.
        </p>
      </div>

      <section className="card filter-card" aria-label="Consumer voice filters">
        <label>
          Brand
          <select
            value={filters.brand}
            onChange={(event) => updateFilter("brand", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.reviewedBrands.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>
        </label>

        <label>
          Region
          <select
            value={filters.region}
            onChange={(event) => updateFilter("region", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>

        <label>
          Gender
          <select
            value={filters.gender}
            onChange={(event) => updateFilter("gender", event.target.value)}
          >
            <option>All</option>
            {genderOptions.map((gender) => (
              <option key={gender}>{gender}</option>
            ))}
          </select>
        </label>

        <label>
          Archetype
          <select
            value={filters.archetype}
            onChange={(event) => updateFilter("archetype", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.archetypes.map((archetype) => (
              <option key={archetype}>{archetype}</option>
            ))}
          </select>
        </label>

        <label>
          Age bucket
          <select
            value={filters.ageBucket}
            onChange={(event) => updateFilter("ageBucket", event.target.value)}
          >
            <option>All</option>
            {ageBucketOptions.map((ageBucket) => (
              <option key={ageBucket}>{ageBucket}</option>
            ))}
          </select>
        </label>

        <label>
          Subcategory
          <select
            value={filters.subcategory}
            onChange={(event) => updateFilter("subcategory", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.subcategories.map((subcategory) => (
              <option key={subcategory}>{subcategory}</option>
            ))}
          </select>
        </label>

        <label>
          Retailer availability
          <select
            value={filters.retailer}
            onChange={(event) => updateFilter("retailer", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.retailers.map((retailer) => (
              <option key={retailer}>{retailer}</option>
            ))}
          </select>
        </label>

        <label>
          Signal
          <select
            value={filters.signalCategory}
            onChange={(event) =>
              updateFilter("signalCategory", event.target.value)
            }
          >
            <option>All</option>
            {dashboardData.filters.signalCategories.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Theme
          <select
            value={filters.theme}
            onChange={(event) => updateFilter("theme", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.themes.map((theme) => (
              <option key={theme}>{theme}</option>
            ))}
          </select>
        </label>

        <label>
          Sentiment
          <select
            value={filters.sentiment}
            onChange={(event) => updateFilter("sentiment", event.target.value)}
          >
            <option>All</option>
            {dashboardData.filters.sentiments.map((sentiment) => (
              <option key={sentiment}>{sentiment}</option>
            ))}
          </select>
        </label>

        <label>
          Rating band
          <select
            value={filters.ratingBand}
            onChange={(event) => updateFilter("ratingBand", event.target.value)}
          >
            <option>All</option>
            {ratingBands.map((band) => (
              <option key={band}>{band}</option>
            ))}
          </select>
        </label>

        <label className="search-label">
          Search
          <input
            placeholder="Search transcript, product, signal..."
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
        </label>

        <button className="clear-button" type="button" onClick={clearFilters}>
          Clear
        </button>
      </section>

      <div className="consumer-grid">
        <section className="card signal-browser">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Signal List</span>
              <h2>
                Showing {visibleSignalRows.length} of {filteredSignalRows.length}{" "}
                matching signals
              </h2>
            </div>
          </div>

          <div className="signal-row-list">
            {visibleSignalRows.length ? (
              visibleSignalRows.map((item) => (
                <button
                  className={
                    item.id === selectedSignal?.id
                      ? "signal-row active"
                      : "signal-row"
                  }
                  key={item.id}
                  onClick={() => setSelectedSignalId(item.id)}
                  type="button"
                >
                  <span className="signal-row-top">
                    <span className="category-pill">
                      {formatCategoryLabel(item.category)}
                    </span>
                    <span>{item.signal.confidenceLabel}</span>
                  </span>
                  <strong>{item.signal.label}</strong>
                  <span className="signal-snippet">
                    {truncate(item.signal.snippet, 170)}
                  </span>
                  <span className="signal-row-meta">
                    {item.row.brand} - {item.row.productName} - Rating{" "}
                    {formatScore(item.row.rating)}
                  </span>
                </button>
              ))
            ) : (
              <p className="empty-state">
                No transcript signals match these filters.
              </p>
            )}
          </div>
        </section>

        <section className="card transcript-detail">
          {selectedSignal && selectedRow ? (
            <>
              <div className="card-heading">
                <div>
                  <span className="eyebrow">Evidence Detail</span>
                  <h2>{selectedRow.productName}</h2>
                </div>
                <span className="category-pill">
                  {formatCategoryLabel(selectedSignal.category)}
                </span>
              </div>

              <div className="detail-stat-grid">
                <DetailStat label="Brand" value={selectedRow.brand} />
                <DetailStat
                  label="Rating"
                  value={formatScore(selectedRow.rating)}
                />
                <DetailStat label="Sentiment" value={selectedRow.sentiment} />
                <DetailStat
                  label="Would Buy"
                  value={selectedRow.wouldBuyAfterTrying || "No data"}
                />
                <DetailStat
                  label="Price Tier"
                  value={selectedRow.priceTier || "No data"}
                />
                <DetailStat
                  label="Price"
                  value={formatCurrency(selectedRow.price)}
                />
              </div>

              <blockquote>
                <span>Selected signal evidence</span>
                {selectedSignal.signal.snippet || "No snippet available."}
              </blockquote>

              <div className="detail-block">
                <h3>Reviewer Context</h3>
                <div className="chip-row">
                  <span>{selectedRow.primaryArchetype}</span>
                  <span>{selectedRow.region}</span>
                  <span>{selectedRow.ageBucket}</span>
                  <span>{selectedRow.videoReviewerTier}</span>
                </div>
              </div>

              <div className="detail-block">
                <h3>Product Context</h3>
                <p>
                  {selectedRow.subcategory} - {selectedRow.marketMaturity} -{" "}
                  {selectedRow.retailers.length
                    ? selectedRow.retailers.join(", ")
                    : "No retailer metadata"}
                </p>
                <div className="chip-row">
                  {selectedRow.productLabels.slice(0, 8).map((label) => (
                    <span key={label.name}>{label.name}</span>
                  ))}
                </div>
              </div>

              <div className="detail-block">
                <h3>Themes</h3>
                <div className="chip-row">
                  {selectedRow.themes.map((theme) => (
                    <span key={theme.theme}>
                      {theme.theme} ({formatScore(theme.confidence)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-block">
                <h3>Grouped Signals</h3>
                <div className="grouped-signal-list">
                  {(
                    Object.entries(selectedRow.signals) as [
                      SignalCategory,
                      Signal[]
                    ][]
                  )
                    .filter(([, signals]) => signals.length)
                    .map(([category, signals]) => (
                      <div key={category}>
                        <strong>{formatCategoryLabel(category)}</strong>
                        <p>{signals.map((signal) => signal.label).join(", ")}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="detail-block commercial-context-box">
                <h3>Commercial Context</h3>
                <div className="detail-stat-grid compact">
                  <DetailStat
                    label="Brand Benefit Rate"
                    value={formatPercent(
                      selectedBrandContext?.mentionRates.benefits
                    )}
                  />
                  <DetailStat
                    label="Brand Pain Rate"
                    value={formatPercent(
                      selectedBrandContext?.mentionRates.painPoints
                    )}
                  />
                  <DetailStat
                    label="Product Benefit Rate"
                    value={formatPercent(
                      selectedProductContext?.mentionRates.benefits
                    )}
                  />
                  <DetailStat
                    label="Product Pain Rate"
                    value={formatPercent(
                      selectedProductContext?.mentionRates.painPoints
                    )}
                  />
                </div>
              </div>

              <div className="detail-block">
                <h3>Transcript Summary</h3>
                <p>{selectedRow.summary || "No summary available."}</p>
              </div>
            </>
          ) : (
            <p className="empty-state">Select a signal to inspect evidence.</p>
          )}
        </section>
      </div>
    </section>
  );
}

function RecommendationTile({
  opportunity,
  type,
}: {
  opportunity: PositioningOpportunity;
  type: string;
}) {
  const evidence = opportunity.transcriptEvidence;

  return (
    <article className="recommendation-tile">
      <span className="category-pill">{type}</span>
      <h3>
        {opportunity.brand}: {opportunity.dimension}
      </h3>
      <p>{opportunity.status}</p>
      <div className="tile-metrics">
        <span>n={opportunity.reviewCount}</span>
        <span>{formatPercent(opportunity.reviewerMentionRate)} reviewer rate</span>
        <span>Priority {formatScore(opportunity.priorityScore)}</span>
      </div>
      {evidence ? (
        <blockquote>
          <span>Evidence</span>
          {truncate(evidence.snippet, 180)}
        </blockquote>
      ) : null}
    </article>
  );
}

function CommercialContextSection() {
  const commercial = dashboardData.commercialAggregationLayer;
  const [aggregationView, setAggregationView] = useState("byBrand");

  const aggregationRows = useMemo(() => {
    switch (aggregationView) {
      case "byProduct":
        return commercial.byProduct;
      case "byRetailer":
        return commercial.byRetailer;
      case "byCategory":
        return commercial.byCategory;
      case "byRatingBand":
        return commercial.byRatingBand;
      case "priceTier":
        return commercial.byStructuredAttributes.priceTier;
      case "marketMaturity":
        return commercial.byStructuredAttributes.marketMaturity;
      case "packagingType":
        return commercial.byStructuredAttributes.packagingType;
      case "productLabel":
        return commercial.byStructuredAttributes.productLabel;
      case "byBrand":
      default:
        return commercial.byBrand;
    }
  }, [aggregationView, commercial]);

  const aggregationTitle =
    {
      byBrand: "By Brand",
      byCategory: "By Category",
      byProduct: "By Product",
      byRatingBand: "By Rating Band",
      byRetailer: "By Retailer Availability",
      marketMaturity: "By Market Maturity",
      packagingType: "By Packaging Type",
      priceTier: "By Price Tier",
      productLabel: "By Product Label",
    }[aggregationView] ?? "Commercial Aggregates";

  const topOpportunities = commercial.insightFeature.topOpportunities;
  const leadOpportunity = topOpportunities[0];
  const recommendations = topOpportunities.slice(0, 3);

  return (
    <section className="commercial-section" aria-labelledby="commercial-title">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Commercial Context</span>
          <h1 id="commercial-title">Positioning, category context, and watchouts</h1>
        </div>
        <p>
          These views compare structured product and brand context with
          transcript-backed reviewer signals. Counts and rates are directional.
        </p>
      </div>

      <section className="card positioning-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">
              {commercial.insightFeature.featureName}
            </span>
            <h2>{commercial.insightFeature.description}</h2>
          </div>
          <span className="sample-pill">
            {commercial.insightFeature.brandGaps.length} brand-dimension checks
          </span>
        </div>

        {leadOpportunity ? (
          <div className="lead-gap">
            <div>
              <span className="category-pill">{leadOpportunity.status}</span>
              <h3>
                {leadOpportunity.brand} - {leadOpportunity.dimension}
              </h3>
              <p>
                Reviewer mention rate is{" "}
                <strong>{formatPercent(leadOpportunity.reviewerMentionRate)}</strong>{" "}
                against a structured positioning score of{" "}
                <strong>
                  {formatPercent(leadOpportunity.structuredPositioningScore)}
                </strong>
                .
              </p>
            </div>
            <dl className="opportunity-metrics">
              <div>
                <dt>Reviews</dt>
                <dd>{leadOpportunity.reviewCount}</dd>
              </div>
              <div>
                <dt>Baseline</dt>
                <dd>{formatPercent(leadOpportunity.reviewedCategoryBaselineRate)}</dd>
              </div>
              <div>
                <dt>Delta vs Positioning</dt>
                <dd>{formatPercent(leadOpportunity.deltaVsStructuredPositioning)}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{formatScore(leadOpportunity.priorityScore)}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <PositioningGapTable
          opportunities={commercial.insightFeature.brandGaps}
        />
      </section>

      <div className="commercial-grid">
        <section className="card aggregate-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Commercial Aggregation Layer</span>
              <h2>Compare normalized signal rates by business dimension</h2>
            </div>
            <label className="view-select">
              View
              <select
                value={aggregationView}
                onChange={(event) => setAggregationView(event.target.value)}
              >
                <option value="byBrand">Brand</option>
                <option value="byProduct">Product</option>
                <option value="byRetailer">Retailer availability</option>
                <option value="byCategory">Category</option>
                <option value="byRatingBand">Rating band</option>
                <option value="priceTier">Price tier</option>
                <option value="marketMaturity">Market maturity</option>
                <option value="packagingType">Packaging type</option>
                <option value="productLabel">Product label</option>
              </select>
            </label>
          </div>
          <CommercialRateTable rows={aggregationRows} title={aggregationTitle} />
        </section>

        <section className="card recommendation-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">What To Investigate Next</span>
              <h2>Highest-priority evidence-backed watchlist</h2>
            </div>
          </div>
          <div className="recommendation-grid">
            {recommendations.map((opportunity, index) => (
              <RecommendationTile
                key={`${opportunity.brand}-${opportunity.dimension}`}
                opportunity={opportunity}
                type={
                  index === 0
                    ? "Messaging gap"
                    : opportunity.status.includes("validated")
                      ? "Validated strength"
                      : "Watchlist"
                }
              />
            ))}
          </div>
        </section>
      </div>

      <section className="card price-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">Price And Positioning Checks</span>
            <h2>Pricing context alongside benefit, pain, and intent rates</h2>
          </div>
        </div>
        <PriceCheckTable
          checks={commercial.insightFeature.pricePositioningChecks}
        />
      </section>
    </section>
  );
}

export default function Home() {
  const overview = dashboardData.commercialAggregationLayer.overview;
  const summary = `${dashboardData.kpis.transcripts} transcripts | ${dashboardData.kpis.products} products | ${dashboardData.kpis.brands} brands | ${dashboardData.kpis.reviewedProducts} reviewed products`;
  const [activeSection, setActiveSection] = useState<ActiveSection>("Overview");

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
                aria-current={tab === activeSection ? "page" : undefined}
                className={tab === activeSection ? "active" : ""}
                disabled={!implementedTabs.includes(tab)}
                key={tab}
                onClick={() => setActiveSection(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {activeSection === "Overview" ? (
          <OverviewSection overview={overview} />
        ) : activeSection === "Consumer Voice" ? (
          <ConsumerVoiceSection />
        ) : (
          <CommercialContextSection />
        )}
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
        .overview-section,
        .consumer-section,
        .commercial-section {
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
        .role-pill,
        .category-pill {
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
          cursor: pointer;
          white-space: nowrap;
        }

        .tabs button.active {
          color: #ffffff;
          border-color: rgba(65, 215, 231, 0.44);
          background: rgba(65, 215, 231, 0.12);
        }

        .tabs button:disabled {
          cursor: not-allowed;
          opacity: 0.64;
        }

        .overview-section,
        .consumer-section,
        .commercial-section {
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

        .filter-card {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
          gap: 12px;
          align-items: end;
          margin-bottom: 12px;
        }

        .filter-card label {
          display: grid;
          gap: 6px;
          color: #8d99aa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .filter-card select,
        .filter-card input {
          width: 100%;
          min-height: 40px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 8px;
          padding: 8px 10px;
          color: #f8fafc;
          background: rgba(2, 6, 23, 0.52);
          outline: none;
        }

        .filter-card select:focus,
        .filter-card input:focus {
          border-color: rgba(65, 215, 231, 0.62);
        }

        .search-label {
          grid-column: span 2;
        }

        .clear-button {
          min-height: 40px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 8px;
          padding: 8px 14px;
          color: #dbe4f0;
          background: rgba(15, 23, 42, 0.88);
          cursor: pointer;
        }

        .consumer-grid {
          display: grid;
          grid-template-columns: minmax(420px, 0.88fr) minmax(0, 1.12fr);
          gap: 12px;
          align-items: start;
        }

        .signal-browser,
        .transcript-detail {
          min-height: 640px;
        }

        .signal-row-list {
          display: grid;
          gap: 10px;
          max-height: 760px;
          overflow: auto;
          padding-right: 4px;
        }

        .signal-row {
          width: 100%;
          display: grid;
          gap: 8px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 8px;
          padding: 12px;
          color: #dbe4f0;
          background: rgba(2, 6, 23, 0.24);
          text-align: left;
          cursor: pointer;
        }

        .signal-row.active {
          border-color: rgba(65, 215, 231, 0.5);
          background: rgba(65, 215, 231, 0.09);
        }

        .signal-row-top,
        .signal-row-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .signal-row-top {
          color: #9aa6b5;
          font-size: 12px;
          text-transform: uppercase;
        }

        .signal-row strong {
          color: #f8fafc;
          font-size: 15px;
          line-height: 1.25;
        }

        .signal-snippet {
          color: #a8b3c4;
          font-size: 13px;
          line-height: 1.45;
        }

        .signal-row-meta {
          justify-content: flex-start;
          color: #8d99aa;
          font-size: 12px;
        }

        .category-pill {
          min-height: 24px;
          padding: 3px 8px;
          color: #c9f6ff;
          border-color: rgba(65, 215, 231, 0.32);
          background: rgba(65, 215, 231, 0.08);
          font-size: 12px;
          text-transform: none;
        }

        .detail-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .detail-stat-grid.compact {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .detail-stat {
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 8px;
          padding: 10px;
          background: rgba(2, 6, 23, 0.24);
        }

        .detail-stat span {
          display: block;
          color: #8d99aa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .detail-stat strong {
          display: block;
          margin-top: 5px;
          color: #f8fafc;
          font-size: 14px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .detail-block {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
        }

        .detail-block h3 {
          margin: 0 0 10px;
          color: #f8fafc;
          font-size: 14px;
        }

        .detail-block p {
          margin: 0;
          color: #a8b3c4;
          font-size: 14px;
          line-height: 1.55;
        }

        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip-row span {
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 999px;
          padding: 5px 9px;
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.68);
          font-size: 12px;
        }

        .grouped-signal-list {
          display: grid;
          gap: 10px;
        }

        .grouped-signal-list div {
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          padding: 10px;
          background: rgba(2, 6, 23, 0.2);
        }

        .grouped-signal-list strong {
          color: #f8fafc;
          font-size: 13px;
        }

        .commercial-context-box {
          border-top-color: rgba(65, 215, 231, 0.22);
        }

        .empty-state {
          margin: 0;
          color: #9aa6b5;
          font-size: 14px;
          line-height: 1.5;
        }

        .positioning-card,
        .price-card {
          margin-bottom: 12px;
        }

        .lead-gap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.44fr);
          gap: 18px;
          margin-bottom: 18px;
          border: 1px solid rgba(65, 215, 231, 0.18);
          border-radius: 8px;
          padding: 16px;
          background: rgba(65, 215, 231, 0.06);
        }

        .lead-gap h3 {
          margin: 12px 0 8px;
          color: #f8fafc;
          font-size: 22px;
          line-height: 1.25;
        }

        .lead-gap p {
          max-width: 760px;
          margin: 0;
          color: #a8b3c4;
          font-size: 14px;
          line-height: 1.55;
        }

        .commercial-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(380px, 0.85fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        .view-select {
          display: grid;
          gap: 6px;
          min-width: 220px;
          color: #8d99aa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .view-select select {
          min-height: 38px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 8px;
          padding: 8px 10px;
          color: #f8fafc;
          background: rgba(2, 6, 23, 0.52);
          outline: none;
        }

        .subsection-heading {
          margin: 0 0 12px;
          color: #f8fafc;
          font-size: 15px;
        }

        .recommendation-grid {
          display: grid;
          gap: 12px;
        }

        .recommendation-tile {
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 8px;
          padding: 14px;
          background: rgba(2, 6, 23, 0.24);
        }

        .recommendation-tile h3 {
          margin: 12px 0 8px;
          color: #f8fafc;
          font-size: 16px;
          line-height: 1.3;
        }

        .recommendation-tile p {
          margin: 0;
          color: #a8b3c4;
          font-size: 13px;
          line-height: 1.45;
        }

        .tile-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .tile-metrics span {
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 999px;
          padding: 5px 8px;
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.68);
          font-size: 12px;
        }

        @media (max-width: 1180px) {
          .metric-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .filter-card {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .consumer-grid {
            grid-template-columns: 1fr;
          }

          .commercial-grid,
          .lead-gap {
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
          .opportunity-metrics,
          .filter-card,
          .detail-stat-grid,
          .detail-stat-grid.compact {
            grid-template-columns: 1fr;
          }

          .search-label {
            grid-column: auto;
          }

          .metric-card strong {
            min-height: auto;
          }
        }
      `}</style>
    </>
  );
}
