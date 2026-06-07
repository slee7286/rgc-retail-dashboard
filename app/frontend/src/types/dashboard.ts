export type NullableNumber = number | null;
export type NullableString = string | null;

export type SignalCategory =
  | "coConsumptionHabits"
  | "comparisonMentions"
  | "competitorMentions"
  | "complaints"
  | "painPoints"
  | "praiseThemes"
  | "productPreferences"
  | "purchaseDrivers"
  | "retailerMentions"
  | "routines"
  | "shopperNeeds"
  | "usageOccasions";

export type CommercialSignalGroup =
  | "benefits"
  | "painPoints"
  | "occasions"
  | "marketContext";

export interface DashboardData {
  metadata: DashboardMetadata;
  kpis: DashboardKpis;
  filters: FilterOptions;
  brandAggregates: BrandAggregate[];
  productAggregates: ProductAggregate[];
  commercialAggregationLayer: CommercialAggregationLayer;
  transcriptUserEnriched: TranscriptRow[];
  validation: ValidationReport;
}

export interface DashboardMetadata {
  generatedAt: string;
  sourceDirectory: string;
  artifactVersion: number;
}

export interface DashboardKpis {
  transcripts: number;
  users: number;
  products: number;
  brands: number;
  reviewedBrands: number;
  reviewedProducts: number;
  averageRating: NullableNumber;
  wouldBuyAfterTryingRate: NullableNumber;
  positiveSentimentShare: NullableNumber;
}

export interface FilterOptions {
  brands: string[];
  reviewedBrands: string[];
  subcategories: string[];
  retailers: string[];
  priceTiers: string[];
  marketMaturity: string[];
  packagingTypes: string[];
  labels: string[];
  sentiments: string[];
  themes: string[];
  signalCategories: SignalCategory[];
  signals: Record<SignalCategory, string[]>;
  commercialSignalGroups: Record<CommercialSignalGroup, SignalCategory[]>;
  aggregationDimensions: string[];
  positioningDimensions: string[];
  regions: string[];
  archetypes: string[];
}

export interface ValidationReport {
  generatedAt: string;
  rawCounts: {
    transcripts: number;
    users: number;
    products: number;
    brands: number;
  };
  joinChecks: {
    transcriptUserJoinKey: string[];
    transcriptProductJoinKey: string;
    productBrandJoinKey: Record<string, string>;
    missingTranscriptUserJoins: number;
    missingTranscriptUserReviewIds: string[];
    missingTranscriptProductJoins: number;
    missingTranscriptProductReviewIds: string[];
    productsMissingBrandJoins: number;
    productIdsMissingBrandJoins: string[];
  };
  coverage: {
    brandsWithTranscripts: number;
    brandsWithoutTranscripts: number;
    reviewedProducts: number;
    catalogueOnlyProducts: number;
    transcriptsWithoutText: number;
    transcriptsByBrand: Record<string, number>;
  };
  assumptions: string[];
}

export interface TranscriptRow {
  reviewId: string;
  brand: string;
  personId: string;
  productId: string;
  createdAt: string;
  isFeatured: boolean;
  isPublished: boolean;
  challenge: Challenge | null;
  rating: NullableNumber;
  wouldBuyAfterTrying: string;
  wouldBuyInTheFirstPlace: string;
  transcriptText: string;
  summary: string;
  sentiment: string;
  wordCount: NullableNumber;
  themes: Theme[];
  signals: Record<SignalCategory, Signal[]>;
  productName: string;
  category: string;
  subcategory: string;
  price: NullableNumber;
  priceTier: string;
  marketMaturity: string;
  retailers: string[];
  productLabels: ProductLabel[];
  reviewerName: string;
  age: NullableNumber;
  ageBucket: string;
  gender: string;
  region: string;
  videoReviewerTier: string;
  primaryArchetype: string;
  archetypes: Archetype[];
  reviewerTags: string[];
  questionAnswers: QuestionAnswer[];
  brandBreakthroughScore: NullableNumber;
  brandMomentumScore: NullableNumber;
  brandPopularityScore: NullableNumber;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
}

export interface Theme {
  theme: string;
  matchedKeywords: string[];
  confidence: number;
  confidenceLabel: string;
  snippet: string;
}

export interface Signal {
  label: string;
  matchedKeywords: string[];
  confidence: number;
  confidenceLabel: string;
  snippet: string;
}

export interface ProductLabel {
  name: string;
  confidence: NullableNumber;
}

export interface Archetype {
  name: string;
  order: NullableNumber;
}

export interface QuestionAnswer {
  question: string;
  answers: string[];
}

export interface ProductAggregate extends ProductContext {
  reviewCount: number;
  hasTranscriptEvidence: boolean;
  averageRating: NullableNumber;
  wouldBuyAfterTryingRate: NullableNumber;
  wouldBuyInFirstPlaceRate: NullableNumber;
  sentimentCounts: Record<string, number>;
  topThemes: ThemeCount[];
  topSignals: Record<SignalCategory, SignalCount[]>;
  reviewerArchetypes: CountItem[];
  reviewerRegions: CountItem[];
  evidence: EvidenceItem[];
}

export interface ProductContext {
  productId: string;
  brand: string;
  productName: string;
  seoName: string;
  companyName: string;
  category: string;
  subcategory: string;
  price: NullableNumber;
  priceMultipack: NullableNumber;
  multipackQuantity: NullableNumber;
  unitPriceFromMultipack: NullableNumber;
  currency: string;
  packSize: string;
  description: string;
  ingredients: string;
  retailers: string[];
  packagingType: string;
  marketMaturity: string;
  priceTier: string;
  seasonality: string;
  targetUsers: TargetUser[];
  usageOccasions: UsageOccasion[];
  companionProductsCount: NullableNumber;
  companionProducts: CompanionProduct[];
  labels: ProductLabel[];
}

