/**
 * Kala-Kart Pricing Dataset Transformation & Provenance Layer
 *
 * Implements Step 4C.9 & 4C.10:
 * - Transforms verified artisan product records + verified market observations into canonical training rows
 * - Strictly maintains the 28-column canonical training dataset schema
 * - Preserves complete provenance via market_observation_ids mapping
 * - Never executes automatically; strictly invoked on verified batches
 */

import { MarketPriceObservation, ProductDimensions, ArtisanCostData, PricingDatasetRow } from "../../types/pricing";
import { MarketDataService } from "./marketDataService";

export interface TrainingAuditReport {
  timestamp: string;
  totalObservationsExamined: number;
  uniqueFingerprintsExamined: number;
  duplicateObservationsSkipped: number;
  eligibleForTrainingCount: number;
  rejectedCount: number;
  rejectionReasonsSummary: Record<string, number>;
  requiredMissingFieldsSummary: Record<string, number>;
  detailedEvaluations: ObservationAuditEvaluation[];
  trainingRowsProduced: number;
  eligibleTrainingRows: DerivedTrainingRecord[];
  isTrainingDatasetReady: boolean;
  message: string;
}

export interface ObservationAuditEvaluation {
  observationId: string;
  fingerprint: string;
  productCategory: string;
  productType: string;
  material: string;
  observedPriceINR: number;
  isEligible: boolean;
  rejectionReasons: string[];
  missingRequiredFields: string[];
  fieldProvenance: {
    verifiedMarketFacts: Record<string, any>;
    verifiedArtisanFacts: Record<string, any>;
    derivedFeatures: Record<string, any>;
    unavailableFields: string[];
  };
}

export interface VerifiedArtisanProductInput {
  id: string;
  category: string;
  subcategory: string;
  material: string;
  craftTechnique: string;
  color: string;
  dimensions?: ProductDimensions | null;
  weightGrams?: number | null;
  quantity: number;
  handmade: boolean;
  productionTimeHours?: number | null;
  artisanCosts: ArtisanCostData;
  descriptionLength?: number;
  designComplexityScore?: number;
  imageQualityScore?: number;
  targetSellingPriceINR: number;
}

