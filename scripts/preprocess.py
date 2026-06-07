import csv
import json
import re
import shutil
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "Dataset"
OUTPUT_DIR = ROOT_DIR / "data"
FRONTEND_PUBLIC_DATA_DIR = ROOT_DIR / "app" / "frontend" / "public" / "data"

THEME_KEYWORDS = {
    "Taste": [
        "taste",
        "flavour",
        "flavor",
        "delicious",
        "nice",
        "tasty",
        "bitter",
        "sweet",
        "sour",
        "tart",
        "refreshing",
        "zesty",
        "ginger",
        "citrus",
        "natural",
        "aftertaste",
    ],
    "Health & Function": [
        "healthy",
        "health",
        "gut",
        "probiotic",
        "vitamin",
        "low calorie",
        "low sugar",
        "sugar",
        "natural ingredients",
        "immune",
        "vegan",
        "plant based",
        "cbd",
        "live cultures",
        "functional",
    ],
    "Occasion": [
        "work",
        "lunch",
        "evening",
        "home",
        "party",
        "picnic",
        "barbecue",
        "gym",
        "relax",
        "wind down",
        "morning",
        "after work",
        "summer",
    ],
    "Mixer & Pairing": [
        "mixer",
        "gin",
        "vodka",
        "rum",
        "cocktail",
        "spirit",
        "tonic",
        "with alcohol",
        "non-alcoholic",
        "alternative to alcohol",
    ],
    "Packaging & Format": [
        "packaging",
        "branding",
        "bottle",
        "can design",
        "can size",
        "canned",
        "size",
        "handy",
        "label",
        "design",
        "looks",
        "premium",
    ],
    "Value & Availability": [
        "price",
        "expensive",
        "cheap",
        "value",
        "buy",
        "purchase",
        "again",
        "shop",
        "tesco",
        "waitrose",
        "ocado",
        "amazon",
    ],
}