export interface TargetUser {
  segment: string;
  motivation: string;
}

export interface UsageOccasion {
  scenario: string;
  frequency: string;
}

export interface CompanionProduct {
  type: string;
  relationship: string;
}

export interface BrandAggregate {
  brandName: string;
  foundedYear: NullableNumber;
  hqCity: string;
  hqCountry: string;
  headquartersRaw: string;
  description: string;
  industry: string;
  website: string;
  additionalContext: string;
  instagramHandle: string;
  linkedinUrl: string;
  tiktokHandle: string;
  twitterHandle: string;
  youtubeChannelId: string;
  breakthroughScore: NullableNumber;
  momentumScore: NullableNumber;
  popularityScore: NullableNumber;
  archetypeAffinity: string;
  researchOverallAssessment: string;
  productCount: number;
  reviewedProductCount: number;
  reviewCount: number;
  transcriptCoverageRole: string;
  averageRating: NullableNumber;
  wouldBuyAfterTryingRate: NullableNumber;
  sentimentCounts: Record<string, number>;
  topThemes: ThemeCount[];
  topSignals: Record<SignalCategory, SignalCount[]>;
  averagePrice: NullableNumber;
  priceRange: {
    min: NullableNumber;
    max: NullableNumber;
  };
  priceTiers: CountItem[];
  subcategories: CountItem[];
  retailers: string[];
  labels: string[];
  evidence: EvidenceItem[];
}

export interface CommercialAggregationLayer {
  overview: CommercialGroupRecord;
  byProduct: CommercialProductGroup[];
  byBrand: CommercialBrandGroup[];
  byRetailer: CommercialGroupRecord[];
  byCategory: CommercialGroupRecord[];
  byRatingBand: CommercialGroupRecord[];
  byStructuredAttributes: {
    priceTier: CommercialGroupRecord[];
    marketMaturity: CommercialGroupRecord[];
    packagingType: CommercialGroupRecord[];
    productLabel: CommercialGroupRecord[];
  };
  insightFeature: PositioningInsightFeature;
}

export interface CommercialGroupRecord {
  group: string;
  reviewCount: number;
  productCount: number;
  reviewedProductCount: number;
  averageRating: NullableNumber;
  wouldBuyAfterTryingRate: NullableNumber;
  positiveSentimentShare: NullableNumber;
  negativeOrMixedSentimentShare: NullableNumber;
  sentimentCounts: Record<string, number>;
  mentionCounts: Record<CommercialSignalGroup, number>;
  mentionRates: Record<CommercialSignalGroup, NullableNumber>;
  topBenefits: SignalCount[];
  topPainPoints: SignalCount[];
  topOccasions: SignalCount[];
  topMarketContext: SignalCount[];
  topThemes: ThemeCount[];
  evidence: EvidenceItem[];
}

export interface CommercialProductGroup extends CommercialGroupRecord {
  productId: string;
  brand: string;
  subcategory: string;
  priceTier: string;
}

export interface CommercialBrandGroup extends CommercialGroupRecord {
  brand: string;
  breakthroughScore: NullableNumber;
  transcriptCoverageRole: string;
}

export interface PositioningInsightFeature {
  featureName: string;
  description: string;
  method: Record<string, string>;
  baselines: Record<string, number>;
  brandGaps: PositioningOpportunity[];
  topOpportunities: PositioningOpportunity[];
  pricePositioningChecks: PricePositioningCheck[];
}

export interface PositioningOpportunity {
  brand: string;
  dimension: string;
  status: string;
  reviewCount: number;
  productCount: number;
  structuredPositioningScore: number;
  reviewerMentionCount: number;
  reviewerMentionRate: number;
  reviewedCategoryBaselineRate: number;
  deltaVsStructuredPositioning: number;
  deltaVsReviewedCategory: number;
  priorityScore: number;
  structuredEvidence: {
    productMatches: ProductPositioningMatch[];
    brandTextMatches: string[];
  };
  transcriptEvidence: SignalEvidence | null;
}

export interface ProductPositioningMatch {
  productId: string;
  productName: string;
  matchedStructuredKeywords: string[];
}

export interface PricePositioningCheck {
  brand: string;
  reviewCount: number;
  productCount: number;
  dominantPriceTier: string;
  priceTierCounts: Record<string, number>;
  premiumProductShare: number;
  averagePrice: NullableNumber;
  benefitMentionRate: NullableNumber;
  painPointMentionRate: NullableNumber;
  wouldBuyAfterTryingRate: NullableNumber;
  baselineRates: {
    benefitMentionRate: number;
    painPointMentionRate: number;
    wouldBuyAfterTryingRate: number;
  };
  status: string;
  evidence: SignalEvidence | null;
}

export interface ThemeCount {
  theme: string;
  count: number;
  shareOfReviews: NullableNumber;
  example: EvidenceItem | null;
}

export interface SignalCount {
  label: string;
  count: number;
  shareOfReviews: NullableNumber;
  example: EvidenceItem | null;
}

export interface CountItem {
  name: string;
  count: number;
}

export interface EvidenceItem {
  reviewId: string;
  createdAt?: string;
  brand: string;
  productName: string;
  reviewerName?: string;
  rating?: NullableNumber;
  sentiment?: string;
  wouldBuyAfterTrying?: string;
  theme?: string | null;
  signal?: string | null;
  category?: string;
  confidenceLabel?: string | null;
  snippet: string;
}

export interface SignalEvidence {
  reviewId: string;
  brand: string;
  productName: string;
  rating: NullableNumber;
  sentiment: string;
  signal: string;
  category: SignalCategory;
  confidenceLabel: string;
  snippet: string;
}