export function validateArtisanProductForTraining(product: VerifiedArtisanProductInput): {
  valid: boolean;
  reasons: string[];
  missingFields: string[];
} {
  const reasons: string[] = [];
  const missingFields: string[] = [];

  if (!product.id) missingFields.push("id");
  if (!product.category) missingFields.push("category");
  if (!product.subcategory) missingFields.push("subcategory");
  if (!product.material) missingFields.push("material");
  if (!product.artisanCosts) {
    missingFields.push("artisanCosts");
  } else {
    if (product.artisanCosts.rawMaterialCostINR == null) missingFields.push("artisanCosts.rawMaterialCostINR");
    if (product.artisanCosts.laborCostINR == null) missingFields.push("artisanCosts.laborCostINR");
  }
  if (product.targetSellingPriceINR == null || product.targetSellingPriceINR <= 0) {
    missingFields.push("targetSellingPriceINR");
    reasons.push("Missing or non-positive target selling price");
  }

  if (missingFields.length > 0) {
    reasons.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return {
    valid: reasons.length === 0,
    reasons,
    missingFields,
  };
}

/**
 * Derived Training Record containing the 28 canonical columns
 * plus audit/provenance metadata.
 */
export interface DerivedTrainingRecord {
  // Canonical 28 columns
  id: string;
  category: string;
  subcategory: string;
  material: string;
  craft_technique: string;
  color: string;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  diameter_cm: number | null;
  weight_g: number | null;
  quantity: number;
  handmade: boolean;
  production_time_hours: number | null;
  raw_material_cost_inr: number;
  labor_cost_inr: number;
  packaging_cost_inr: number;
  other_cost_inr: number;
  market_median_price_inr: number | null;
  market_min_price_inr: number | null;
  market_max_price_inr: number | null;
  market_sample_count: number | null;
  market_trend_score: number | null;
  market_observation_date: string | null;
  description_length: number;
  design_complexity_score: number;
  image_quality_score: number;
  target_selling_price_inr: number;

  // Provenance metadata (4C.10)
  market_observation_ids: string[];
  provenance_sources: string[];
  transformation_timestamp: string;
}

export const CANONICAL_CSV_HEADERS: readonly string[] = [
  "id",
  "category",
  "subcategory",
  "material",
  "craft_technique",
  "color",
  "length_cm",
  "width_cm",
  "height_cm",
  "diameter_cm",
  "weight_g",
  "quantity",
  "handmade",
  "production_time_hours",
  "raw_material_cost_inr",
  "labor_cost_inr",
  "packaging_cost_inr",
  "other_cost_inr",
  "market_median_price_inr",
  "market_min_price_inr",
  "market_max_price_inr",
  "market_sample_count",
  "market_trend_score",
  "market_observation_date",
  "description_length",
  "design_complexity_score",
  "image_quality_score",
  "target_selling_price_inr",
] as const;

export class PricingDatasetTransformer {
  /**
   * Transforms a verified artisan product record along with relevant verified market observations.
   * Preserves full provenance of which specific market observation IDs contributed to the market features.
   */
  public static transformProductWithMarketData(
    product: VerifiedArtisanProductInput,
    availableObservations: MarketPriceObservation[]
  ): DerivedTrainingRecord {
    // 1. Query market data for matching craft criteria
    const matchingObs = availableObservations.filter((obs) => {
      const catMatch = obs.productCategory.toLowerCase() === product.category.toLowerCase();
      const typeMatch =
        obs.productType.toLowerCase().includes(product.subcategory.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(obs.productType.toLowerCase());
      const matMatch = obs.material.toLowerCase() === product.material.toLowerCase();
      return catMatch && (typeMatch || matMatch);
    });

    const marketFeatures = MarketDataService.aggregateMarketObservations(
      {
        category: product.category,
        productType: product.subcategory,
        material: product.material,
      },
      matchingObs
    );

    const observationIds = matchingObs
      .map((obs) => obs.id || obs.fingerprint || "")
      .filter((id) => id.length > 0);

    const provenanceSources = Array.from(new Set(matchingObs.map((obs) => obs.source)));

    // Latest observation date
    let latestObsDate: string | null = null;
    if (matchingObs.length > 0) {
      const dates = matchingObs.map((o) => o.observationDate).sort();
      latestObsDate = dates[dates.length - 1];
    }

    return {
      id: product.id,
      category: product.category,
      subcategory: product.subcategory,
      material: product.material,
      craft_technique: product.craftTechnique,
      color: product.color,
      length_cm: product.dimensions?.lengthCm ?? null,
      width_cm: product.dimensions?.widthCm ?? null,
      height_cm: product.dimensions?.heightCm ?? null,
      diameter_cm: product.dimensions?.diameterCm ?? null,
      weight_g: product.weightGrams ?? null,
      quantity: product.quantity ?? 1,
      handmade: product.handmade !== false,
      production_time_hours: product.productionTimeHours ?? null,
      raw_material_cost_inr: product.artisanCosts.rawMaterialCostINR,
      labor_cost_inr: product.artisanCosts.laborCostINR,
      packaging_cost_inr: product.artisanCosts.packagingCostINR,
      other_cost_inr: product.artisanCosts.otherCostINR,
      market_median_price_inr: marketFeatures.available ? marketFeatures.medianPriceINR : null,
      market_min_price_inr: marketFeatures.available ? marketFeatures.minPriceINR : null,
      market_max_price_inr: marketFeatures.available ? marketFeatures.maxPriceINR : null,
      market_sample_count: marketFeatures.available ? marketFeatures.sampleCount : null,
      market_trend_score: marketFeatures.available ? marketFeatures.recentTrendScore : null,
      market_observation_date: latestObsDate,
      description_length: product.descriptionLength ?? 120,
      design_complexity_score: product.designComplexityScore ?? 0.5,
      image_quality_score: product.imageQualityScore ?? 0.8,
      target_selling_price_inr: product.targetSellingPriceINR,

      // Provenance tracking
      market_observation_ids: observationIds,
      provenance_sources: provenanceSources,
      transformation_timestamp: new Date().toISOString(),
    };
  }

  /**
   * Transforms a batch of verified artisan products into derived training records.
   */
  public static transformBatch(
    artisanProducts: VerifiedArtisanProductInput[],
    availableObservations: MarketPriceObservation[]
  ): {
    records: DerivedTrainingRecord[];
    provenanceMap: Record<string, string[]>;
  } {
    const records: DerivedTrainingRecord[] = [];
    const provenanceMap: Record<string, string[]> = {};

    for (const prod of artisanProducts) {
      const derived = this.transformProductWithMarketData(prod, availableObservations);
      records.push(derived);
      provenanceMap[derived.id] = derived.market_observation_ids;
    }

    return { records, provenanceMap };
  }

  /**
   * Formats derived records into strict 28-column canonical CSV format.
   */
  public static formatCanonicalCsv(records: DerivedTrainingRecord[]): string {
    const headerLine = CANONICAL_CSV_HEADERS.join(",");
    const rows = records.map((r) => {
      return [
        r.id,
        r.category,
        r.subcategory,
        r.material,
        r.craft_technique,
        r.color,
        r.length_cm ?? "",
        r.width_cm ?? "",
        r.height_cm ?? "",
        r.diameter_cm ?? "",
        r.weight_g ?? "",
        r.quantity,
        r.handmade,
        r.production_time_hours ?? "",
        r.raw_material_cost_inr,
        r.labor_cost_inr,
        r.packaging_cost_inr,
        r.other_cost_inr,
        r.market_median_price_inr ?? "",
        r.market_min_price_inr ?? "",
        r.market_max_price_inr ?? "",
        r.market_sample_count ?? "",
        r.market_trend_score ?? "",
        r.market_observation_date ?? "",
        r.description_length,
        r.design_complexity_score,
        r.image_quality_score,
        r.target_selling_price_inr,
      ].join(",");
    });

    return [headerLine, ...rows].join("\n");
  }

  /**
   * Generates a provenance manifest JSON linking each training record ID to its source observation IDs.
   */
  public static formatProvenanceManifest(records: DerivedTrainingRecord[]): string {
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalRecords: records.length,
      records: records.map((r) => ({
        id: r.id,
        category: r.category,
        material: r.material,
        market_observation_ids: r.market_observation_ids,
        provenance_sources: r.provenance_sources,
      })),
    };
    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Safe, deterministic audit and training-dataset preparation pipeline.
   *
   * Audits raw market observations against the canonical 28-column schema and training prerequisites:
   * 1. Categorizes facts strictly by provenance:
   *    - verified market facts (observedPriceINR, observationDate, source, location, etc.)
   *    - verified artisan/product facts (cost breakdowns, production time, artisanal workshop ground truth)
   *    - derived features (aggregated market statistics)
   *    - unavailable fields (costs, dimensions, weight when absent)
   * 2. Prevents duplicates using observation fingerprints/IDs.
   * 3. Strictly evaluates validity: NEVER invents, estimates, or defaults missing ground-truth artisan costs or production times.
   * 4. Rejects incomplete observations rather than silently imputing them into training rows.
   * 5. Produces an audit report detailing eligibility, exact rejection reasons, and required missing fields.
   */
  public static auditObservationsForTraining(
    observations: MarketPriceObservation[],
    artisanProducts?: VerifiedArtisanProductInput[]
  ): TrainingAuditReport {
    const timestamp = new Date().toISOString();
    const seenFingerprints = new Set<string>();
    const seenIds = new Set<string>();
    let duplicatesCount = 0;

    const rejectionReasonsSummary: Record<string, number> = {};
    const requiredMissingFieldsSummary: Record<string, number> = {};
    const detailedEvaluations: ObservationAuditEvaluation[] = [];
    const eligibleTrainingRows: DerivedTrainingRecord[] = [];

    // Index any paired verified artisan product records by ID or subcategory/material matching
    const artisanMap = new Map<string, VerifiedArtisanProductInput>();
    if (artisanProducts) {
      for (const p of artisanProducts) {
        artisanMap.set(p.id, p);
      }
    }

    for (const obs of observations) {
      const obsId = obs.id || obs.fingerprint || "unknown_obs";
      const fingerprint = obs.fingerprint || obs.id || "";

      // Duplicate prevention by fingerprint or ID
      if (
        (fingerprint && seenFingerprints.has(fingerprint)) ||
        (obs.id && seenIds.has(obs.id))
      ) {
        duplicatesCount++;
        continue;
      }
      if (fingerprint) seenFingerprints.add(fingerprint);
      if (obs.id) seenIds.add(obs.id);

      const rejectionReasons: string[] = [];
      const missingRequiredFields: string[] = [];

      // 1. Audit market observation legitimacy
      if (!obs.observedPriceINR || isNaN(obs.observedPriceINR) || obs.observedPriceINR <= 0) {
        rejectionReasons.push("MISSING_OR_INVALID_OBSERVED_PRICE");
      }
      if (!obs.productCategory || obs.productCategory.trim() === "") {
        rejectionReasons.push("MISSING_PRODUCT_CATEGORY");
      }
      if (!obs.source || obs.source.trim() === "") {
        rejectionReasons.push("MISSING_VERIFIED_SOURCE");
      }
      if (!obs.observationDate || obs.observationDate.trim() === "") {
        rejectionReasons.push("MISSING_OBSERVATION_DATE");
      }
      if (obs.isSynthetic === true) {
        rejectionReasons.push("SYNTHETIC_DATA_PROHIBITED");
      }

      // Check if this observation has an associated verified artisan product record
      const pairedArtisan = artisanMap.get(obsId);

      // Check required ground truth fields for training CSV schema (CANONICAL_CSV_HEADERS)
      // Required non-null training columns per scripts/train-pricing-model.ts:
      // ["id", "category", "subcategory", "material", "craft_technique", "color", "quantity", "handmade",
      //  "raw_material_cost_inr", "labor_cost_inr", "packaging_cost_inr", "other_cost_inr", "target_selling_price_inr"]

      if (!pairedArtisan) {
        // Standalone market observation lacks verified artisan production costs
        missingRequiredFields.push("raw_material_cost_inr");
        missingRequiredFields.push("labor_cost_inr");
        missingRequiredFields.push("packaging_cost_inr");
        missingRequiredFields.push("other_cost_inr");
        missingRequiredFields.push("production_time_hours");
        missingRequiredFields.push("color");

        rejectionReasons.push("LACKS_VERIFIED_ARTISAN_COST_BREAKDOWN");
        rejectionReasons.push("LACKS_GROUND_TRUTH_PRODUCTION_TIME");
      } else {
        // Paired with artisan record - verify artisan cost data integrity
        if (pairedArtisan.artisanCosts.rawMaterialCostINR === undefined || pairedArtisan.artisanCosts.rawMaterialCostINR === null) {
          missingRequiredFields.push("raw_material_cost_inr");
        }
        if (pairedArtisan.artisanCosts.laborCostINR === undefined || pairedArtisan.artisanCosts.laborCostINR === null) {
          missingRequiredFields.push("labor_cost_inr");
        }
        if (pairedArtisan.artisanCosts.packagingCostINR === undefined || pairedArtisan.artisanCosts.packagingCostINR === null) {
          missingRequiredFields.push("packaging_cost_inr");
        }
        if (pairedArtisan.artisanCosts.otherCostINR === undefined || pairedArtisan.artisanCosts.otherCostINR === null) {
          missingRequiredFields.push("other_cost_inr");
        }
        if (missingRequiredFields.length > 0) {
          rejectionReasons.push("INCOMPLETE_ARTISAN_COST_DATA");
        }
      }

      // Record summary counters
      for (const reason of rejectionReasons) {
        rejectionReasonsSummary[reason] = (rejectionReasonsSummary[reason] || 0) + 1;
      }
      for (const field of missingRequiredFields) {
        requiredMissingFieldsSummary[field] = (requiredMissingFieldsSummary[field] || 0) + 1;
      }

      // Build provenance classification
      const verifiedMarketFacts: Record<string, any> = {
        observedPriceINR: obs.observedPriceINR,
        source: obs.source,
        sourceType: obs.sourceType,
        productCategory: obs.productCategory,
        productType: obs.productType,
        material: obs.material,
        craftTechnique: obs.craftTechnique,
        observationDate: obs.observationDate,
        confidence: obs.confidence,
        location: obs.location,
        urlOrReference: obs.urlOrReference,
      };

      const verifiedArtisanFacts: Record<string, any> = pairedArtisan
        ? {
            rawMaterialCostINR: pairedArtisan.artisanCosts.rawMaterialCostINR,
            laborCostINR: pairedArtisan.artisanCosts.laborCostINR,
            packagingCostINR: pairedArtisan.artisanCosts.packagingCostINR,
            otherCostINR: pairedArtisan.artisanCosts.otherCostINR,
            productionTimeHours: pairedArtisan.productionTimeHours,
            dimensions: pairedArtisan.dimensions,
            weightGrams: pairedArtisan.weightGrams,
            quantity: pairedArtisan.quantity,
            handmade: pairedArtisan.handmade,
          }
        : {};

      const derivedFeatures: Record<string, any> = {
        marketContextAggregated: false,
      };

      const unavailableFields: string[] = pairedArtisan
        ? []
        : [
            "raw_material_cost_inr",
            "labor_cost_inr",
            "packaging_cost_inr",
            "other_cost_inr",
            "production_time_hours",
            "dimensions (length/width/height/diameter)",
            "weight_g",
            "verified_artisan_color",
          ];

      const isEligible = rejectionReasons.length === 0 && missingRequiredFields.length === 0;

      if (isEligible && pairedArtisan) {
        const derivedRow = this.transformProductWithMarketData(pairedArtisan, [obs]);
        eligibleTrainingRows.push(derivedRow);
      }

      detailedEvaluations.push({
        observationId: obsId,
        fingerprint,
        productCategory: obs.productCategory,
        productType: obs.productType,
        material: obs.material,
        observedPriceINR: obs.observedPriceINR,
        isEligible,
        rejectionReasons,
        missingRequiredFields,
        fieldProvenance: {
          verifiedMarketFacts,
          verifiedArtisanFacts,
          derivedFeatures,
          unavailableFields,
        },
      });
    }

    const uniqueCount = seenFingerprints.size;
    const eligibleCount = eligibleTrainingRows.length;
    const rejectedCount = detailedEvaluations.length - eligibleCount;

    return {
      timestamp,
      totalObservationsExamined: observations.length,
      uniqueFingerprintsExamined: uniqueCount,
      duplicateObservationsSkipped: duplicatesCount,
      eligibleForTrainingCount: eligibleCount,
      rejectedCount,
      rejectionReasonsSummary,
      requiredMissingFieldsSummary,
      detailedEvaluations,
      trainingRowsProduced: eligibleTrainingRows.length,
      eligibleTrainingRows,
      isTrainingDatasetReady: eligibleTrainingRows.length >= 15,
      message:
        eligibleTrainingRows.length === 0
          ? "No observations can legitimately produce complete training rows because standalone market observations lack ground-truth artisan production costs and time. To avoid fabricating data, 0 rows were added to pricing_training.csv."
          : `Successfully produced ${eligibleTrainingRows.length} verified training rows.`,
    };
  }
}