SIGNAL_RULES = {
    "praiseThemes": [
        {
            "label": "Refreshing taste",
            "keywords": ["refreshing", "fresh", "light", "crisp", "zesty", "clean"],
        },
        {
            "label": "Strong flavour appeal",
            "keywords": ["delicious", "really good", "love", "loved", "amazing", "tasty", "sublime"],
        },
        {
            "label": "Natural or refined profile",
            "keywords": ["natural", "refined", "not artificial", "real", "gentle", "subtle"],
        },
        {
            "label": "Balanced sweetness",
            "keywords": ["not too sweet", "lightly sweet", "low sugar", "no added sugar"],
        },
        {
            "label": "Good fizz",
            "keywords": ["sparkly", "sparkling", "fizzy", "bubbles", "carbonated"],
        },
        {
            "label": "Appealing packaging",
            "keywords": [
                "packaging",
                "branding",
                "bottle",
                "can design",
                "can size",
                "canned",
                "handy size",
                "looks nice",
            ],
        },
    ],
    "painPoints": [
        {
            "label": "Bitter, tart, or sour edge",
            "keywords": ["bitter", "tart", "sour", "bite", "sharp", "aftertaste"],
        },
        {
            "label": "Weak or subtle flavour",
            "keywords": [
                "not enough flavor",
                "not enough flavour",
                "weak flavour",
                "weak flavor",
                "too light",
                "light taste",
                "lacks flavour",
                "lacks flavor",
            ],
        },
        {
            "label": "Too fizzy",
            "keywords": ["too fizzy", "too bubbly", "too much fizz", "too many bubbles"],
        },
        {
            "label": "Fermented or unusual taste barrier",
            "keywords": ["fermented taste", "cheesy", "funny taste", "medicinal", "vinegary", "awful"],
        },
        {
            "label": "Too sweet",
            "keywords": ["too sweet", "sugary", "sweet for me"],
        },
        {
            "label": "Not a repeat purchase",
            "keywords": ["wouldn't buy", "would not buy", "not buy again", "not drink it again", "not the one"],
        },
    ],
    "usageOccasions": [
        {
            "label": "Mixer with spirits",
            "keywords": ["mixer", "gin", "vodka", "rum", "cocktail", "spirit", "tonic"],
        },
        {
            "label": "Alcohol alternative",
            "keywords": ["alternative to alcohol", "don't want to drink alcohol", "non-alcoholic", "standalone drink"],
        },
        {
            "label": "Workday or lunch break",
            "keywords": ["work from home", "working", "lunch", "home office", "after work"],
        },
        {
            "label": "Social occasion",
            "keywords": ["party", "picnic", "barbecue", "friends", "entertaining", "social"],
        },
        {
            "label": "Relaxation or wind-down",
            "keywords": ["relax", "wind down", "evening", "stressful", "calm", "anxiety"],
        },
        {
            "label": "Health routine",
            "keywords": ["gym", "diet", "low calorie", "immune", "gut", "wellness", "health"],
        },
    ],
    "purchaseDrivers": [
        {
            "label": "Taste-led repeat intent",
            "keywords": ["would buy this again", "buy this again", "drink it again", "get it again", "recommend"],
        },
        {
            "label": "Health and functional benefits",
            "keywords": ["gut", "probiotic", "vitamin c", "immune", "low calorie", "live cultures", "cbd"],
        },
        {
            "label": "Low/no sugar proposition",
            "keywords": ["low sugar", "no added sugar", "without sugar", "cut down on sugar", "sugar free"],
        },
        {
            "label": "Natural ingredients",
            "keywords": ["natural ingredients", "all natural", "plant based", "vegan", "dairy free"],
        },
        {
            "label": "Premium mixer role",
            "keywords": ["premium", "mixer", "cocktail", "elevate", "spirit", "gin"],
        },
        {
            "label": "Discovery or novelty",
            "keywords": ["never tried", "try this", "excited to try", "new drink", "curious"],
        },
    ],
    "shopperNeeds": [
        {
            "label": "Reduce sugar or soft drink dependency",
            "keywords": [
                "cut down on sugar",
                "without sugar",
                "sugar free",
                "low sugar",
                "stop drinking coke",
                "addicted to sodas",
            ],
        },
        {
            "label": "Health-conscious swap",
            "keywords": [
                "healthier option",
                "safer choice",
                "better for your body",
                "low calorie",
                "diet",
                "wellness",
            ],
        },
        {
            "label": "Gut health support",
            "keywords": ["gut", "probiotic", "live cultures", "kombucha", "kefir"],
        },
        {
            "label": "Calm or mood support",
            "keywords": ["calm", "relax", "anxiety", "stressful", "wind down", "cbd"],
        },
        {
            "label": "Convenient single serve",
            "keywords": ["handy size", "perfect mixer size", "on the go", "single serve"],
        },
        {
            "label": "Premium home serve",
            "keywords": ["premium", "home entertaining", "cocktail", "gin", "vodka", "mixer"],
        },
    ],
    "productPreferences": [
        {
            "label": "Prefers natural taste",
            "keywords": ["natural taste", "natural flavour", "not artificial", "real fruit", "all natural"],
        },
        {
            "label": "Prefers bold flavour",
            "keywords": ["strong flavour", "strong flavor", "fiery", "bold", "punchy", "zesty"],
        },
        {
            "label": "Prefers subtle flavour",
            "keywords": ["subtle", "gentle", "not too strong", "soft flavor", "soft flavour"],
        },
        {
            "label": "Prefers less sweetness",
            "keywords": ["not too sweet", "less sweet", "low sugar", "no added sugar"],
        },
        {
            "label": "Prefers high fizz",
            "keywords": ["fizzy", "sparkly", "bubbly", "sparkling"],
        },
        {
            "label": "Sensitive to fermented notes",
            "keywords": ["fermented taste", "cheesy", "vinegary", "medicinal", "kombucha can taste awful"],
        },
    ],
    "routines": [
        {
            "label": "Work-from-home refreshment",
            "keywords": ["work from home", "home office", "working from home", "working"],
        },
        {
            "label": "Lunch break drink",
            "keywords": ["lunch", "grabbing lunch", "with lunch"],
        },
        {
            "label": "Evening wind-down",
            "keywords": ["evening", "tonight", "wind down", "relaxing"],
        },
        {
            "label": "Social home drinking",
            "keywords": ["at home", "home entertaining", "friends", "wife", "partner", "social"],
        },
        {
            "label": "Diet or calorie management",
            "keywords": ["low calorie diet", "on a diet", "calories", "losing weight"],
        },
    ],
    "coConsumptionHabits": [
        {
            "label": "Mixed with gin",
            "keywords": ["gin", "g&t", "gin and tonic"],
        },
        {
            "label": "Mixed with vodka",
            "keywords": ["vodka"],
        },
        {
            "label": "Mixed with rum or bourbon",
            "keywords": ["rum", "bourbon"],
        },
        {
            "label": "Served with ice or garnish",
            "keywords": ["ice", "garnish", "lime", "mint", "cucumber slices"],
        },
        {
            "label": "Consumed instead of cola/soda",
            "keywords": ["diet coke", "coke", "soda", "soft drink"],
        },
        {
            "label": "Paired with food or treats",
            "keywords": ["lunch", "meal", "chocolate", "snack", "sweet treat"],
        },
    ],
    "complaints": [
        {
            "label": "Taste rejection",
            "keywords": ["don't like", "didn't like", "not keen", "not to my liking", "awful", "no."],
        },
        {
            "label": "Expectation gap",
            "keywords": ["wasn't expecting", "thought it was", "not sure", "on the fence", "nothing spectacular"],
        },
        {
            "label": "Format or serve issue",
            "keywords": ["too small", "little bit more", "serving size", "bottle size", "can size"],
        },
    ],
    "retailerMentions": [
        {"label": "Tesco", "keywords": ["tesco"]},
        {"label": "Waitrose", "keywords": ["waitrose"]},
        {"label": "Ocado", "keywords": ["ocado"]},
        {"label": "Amazon", "keywords": ["amazon"]},
        {"label": "Aldi", "keywords": ["aldi"]},
        {"label": "M&S", "keywords": ["m&s", "marks and spencer", "marks & spencer"]},
        {"label": "Morrisons", "keywords": ["morrisons"]},
        {"label": "Selfridges", "keywords": ["selfridges"]},
    ],
    "competitorMentions": [
        {"label": "Schweppes", "keywords": ["schweppes"]},
        {"label": "Fever-Tree", "keywords": ["fever tree", "fever-tree"]},
        {"label": "Franklin & Sons", "keywords": ["franklin and sons", "franklin & sons"]},
        {"label": "Remedy Kombucha", "keywords": ["remedy kombucha", "remedy"]},
        {"label": "Nexba", "keywords": ["nexba", "nexpa"]},
        {"label": "Coca-Cola/Diet Coke", "keywords": ["coca cola", "coke", "diet coke"]},
    ],
    "comparisonMentions": [
        {
            "label": "Explicit comparison",
            "keywords": ["compare", "compared", "comparing", "versus", "vs", "head to head"],
        },
        {
            "label": "Preference or winner language",
            "keywords": ["prefer", "winner is", "goes to", "beats", "better than"],
        },
        {
            "label": "Alternative or substitute framing",
            "keywords": ["alternative", "instead of", "rather than", "substitute", "replace"],
        },
    ],
}

SIGNAL_CONFIDENCE_LABELS = [
    (0.8, "high"),
    (0.55, "medium"),
    (0.0, "low"),
]


def read_json(path):
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if isinstance(payload, dict) and "value" in payload:
        return payload["value"]
    return payload


def read_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=True)
        handle.write("\n")


def clean_text(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def as_float(value):
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def as_int(value):
    number = as_float(value)
    return int(number) if number is not None else None


def first_item(items):
    return items[0] if isinstance(items, list) and items else {}


def average(values):
    clean_values = [value for value in values if value is not None]
    return round(mean(clean_values), 2) if clean_values else None


def yes_rate(values):
    clean_values = [str(value).lower() for value in values if value not in (None, "")]
    if not clean_values:
        return None
    return round(sum(value == "yes" for value in clean_values) / len(clean_values), 3)


def parse_semicolon_list(value):
    if not value:
        return []
    return [part.strip() for part in str(value).split(";") if part.strip()]


def parse_labels(value):
    labels = []
    for part in parse_semicolon_list(value):
        match = re.match(r"(.+?)\(([\d.]+)\)$", part)
        if match:
            labels.append(
                {
                    "name": clean_text(match.group(1)),
                    "confidence": as_float(match.group(2)),
                }
            )
        else:
            labels.append({"name": clean_text(part), "confidence": None})
    return labels


def extract_age_bucket(age):
    age_value = as_int(age)
    if age_value is None:
        return "Unknown"
    if age_value < 25:
        return "18-24"
    if age_value < 35:
        return "25-34"
    if age_value < 45:
        return "35-44"
    if age_value < 55:
        return "45-54"
    return "55+"


def normalise_product(row):
    target_users = []
    for index in range(1, 4):
        segment = clean_text(row.get(f"target_user_{index}_segment"))
        motivation = clean_text(row.get(f"target_user_{index}_motivation"))
        if segment or motivation:
            target_users.append({"segment": segment, "motivation": motivation})

    usage_occasions = []
    for index in range(1, 5):
        scenario = clean_text(row.get(f"usage_{index}_scenario"))
        frequency = clean_text(row.get(f"usage_{index}_frequency"))
        if scenario or frequency:
            usage_occasions.append({"scenario": scenario, "frequency": frequency})

    companions = []
    for index in range(1, 6):
        companion_type = clean_text(row.get(f"companion_{index}_type"))
        relationship = clean_text(row.get(f"companion_{index}_relationship"))
        if companion_type or relationship:
            companions.append({"type": companion_type, "relationship": relationship})

    price = as_float(row.get("price"))
    multipack_price = as_float(row.get("price_multipack"))
    multipack_quantity = as_int(row.get("multipack_quantity"))
    unit_price_from_pack = None
    if multipack_price is not None and multipack_quantity:
        unit_price_from_pack = round(multipack_price / multipack_quantity, 2)

    return {
        "productId": clean_text(row.get("productId")),
        "brand": clean_text(row.get("brand")),
        "productName": clean_text(row.get("productName")),
        "seoName": clean_text(row.get("seoName")),
        "companyName": clean_text(row.get("companyName")),
        "category": clean_text(row.get("category")),
        "subcategory": clean_text(row.get("subcategory")),
        "price": price,
        "priceMultipack": multipack_price,
        "multipackQuantity": multipack_quantity,
        "unitPriceFromMultipack": unit_price_from_pack,
        "currency": clean_text(row.get("currency")) or "GBP",
        "packSize": clean_text(row.get("pack_size")),
        "description": clean_text(row.get("description")),
        "ingredients": clean_text(row.get("ingredients")),
        "retailers": parse_semicolon_list(row.get("retailers_available")),
        "packagingType": clean_text(row.get("packaging_attributes.packaging_type")),
        "marketMaturity": clean_text(row.get("market_position.market_maturity")),
        "priceTier": clean_text(row.get("market_position.price_tier")),
        "seasonality": clean_text(row.get("market_position.seasonality")),
        "targetUsers": target_users,
        "usageOccasions": usage_occasions,
        "companionProductsCount": as_int(row.get("companion_products_count")),
        "companionProducts": companions,
        "labels": parse_labels(row.get("labels")),
    }


def normalise_brand(row):
    return {
        "brandName": clean_text(row.get("brand_name")),
        "foundedYear": as_int(row.get("founded_year")),
        "hqCity": clean_text(row.get("hq_city")),
        "hqCountry": clean_text(row.get("hq_country")),
        "headquartersRaw": clean_text(row.get("headquarters_raw")),
        "description": clean_text(row.get("description")),
        "industry": clean_text(row.get("industry")),
        "website": clean_text(row.get("website")),
        "additionalContext": clean_text(row.get("additional_context")),
        "instagramHandle": clean_text(row.get("instagram_handle")),
        "linkedinUrl": clean_text(row.get("linkedin_url")),
        "tiktokHandle": clean_text(row.get("tiktok_handle")),
        "twitterHandle": clean_text(row.get("twitter_handle")),
        "youtubeChannelId": clean_text(row.get("youtube_channel_id")),
        "breakthroughScore": as_float(row.get("breakthrough_score")),
        "momentumScore": as_float(row.get("momentum_score")),
        "popularityScore": as_float(row.get("popularity_score")),
        "archetypeAffinity": clean_text(row.get("archetype_affinity")),
        "researchOverallAssessment": clean_text(row.get("research_overall_assessment")),
    }


def normalise_user(row):
    archetypes = [
        {
            "name": clean_text(archetype.get("name")),
            "order": as_int(archetype.get("order")),
        }
        for archetype in row.get("archetypes", [])
        if isinstance(archetype, dict) and clean_text(archetype.get("name"))
    ]
    question_answers = []
    for question in row.get("questions", []):
        if not isinstance(question, dict):
            continue
        answers = [
            clean_text(answer.get("text"))
            for answer in question.get("answers", [])
            if isinstance(answer, dict) and clean_text(answer.get("text"))
        ]
        if answers:
            question_answers.append(
                {
                    "question": clean_text(question.get("title")),
                    "answers": answers,
                }
            )

    age = clean_text(row.get("age"))
    return {
        "reviewId": clean_text(row.get("reviewId")),
        "personId": clean_text(row.get("personId")),
        "brand": clean_text(row.get("brand")),
        "reviewerName": clean_text(
            f"{clean_text(row.get('firstName'))} {clean_text(row.get('lastName'))}"
        ),
        "age": as_int(age),
        "ageBucket": extract_age_bucket(age),
        "gender": clean_text(row.get("gender")) or "Unknown",
        "region": clean_text(row.get("region")) or "Unknown",
        "videoReviewerTier": clean_text(row.get("videoReviewerTier")),
        "archetypes": archetypes,
        "primaryArchetype": archetypes[0]["name"] if archetypes else "Unknown",
        "tags": [clean_text(tag) for tag in row.get("tags", []) if clean_text(tag)],
        "questionAnswers": question_answers,
    }


def keyword_matches(text_lower, keyword):
    keyword_lower = keyword.lower()
    if not keyword_lower:
        return False
    if re.search(r"^[a-z0-9 ]+$", keyword_lower):
        pattern = r"(?<![a-z0-9])" + re.escape(keyword_lower) + r"(?![a-z0-9])"
        return re.search(pattern, text_lower) is not None
    return keyword_lower in text_lower


def matched_terms(text_lower, keywords):
    return [keyword for keyword in keywords if keyword_matches(text_lower, keyword)]


def confidence_label(score):
    for threshold, label in SIGNAL_CONFIDENCE_LABELS:
        if score >= threshold:
            return label
    return "low"


def find_snippet(text, keyword):
    if not text:
        return ""
    match = re.search(re.escape(keyword), text, flags=re.IGNORECASE)
    if not match:
        return clean_text(text[:220])
    start = max(match.start() - 95, 0)
    end = min(match.end() + 125, len(text))
    snippet = text[start:end]
    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet += "..."
    return clean_text(snippet)


def score_from_matches(match_count, evidence_boost=0):
    return round(min(1.0, 0.34 + (0.16 * match_count) + evidence_boost), 2)


def extract_themes(text):
    text_lower = text.lower()
    themes = []
    for theme, keywords in THEME_KEYWORDS.items():
        matched_keywords = matched_terms(text_lower, keywords)
        if matched_keywords:
            confidence = score_from_matches(len(set(matched_keywords)))
            themes.append(
                {
                    "theme": theme,
                    "matchedKeywords": sorted(set(matched_keywords)),
                    "confidence": round(confidence, 2),
                    "confidenceLabel": confidence_label(confidence),
                    "snippet": find_snippet(text, matched_keywords[0]),
                }
            )
    return sorted(themes, key=lambda item: (-item["confidence"], item["theme"]))


def extract_signals(text, rating=None, sentiment="UNKNOWN", would_buy_after_trying=""):
    text_lower = text.lower()
    signals = {category: [] for category in SIGNAL_RULES}
    rating_value = rating if rating is not None else 0
    sentiment_upper = sentiment.upper()
    would_buy_lower = would_buy_after_trying.lower()

    for category, rules in SIGNAL_RULES.items():
        for rule in rules:
            matches = matched_terms(text_lower, rule["keywords"])
            if not matches:
                continue

            evidence_boost = 0
            if category in ("praiseThemes", "purchaseDrivers"):
                if rating_value >= 4:
                    evidence_boost += 0.12
                if sentiment_upper == "POSITIVE":
                    evidence_boost += 0.08
                if would_buy_lower == "yes":
                    evidence_boost += 0.06
            if category in ("painPoints", "complaints"):
                if rating_value and rating_value <= 3:
                    evidence_boost += 0.12
                if sentiment_upper in ("NEGATIVE", "MIXED"):
                    evidence_boost += 0.08
                if would_buy_lower == "no":
                    evidence_boost += 0.06
            if category in ("shopperNeeds", "productPreferences", "routines", "coConsumptionHabits"):
                if rating_value >= 4 or would_buy_lower == "yes":
                    evidence_boost += 0.04
            if category in ("competitorMentions", "comparisonMentions"):
                comparison_terms = matched_terms(
                    text_lower,
                    [
                        "compare",
                        "compared",
                        "comparing",
                        "versus",
                        "vs",
                        "prefer",
                        "winner",
                        "beats",
                        "head to head",
                    ],
                )
                if comparison_terms:
                    matches = sorted(set(matches + comparison_terms))
                    evidence_boost += 0.1

            confidence = score_from_matches(len(set(matches)), evidence_boost)
            signals[category].append(
                {
                    "label": rule["label"],
                    "matchedKeywords": sorted(set(matches)),
                    "confidence": confidence,
                    "confidenceLabel": confidence_label(confidence),
                    "snippet": find_snippet(text, matches[0]),
                }
            )

    for category, items in signals.items():
        signals[category] = sorted(
            items, key=lambda item: (-item["confidence"], item["label"])
        )
    return signals


def normalise_transcript(row):
    vote = first_item(row.get("votes", []))
    would_buy = first_item(row.get("wouldBuy", []))
    transcription = row.get("transcription") if isinstance(row.get("transcription"), dict) else {}
    challenge = row.get("challenge") if isinstance(row.get("challenge"), dict) else {}
    transcript_text = clean_text(transcription.get("text"))
    rating = as_float(vote.get("rating"))
    would_buy_after_trying = clean_text(would_buy.get("wouldBuyAfterTrying"))

    return {
        "reviewId": clean_text(row.get("reviewId")),
        "brand": clean_text(row.get("brand")),
        "personId": clean_text(row.get("personId")),
        "productId": clean_text(row.get("productId")),
        "createdAt": clean_text(row.get("createdAt")),
        "isFeatured": bool(row.get("isFeatured")),
        "isPublished": bool(row.get("isPublished")),
        "challenge": {
            "id": clean_text(challenge.get("id")),
            "title": clean_text(challenge.get("title")),
            "slug": clean_text(challenge.get("slug")),
        }
        if challenge
        else None,
        "rating": rating,
        "wouldBuyAfterTrying": would_buy_after_trying,
        "wouldBuyInTheFirstPlace": clean_text(would_buy.get("wouldBuyInTheFirstPlace")),
        "transcriptText": transcript_text,
        "summary": clean_text(transcription.get("summary")),
        "sentiment": clean_text(transcription.get("sentiment")) or "UNKNOWN",
        "wordCount": as_int(transcription.get("wordCount")),
        "themes": extract_themes(transcript_text),
        "signals": extract_signals(
            transcript_text,
            rating=rating,
            sentiment=clean_text(transcription.get("sentiment")) or "UNKNOWN",
            would_buy_after_trying=would_buy_after_trying,
        ),
    }


def top_counts(values, limit=8):
    counter = Counter(value for value in values if value not in (None, "", "Unknown"))
    return [{"name": name, "count": count} for name, count in counter.most_common(limit)]


def top_theme_counts(rows, limit=8):
    counter = Counter()
    examples = {}
    for row in rows:
        for theme in row.get("themes", []):
            name = theme["theme"]
            counter[name] += 1
            examples.setdefault(
                name,
                {
                    "reviewId": row["reviewId"],
                    "productName": row.get("productName"),
                    "brand": row.get("brand"),
                    "snippet": theme.get("snippet"),
                },
            )
    return [
        {
            "theme": name,
            "count": count,
            "shareOfReviews": round(count / len(rows), 3) if rows else None,
            "example": examples.get(name),
        }
        for name, count in counter.most_common(limit)
    ]


def top_signal_counts(rows, limit=6):
    signal_summary = {}
    for category in SIGNAL_RULES:
        counter = Counter()
        examples = {}
        for row in rows:
            for signal in row.get("signals", {}).get(category, []):
                label = signal["label"]
                counter[label] += 1
                examples.setdefault(
                    label,
                    {
                        "reviewId": row["reviewId"],
                        "productName": row.get("productName"),
                        "brand": row.get("brand"),
                        "snippet": signal.get("snippet"),
                        "confidenceLabel": signal.get("confidenceLabel"),
                    },
                )
        signal_summary[category] = [
            {
                "label": label,
                "count": count,
                "shareOfReviews": round(count / len(rows), 3) if rows else None,
                "example": examples.get(label),
            }
            for label, count in counter.most_common(limit)
        ]
    return signal_summary


def compact_evidence(row):
    first_theme = row.get("themes", [{}])[0] if row.get("themes") else {}
    first_signal = None
    for signals in row.get("signals", {}).values():
        if signals:
            first_signal = signals[0]
            break
    return {
        "reviewId": row["reviewId"],
        "createdAt": row["createdAt"],
        "brand": row.get("brand"),
        "productName": row.get("productName"),
        "reviewerName": row.get("reviewerName"),
        "rating": row.get("rating"),
        "sentiment": row.get("sentiment"),
        "wouldBuyAfterTrying": row.get("wouldBuyAfterTrying"),
        "theme": first_theme.get("theme"),
        "signal": first_signal.get("label") if first_signal else None,
        "confidenceLabel": first_signal.get("confidenceLabel") if first_signal else None,
        "snippet": (
            first_signal.get("snippet")
            if first_signal
            else first_theme.get("snippet")
            or row.get("summary")
            or row.get("transcriptText", "")[:220]
        ),
    }


def build_product_aggregates(products, transcript_rows):
    rows_by_product = defaultdict(list)
    for row in transcript_rows:
        rows_by_product[row["productId"]].append(row)

    aggregates = []
    for product in products:
        rows = rows_by_product.get(product["productId"], [])
        rating_values = [row.get("rating") for row in rows]
        aggregate = {
            **product,
            "reviewCount": len(rows),
            "hasTranscriptEvidence": len(rows) > 0,
            "averageRating": average(rating_values),
            "wouldBuyAfterTryingRate": yes_rate(
                row.get("wouldBuyAfterTrying") for row in rows
            ),
            "wouldBuyInFirstPlaceRate": yes_rate(
                row.get("wouldBuyInTheFirstPlace") for row in rows
            ),
            "sentimentCounts": dict(Counter(row.get("sentiment") for row in rows)),
            "topThemes": top_theme_counts(rows, limit=6),
            "topSignals": top_signal_counts(rows, limit=5),
            "reviewerArchetypes": top_counts(
                row.get("primaryArchetype") for row in rows
            ),
            "reviewerRegions": top_counts(row.get("region") for row in rows),
            "evidence": [compact_evidence(row) for row in rows[:5]],
        }
        aggregates.append(aggregate)

    return sorted(
        aggregates,
        key=lambda row: (row["reviewCount"], row["averageRating"] or 0, row["brand"]),
        reverse=True,
    )


def build_brand_aggregates(brands, products, transcript_rows):
    products_by_brand = defaultdict(list)
    rows_by_brand = defaultdict(list)
    for product in products:
        products_by_brand[product["brand"]].append(product)
    for row in transcript_rows:
        rows_by_brand[row["brand"]].append(row)

    aggregates = []
    for brand in brands:
        brand_name = brand["brandName"]
        brand_products = products_by_brand.get(brand_name, [])
        rows = rows_by_brand.get(brand_name, [])
        reviewed_product_ids = {row["productId"] for row in rows}
        retailers = sorted(
            {
                retailer
                for product in brand_products
                for retailer in product.get("retailers", [])
                if retailer
            }
        )
        labels = sorted(
            {
                label["name"]
                for product in brand_products
                for label in product.get("labels", [])
                if label.get("name")
            }
        )
        price_values = [product.get("price") for product in brand_products]

        aggregates.append(
            {
                **brand,
                "productCount": len(brand_products),
                "reviewedProductCount": len(reviewed_product_ids),
                "reviewCount": len(rows),
                "transcriptCoverageRole": "Reviewed brand" if rows else "Competitive context",
                "averageRating": average(row.get("rating") for row in rows),
                "wouldBuyAfterTryingRate": yes_rate(
                    row.get("wouldBuyAfterTrying") for row in rows
                ),
                "sentimentCounts": dict(Counter(row.get("sentiment") for row in rows)),
                "topThemes": top_theme_counts(rows, limit=7),
                "topSignals": top_signal_counts(rows, limit=6),
                "averagePrice": average(price_values),
                "priceRange": {
                    "min": min([value for value in price_values if value is not None], default=None),
                    "max": max([value for value in price_values if value is not None], default=None),
                },
                "priceTiers": top_counts(product.get("priceTier") for product in brand_products),
                "subcategories": top_counts(
                    product.get("subcategory") for product in brand_products
                ),
                "retailers": retailers,
                "labels": labels,
                "evidence": [compact_evidence(row) for row in rows[:6]],
            }
        )

    return sorted(
        aggregates,
        key=lambda row: (
            row["reviewCount"],
            row.get("breakthroughScore") or 0,
            row["brandName"],
        ),
        reverse=True,
    )


def make_filter_options(products, brand_aggregates, transcript_rows):
    retailers = sorted(
        {
            retailer
            for product in products
            for retailer in product.get("retailers", [])
            if retailer
        }
    )
    labels = sorted(
        {
            label["name"]
            for product in products
            for label in product.get("labels", [])
            if label.get("name")
        }
    )
    return {
        "brands": sorted(brand["brandName"] for brand in brand_aggregates),
        "reviewedBrands": sorted(
            brand["brandName"] for brand in brand_aggregates if brand["reviewCount"]
        ),
        "subcategories": sorted(
            {product["subcategory"] for product in products if product["subcategory"]}
        ),
        "retailers": retailers,
        "priceTiers": sorted({product["priceTier"] for product in products if product["priceTier"]}),
        "marketMaturity": sorted(
            {product["marketMaturity"] for product in products if product["marketMaturity"]}
        ),
        "packagingTypes": sorted(
            {product["packagingType"] for product in products if product["packagingType"]}
        ),
        "labels": labels,
        "sentiments": sorted({row["sentiment"] for row in transcript_rows if row["sentiment"]}),
        "themes": sorted(THEME_KEYWORDS.keys()),
        "signalCategories": sorted(SIGNAL_RULES.keys()),
        "signals": {
            category: sorted(rule["label"] for rule in rules)
            for category, rules in SIGNAL_RULES.items()
        },
        "regions": sorted({row["region"] for row in transcript_rows if row.get("region")}),
        "archetypes": sorted(
            {row["primaryArchetype"] for row in transcript_rows if row.get("primaryArchetype")}
        ),
    }


def build_validation(raw_counts, users, products, brands, transcript_rows):
    product_ids = {product["productId"] for product in products}
    brand_names = {brand["brandName"] for brand in brands}
    user_keys = {(user["reviewId"], user["personId"]) for user in users}

    missing_user = [
        row["reviewId"]
        for row in transcript_rows
        if (row["reviewId"], row["personId"]) not in user_keys
    ]
    missing_product = [
        row["reviewId"] for row in transcript_rows if row["productId"] not in product_ids
    ]
    products_missing_brand = [
        product["productId"] for product in products if product["brand"] not in brand_names
    ]

    reviewed_brand_counts = Counter(row["brand"] for row in transcript_rows)
    reviewed_product_ids = {row["productId"] for row in transcript_rows}

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "rawCounts": raw_counts,
        "joinChecks": {
            "transcriptUserJoinKey": ["reviewId", "personId"],
            "transcriptProductJoinKey": "productId",
            "productBrandJoinKey": {"products.brand": "brands.brand_name"},
            "missingTranscriptUserJoins": len(missing_user),
            "missingTranscriptUserReviewIds": missing_user,
            "missingTranscriptProductJoins": len(missing_product),
            "missingTranscriptProductReviewIds": missing_product,
            "productsMissingBrandJoins": len(products_missing_brand),
            "productIdsMissingBrandJoins": products_missing_brand,
        },
        "coverage": {
            "brandsWithTranscripts": len(reviewed_brand_counts),
            "brandsWithoutTranscripts": raw_counts["brands"] - len(reviewed_brand_counts),
            "reviewedProducts": len(reviewed_product_ids),
            "catalogueOnlyProducts": raw_counts["products"] - len(reviewed_product_ids),
            "transcriptsWithoutText": sum(
                1 for row in transcript_rows if not row.get("transcriptText")
            ),
            "transcriptsByBrand": dict(sorted(reviewed_brand_counts.items())),
        },
        "assumptions": [
            "Transcript-user enrichment uses the documented composite key (reviewId, personId).",
            "Products are retained even when they have no transcript evidence so competitor context remains visible.",
            "Brands with no reviews are labelled Competitive context rather than treated as data-quality failures.",
            "Theme extraction is transparent keyword matching over transcript text, not a model-inferred truth label.",
            "Transcript signals are deterministic phrase matches with evidence snippets across praise, pain points, occasions, shopper needs, product preferences, routines, co-consumption, purchase drivers, complaints, retailers, competitors, and comparisons.",
            "Signal confidence combines matched phrase count with simple supporting evidence from rating, sentiment, and would-buy response.",
        ],
    }


def main():
    raw_transcripts = read_json(DATA_DIR / "transcripts.json")
    raw_users = read_json(DATA_DIR / "users.json")
    raw_products = read_csv(DATA_DIR / "products.csv")
    raw_brands = read_csv(DATA_DIR / "brands.csv")

    users = [normalise_user(row) for row in raw_users]
    products = [normalise_product(row) for row in raw_products]
    brands = [normalise_brand(row) for row in raw_brands]
    transcripts = [normalise_transcript(row) for row in raw_transcripts]

    users_by_key = {(user["reviewId"], user["personId"]): user for user in users}
    products_by_id = {product["productId"]: product for product in products}
    brands_by_name = {brand["brandName"]: brand for brand in brands}

    transcript_user_enriched = []
    for transcript in transcripts:
        user = users_by_key.get((transcript["reviewId"], transcript["personId"]), {})
        product = products_by_id.get(transcript["productId"], {})
        brand = brands_by_name.get(product.get("brand") or transcript.get("brand"), {})
        transcript_user_enriched.append(
            {
                **transcript,
                "brand": product.get("brand") or transcript.get("brand"),
                "productName": product.get("productName"),
                "category": product.get("category"),
                "subcategory": product.get("subcategory"),
                "price": product.get("price"),
                "priceTier": product.get("priceTier"),
                "marketMaturity": product.get("marketMaturity"),
                "retailers": product.get("retailers", []),
                "productLabels": product.get("labels", []),
                "reviewerName": user.get("reviewerName"),
                "age": user.get("age"),
                "ageBucket": user.get("ageBucket"),
                "gender": user.get("gender"),
                "region": user.get("region"),
                "videoReviewerTier": user.get("videoReviewerTier"),
                "primaryArchetype": user.get("primaryArchetype"),
                "archetypes": user.get("archetypes", []),
                "reviewerTags": user.get("tags", []),
                "questionAnswers": user.get("questionAnswers", []),
                "brandBreakthroughScore": brand.get("breakthroughScore"),
                "brandMomentumScore": brand.get("momentumScore"),
                "brandPopularityScore": brand.get("popularityScore"),
            }
        )

    product_aggregates = build_product_aggregates(products, transcript_user_enriched)
    brand_aggregates = build_brand_aggregates(brands, products, transcript_user_enriched)

    raw_counts = {
        "transcripts": len(raw_transcripts),
        "users": len(raw_users),
        "products": len(raw_products),
        "brands": len(raw_brands),
    }
    validation = build_validation(
        raw_counts, users, products, brands, transcript_user_enriched
    )
    filter_options = make_filter_options(products, brand_aggregates, transcript_user_enriched)

    kpis = {
        "transcripts": len(transcript_user_enriched),
        "users": len(users),
        "products": len(products),
        "brands": len(brands),
        "reviewedBrands": len([brand for brand in brand_aggregates if brand["reviewCount"]]),
        "reviewedProducts": validation["coverage"]["reviewedProducts"],
        "averageRating": average(row.get("rating") for row in transcript_user_enriched),
        "wouldBuyAfterTryingRate": yes_rate(
            row.get("wouldBuyAfterTrying") for row in transcript_user_enriched
        ),
        "positiveSentimentShare": round(
            sum(row.get("sentiment") == "POSITIVE" for row in transcript_user_enriched)
            / len(transcript_user_enriched),
            3,
        )
        if transcript_user_enriched
        else None,
    }

    dashboard_data = {
        "metadata": {
            "generatedAt": validation["generatedAt"],
            "sourceDirectory": str(DATA_DIR.relative_to(ROOT_DIR)),
            "artifactVersion": 2,
        },
        "kpis": kpis,
        "filters": filter_options,
        "brandAggregates": brand_aggregates,
        "productAggregates": product_aggregates,
        "transcriptUserEnriched": transcript_user_enriched,
        "validation": validation,
    }

    artifacts = {
        "transcript_user_enriched.json": transcript_user_enriched,
        "transcript_product_aggregates.json": product_aggregates,
        "brand_level_aggregates.json": brand_aggregates,
        "filter_options.json": filter_options,
        "validation_report.json": validation,
        "dashboard_data.json": dashboard_data,
    }

    for file_name, payload in artifacts.items():
        write_json(OUTPUT_DIR / file_name, payload)

    FRONTEND_PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    for artifact_path in OUTPUT_DIR.glob("*.json"):
        shutil.copy2(artifact_path, FRONTEND_PUBLIC_DATA_DIR / artifact_path.name)

    print(
        "Generated {count} artifacts in {data_dir} and mirrored them to {public_dir}.".format(
            count=len(artifacts),
            data_dir=OUTPUT_DIR.relative_to(ROOT_DIR),
            public_dir=FRONTEND_PUBLIC_DATA_DIR.relative_to(ROOT_DIR),
        )
    )
    print(
        "Rows: {transcripts} transcripts, {products} products, {brands} brands.".format(
            **raw_counts
        )
    )
    print(
        "Join gaps: {users} transcript-user, {products} transcript-product, {brands} product-brand.".format(
            users=validation["joinChecks"]["missingTranscriptUserJoins"],
            products=validation["joinChecks"]["missingTranscriptProductJoins"],
            brands=validation["joinChecks"]["productsMissingBrandJoins"],
        )
    )


if __name__ == "__main__":
    main()
