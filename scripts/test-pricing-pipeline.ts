#!/usr/bin/env tsx
/**
 * Kala-Kart Pricing Pipeline Verification Test Suite
 *
 * Validates:
 * 1. Dataset Not Ready handling
 * 2. Feature engineering & vector generation
 * 3. Market data aggregation and "Market data unavailable" contract
 * 4. Cost sanity check (break-even floor & below-cost warning)
 * 5. Full inference with Random Forest Regressor
 * 6. Explicit pricing basis strings
 */

import fs from "fs";
import path from "path";
import { PricingPipeline } from "../src/services/pricing/pricingPipeline";
import { MarketDataService } from "../src/services/pricing/marketDataService";
import { performCostSanityCheck } from "../src/services/pricing/costSanityCheck";
import { ImageDescriptionExtractor } from "../src/services/pricing/imageDescriptionExtractor";
import {
  extractFeaturesFromProduct,
  getFeatureNames,
  normalizeMaterial,
  normalizeMacroTechnique,
  MATERIAL_VOCAB,
  CRAFT_TECHNIQUE_VOCAB,
  MACRO_TECHNIQUE_VOCAB,
} from "../src/services/pricing/featureEngineering";
import { RandomForestRegressor } from "../src/services/pricing/ml/randomForestRegression";
import {
  PricingDatasetTransformer,
  CANONICAL_CSV_HEADERS,
  VerifiedArtisanProductInput,
} from "../src/services/pricing/datasetTransformer";
import { ProductPricingFeatures, ModelMetadata, MarketPriceObservation, ArtisanCostData } from "../src/types/pricing";
import { CatalogItem } from "../src/types/artisan";
import { buildArtisanProductInput } from "../src/utils/pricingFeatureBuilder";

console.log("==================================================");
console.log("KALA-KART PRICING FOUNDATION VERIFICATION TEST");
console.log("==================================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  // Test 1: Cost Sanity Check Floor Logic
  console.log("\n--- Testing 4A.9: Cost Sanity Check ---");
  const costData = {
    rawMaterialCostINR: 300,
    laborCostINR: 500,
    packagingCostINR: 80,
    otherCostINR: 20,
    quantity: 1,
  };
  const sanityPass = performCostSanityCheck(costData, 1200);
  assert(sanityPass.totalProductionCostINR === 900, "Calculates exact total production cost (₹900)");
  assert(sanityPass.costPerUnitINR === 900, "Calculates cost per unit (₹900)");
  assert(sanityPass.isBelowCost === false, "Recognizes price ₹1200 >= cost ₹900");
  assert(sanityPass.costWarning === null, "No warning issued when price covers cost");

  const sanityFail = performCostSanityCheck(costData, 750);
  assert(sanityFail.isBelowCost === true, "Flags when price ₹750 < cost ₹900");
  assert(
    sanityFail.costWarning !== null && sanityFail.costWarning.includes("is below estimated production cost"),
    "Generates explicit warning message about below-cost pricing"
  );

  // Test 2: Market Data Service Contract
  console.log("\n--- Testing 4A.4: Market Data Aggregation ---");
  MarketDataService.clearObservations();
  const emptyMarket = MarketDataService.aggregateMarketObservations({ category: "pottery" });
  assert(emptyMarket.available === false, "Reports available: false when zero observations exist");
  assert(
    emptyMarket.statusMessage === "Market data unavailable",
    "Reports explicit 'Market data unavailable' string"
  );

  // Register authentic observations
  MarketDataService.registerObservations([
    {
      source: "Jaipur Craft Fair Official Bulletin",
      productCategory: "pottery",
      productType: "blue pottery vase",
      material: "blue_pottery",
      observedPriceINR: 1600,
      observationDate: "2026-02-15",
      confidence: 0.9,
    },
    {
      source: "Export Promotion Council for Handicrafts",
      productCategory: "pottery",
      productType: "blue pottery vase",
      material: "blue_pottery",
      observedPriceINR: 1900,
      observationDate: "2026-03-01",
      confidence: 0.95,
    },
  ]);

  const potteryMarket = MarketDataService.aggregateMarketObservations({
    category: "pottery",
    productType: "vase",
    material: "blue_pottery",
  });
  assert(potteryMarket.available === true, "Aggregates legitimate market observations");
  assert(potteryMarket.medianPriceINR === 1750, "Calculates accurate median price (₹1750)");
  assert(potteryMarket.sampleCount === 2, "Records accurate sample count (2)");

  // Test 3: Feature Engineering Vector Dimensions
  console.log("\n--- Testing 4A.2: Feature Vector Consistency ---");
  const featureNames = getFeatureNames();
  const sampleFeatures: ProductPricingFeatures = {
    category: "pottery",
    subcategory: "vase",
    material: "blue_pottery",
    craftTechnique: "hand_glazed",
    color: "cobalt_blue",
    dimensions: { heightCm: 32, diameterCm: 18 },
    weightGrams: 1850,
    quantity: 1,
    handmade: true,
    productionTimeHours: 12,
    artisanCosts: costData,
    descriptionFeatures: {
      textLength: 180,
      wordCount: 28,
      mentionsHeritage: true,
      mentionsFairWage: true,
      designComplexityScore: 0.85,
    },
    imageFeatures: {
      visualComplexity: 0.8,
      imageQualityScore: 0.9,
      isHighResolution: true,
      hasCleanBackground: true,
      confidence: 0.85,
    },
    marketFeatures: potteryMarket,
  };

  const vector = extractFeaturesFromProduct(sampleFeatures);
  assert(
    vector.length === featureNames.length,
    `Feature vector length (${vector.length}) matches feature names count (${featureNames.length})`
  );
  assert(
    vector.every((v) => typeof v === "number" && !isNaN(v)),
    "Feature vector contains strictly valid finite numbers"
  );

  // Test 4: Pipeline Status when Dataset Not Ready
  console.log("\n--- Testing 4A.8 & 4A.11: Pipeline Status Handling ---");
  const unreadyResult = await PricingPipeline.predictPrice(sampleFeatures);
  assert(
    unreadyResult.status === "DATASET_NOT_READY",
    "Returns DATASET_NOT_READY when model is uninitialized"
  );
  assert(
    unreadyResult.predictedPriceINR === null,
    "Predicted price is null when dataset not ready"
  );
  assert(
    unreadyResult.pricingBasis.includes("DATASET NOT READY"),
    "Pricing basis states DATASET NOT READY explicitly"
  );

  // Test 5: Full Inference with Trained Model
  console.log("\n--- Testing 4A.5 & 4A.8: Model Prediction with Loaded Weights ---");
  const weightsPath = path.join(process.cwd(), "data", "pricing", "model_weights.json");
  if (fs.existsSync(weightsPath)) {
    const weights = JSON.parse(fs.readFileSync(weightsPath, "utf-8"));
    const meta: ModelMetadata = {
      modelVersion: "pricing-v0.1-test",
      modelType: "RandomForestRegressor",
      trainingDatasetVersion: "v0.1-demo",
      trainingDate: new Date().toISOString(),
      featureVersion: "v1.0",
      trainingSampleCount: 32,
      featuresUsed: featureNames,
      evaluationMetrics: null,
      status: "trained",
    };

    PricingPipeline.loadSerializedModel(weights, meta);

    // Predict with market data available
    const marketResult = await PricingPipeline.predictPrice(sampleFeatures);
    assert(marketResult.status === "FULL_MARKET_AWARE", "Reports FULL_MARKET_AWARE status");
    assert(
      typeof marketResult.predictedPriceINR === "number" && marketResult.predictedPriceINR > 0,
      `Calculates positive regression estimate (₹${marketResult.predictedPriceINR})`
    );
    assert(
      marketResult.lowerBoundINR !== null &&
        marketResult.upperBoundINR !== null &&
        marketResult.lowerBoundINR <= marketResult.predictedPriceINR &&
        marketResult.upperBoundINR >= marketResult.predictedPriceINR,
      `Provides valid confidence bounds [₹${marketResult.lowerBoundINR} - ₹${marketResult.upperBoundINR}]`
    );
    assert(
      marketResult.pricingBasis === "ML prediction using product, artisan cost, and market features",
      "Explicitly reports full pricing basis"
    );

    // Predict with market data unavailable
    const sampleFeaturesNoMarket: ProductPricingFeatures = {
      ...sampleFeatures,
      marketFeatures: {
        available: false,
        medianPriceINR: null,
        minPriceINR: null,
        maxPriceINR: null,
        sampleCount: 0,
        recentTrendScore: null,
        statusMessage: "Market data unavailable",
      },
    };
    const noMarketResult = await PricingPipeline.predictPrice(sampleFeaturesNoMarket);
    assert(
      noMarketResult.status === "MARKET_DATA_UNAVAILABLE",
      "Reports MARKET_DATA_UNAVAILABLE when market observations are absent"
    );
    assert(
      noMarketResult.pricingBasis ===
        "ML prediction using product and artisan cost features; market data unavailable",
      "Explicitly reports market data unavailable in pricing basis"
    );
  } else {
    console.log("Model weights file not found; skipping trained inference assertion.");
  }

  // Test 6: Empirical Vocabulary & Feature Alignment (Step 4E)
  console.log("\n--- Testing 4E: Empirical Vocabulary & Feature Alignment ---");
  const matOtherIdx = featureNames.indexOf("mat_other");

  // 1. Bamboo mapping
  const bambooFeatures: ProductPricingFeatures = { ...sampleFeatures, material: "bamboo" };
  const bambooVec = extractFeaturesFromProduct(bambooFeatures);
  const bambooIdx = featureNames.indexOf("mat_bamboo");
  assert(bambooIdx !== -1, "mat_bamboo feature exists in featureNames");
  assert(bambooVec[bambooIdx] === 1, "bamboo maps to mat_bamboo (value = 1)");
  assert(bambooVec[matOtherIdx] === 0, "bamboo no longer automatically maps to mat_other (value = 0)");

  // 2. Cane mapping
  const caneFeatures: ProductPricingFeatures = { ...sampleFeatures, material: "cane" };
  const caneVec = extractFeaturesFromProduct(caneFeatures);
  const caneIdx = featureNames.indexOf("mat_cane");
  assert(caneIdx !== -1, "mat_cane feature exists in featureNames");
  assert(caneVec[caneIdx] === 1, "cane maps to mat_cane (value = 1)");
  assert(caneVec[matOtherIdx] === 0, "cane no longer automatically maps to mat_other (value = 0)");

  // 3. Jute mapping
  const juteFeatures: ProductPricingFeatures = { ...sampleFeatures, material: "jute" };
  const juteVec = extractFeaturesFromProduct(juteFeatures);
  const juteIdx = featureNames.indexOf("mat_jute");
  assert(juteIdx !== -1, "mat_jute feature exists in featureNames");
  assert(juteVec[juteIdx] === 1, "jute maps to mat_jute (value = 1)");
  assert(juteVec[matOtherIdx] === 0, "jute no longer automatically maps to mat_other (value = 0)");

  // 4. Leather mapping
  const leatherFeatures: ProductPricingFeatures = { ...sampleFeatures, material: "leather" };
  const leatherVec = extractFeaturesFromProduct(leatherFeatures);
  const leatherIdx = featureNames.indexOf("mat_leather");
  assert(leatherIdx !== -1, "mat_leather feature exists in featureNames");
  assert(leatherVec[leatherIdx] === 1, "leather maps to mat_leather (value = 1)");
  assert(leatherVec[matOtherIdx] === 0, "leather no longer automatically maps to mat_other (value = 0)");

  // 5. Terracotta mapping
  const terracottaFeatures: ProductPricingFeatures = { ...sampleFeatures, material: "terracotta" };
  const terracottaVec = extractFeaturesFromProduct(terracottaFeatures);
  const terracottaIdx = featureNames.indexOf("mat_terracotta");
  assert(terracottaIdx !== -1, "mat_terracotta feature exists in featureNames");
  assert(terracottaVec[terracottaIdx] === 1, "terracotta maps consistently to mat_terracotta (value = 1)");
  assert(terracottaVec[matOtherIdx] === 0, "terracotta does not map to mat_other (value = 0)");

  // 6. Broad "handcrafted" separation from specific micro-techniques
  const handcraftedFeatures: ProductPricingFeatures = { ...sampleFeatures, craftTechnique: "handcrafted" };
  const handcraftedVec = extractFeaturesFromProduct(handcraftedFeatures);
  const techOtherIdx = featureNames.indexOf("tech_other");
  const macroHandcraftedIdx = featureNames.indexOf("macro_tech_handcrafted");
  const macroOtherIdx = featureNames.indexOf("macro_tech_other");

  const specificMicroTechIndices = CRAFT_TECHNIQUE_VOCAB
    .filter((t) => t !== "other")
    .map((t) => featureNames.indexOf(`tech_${t}`));
  const falseMicroActivations = specificMicroTechIndices.filter((idx) => handcraftedVec[idx] !== 0);

  assert(
    falseMicroActivations.length === 0,
    'Broad "handcrafted" does not activate any specific micro-technique features'
  );
  assert(
    handcraftedVec[techOtherIdx] === 1,
    'Broad "handcrafted" maps to tech_other rather than a false micro-technique'
  );
  assert(
    handcraftedVec[macroHandcraftedIdx] === 1,
    'Broad "handcrafted" cleanly activates macro_tech_handcrafted (value = 1)'
  );
  assert(
    handcraftedVec[macroOtherIdx] === 0,
    'Broad "handcrafted" does not fall into macro_tech_other (value = 0)'
  );

  // 7. Aliases normalize deterministically
  assert(normalizeMaterial("bamboo and cane") === "bamboo", '"bamboo and cane" normalizes to bamboo');
  assert(normalizeMaterial("bamboo_and_cane") === "bamboo", '"bamboo_and_cane" normalizes to bamboo');
  assert(normalizeMaterial("cane wood") === "cane", '"cane wood" normalizes to cane');
  assert(normalizeMaterial("tulsi stem wood") === "tulsi_stem_wood", '"tulsi stem wood" normalizes to tulsi_stem_wood');
  assert(normalizeMaterial("silk thread and plastic") === "silk", '"silk thread and plastic" normalizes to silk');
  assert(normalizeMaterial("copper and silver coating") === "copper", '"copper and silver coating" normalizes to copper');
  assert(normalizeMacroTechnique("Bandhani tie dye") === "bandhani_tie_dye", '"Bandhani tie dye" normalizes to bandhani_tie_dye');
  assert(normalizeMacroTechnique("Madhubani") === "madhubani", '"Madhubani" normalizes to madhubani');
  assert(normalizeMacroTechnique("Bastar art") === "bastar_art", '"Bastar art" normalizes to bastar_art');
  assert(normalizeMacroTechnique("Lippan art") === "lippan_art", '"Lippan art" normalizes to lippan_art');
  assert(normalizeMacroTechnique("hand painted") === "hand_painted", '"hand painted" normalizes to hand_painted');
  assert(normalizeMacroTechnique("handloom") === "handloom", '"handloom" normalizes to handloom');
  assert(normalizeMacroTechnique("handmade") === "handmade", '"handmade" normalizes to handmade');
  assert(normalizeMacroTechnique("handwoven") === "handwoven", '"handwoven" normalizes to handwoven');
  assert(normalizeMacroTechnique("applique") === "applique", '"applique" normalizes to applique');
  assert(normalizeMacroTechnique("embroidery") === "embroidery", '"embroidery" normalizes to embroidery');
  assert(normalizeMacroTechnique("crochet") === "crochet", '"crochet" normalizes to crochet');
  assert(normalizeMacroTechnique("relief art") === "relief_art", '"relief art" normalizes to relief_art');
  assert(normalizeMacroTechnique("jali work") === "jali_work", '"jali work" normalizes to jali_work');

  // 8. Feature vector dimensions remain internally consistent
  assert(
    featureNames.length === 223,
    `Feature vocabulary dimension expanded to exactly 223 (got ${featureNames.length})`
  );
  assert(
    bambooVec.length === featureNames.length,
    "Bamboo feature vector length strictly equals getFeatureNames length"
  );
  assert(
    caneVec.length === featureNames.length,
    "Cane feature vector length strictly equals getFeatureNames length"
  );
  assert(
    juteVec.length === featureNames.length,
    "Jute feature vector length strictly equals getFeatureNames length"
  );
  assert(
    leatherVec.length === featureNames.length,
    "Leather feature vector length strictly equals getFeatureNames length"
  );
  assert(
    terracottaVec.length === featureNames.length,
    "Terracotta feature vector length strictly equals getFeatureNames length"
  );
  assert(
    handcraftedVec.length === featureNames.length,
    "Handcrafted feature vector length strictly equals getFeatureNames length"
  );

  // Test 7: Safe Training Dataset Preparation & Audit Pipeline
  console.log("\n--- Testing 7: Safe Training Dataset Preparation & Audit Pipeline ---");

  // 1. Audit on real empirical market observations
  const realObsRaw = fs.readFileSync(path.join(process.cwd(), "data", "pricing", "market_observations.json"), "utf-8");
  const realObs: MarketPriceObservation[] = JSON.parse(realObsRaw);
  const auditReport = PricingDatasetTransformer.auditObservationsForTraining(realObs);

  const totalObs = realObs.length;
  assert(auditReport.totalObservationsExamined === totalObs, `Examines all ${totalObs} verified empirical market observations`);
  assert(auditReport.uniqueFingerprintsExamined === totalObs, `Identifies ${totalObs} unique observation fingerprints`);
  assert(auditReport.duplicateObservationsSkipped === 0, "No duplicates present in the verified observation store");
  assert(auditReport.eligibleForTrainingCount === 0, "Zero standalone observations eligible without artisan cost data");
  assert(auditReport.rejectedCount === totalObs, `All ${totalObs} standalone observations correctly rejected for missing artisan costs`);
  assert(auditReport.trainingRowsProduced === 0, "Produces 0 training rows, avoiding fabricating ungrounded data");
  assert(auditReport.isTrainingDatasetReady === false, "Correctly reports dataset is NOT ready (status: false)");
  assert(
    (auditReport.rejectionReasonsSummary["LACKS_VERIFIED_ARTISAN_COST_BREAKDOWN"] || 0) === totalObs,
    `Accurately reports LACKS_VERIFIED_ARTISAN_COST_BREAKDOWN for all ${totalObs} observations`
  );
  assert(
    (auditReport.requiredMissingFieldsSummary["raw_material_cost_inr"] || 0) === totalObs,
    `Explicitly reports raw_material_cost_inr missing for all ${totalObs} observations`
  );

  const sampleObs1: MarketPriceObservation = {
    id: "sample_obs_001",
    fingerprint: "sample_fp_001",
    productCategory: "pottery",
    productType: "vase",
    material: "terracotta",
    craftTechnique: "wheel_thrown",
    observedPriceINR: 1800,
    observationDate: "2026-02-15",
    source: "Verified State Craft Council Bulletin",
    sourceType: "CRAFT_COUNCIL",
    confidence: 0.95,
  };

  const sampleObs2: MarketPriceObservation = {
    id: "sample_obs_002",
    fingerprint: "sample_fp_002",
    productCategory: "pottery",
    productType: "vase",
    material: "terracotta",
    craftTechnique: "wheel_thrown",
    observedPriceINR: 1950,
    observationDate: "2026-02-20",
    source: "Verified State Craft Council Bulletin",
    sourceType: "CRAFT_COUNCIL",
    confidence: 0.95,
  };

  const baseObs1 = realObs[0] || sampleObs1;
  const baseObs2 = realObs[1] || sampleObs2;

  // 2. Duplicate Prevention
  const dupObs: MarketPriceObservation[] = [
    baseObs1,
    baseObs1, // duplicate by fingerprint and id
    baseObs2,
  ];
  const dupAudit = PricingDatasetTransformer.auditObservationsForTraining(dupObs);
  assert(dupAudit.totalObservationsExamined === 3, "Examines 3 observations containing a duplicate");
  assert(dupAudit.uniqueFingerprintsExamined === 2, "Identifies exactly 2 unique fingerprints");
  assert(dupAudit.duplicateObservationsSkipped === 1, "Correctly skips 1 duplicate observation");

  // 3. Rejection of Synthetic Observations
  const synthObs: MarketPriceObservation[] = [
    {
      ...baseObs1,
      id: "test_synth_1",
      fingerprint: "synth_fp_1",
      isSynthetic: true,
    },
  ];
  const synthAudit = PricingDatasetTransformer.auditObservationsForTraining(synthObs);
  assert(
    synthAudit.detailedEvaluations[0].rejectionReasons.includes("SYNTHETIC_DATA_PROHIBITED"),
    "Explicitly rejects synthetic observations with SYNTHETIC_DATA_PROHIBITED"
  );

  // 4. Rejection of Invalid or Zero Target Selling Price
  const invalidPriceObs: MarketPriceObservation[] = [
    {
      ...baseObs1,
      id: "test_zero_price",
      fingerprint: "zero_price_fp",
      observedPriceINR: 0,
    },
  ];
  const zeroPriceAudit = PricingDatasetTransformer.auditObservationsForTraining(invalidPriceObs);
  assert(
    zeroPriceAudit.detailedEvaluations[0].rejectionReasons.includes("MISSING_OR_INVALID_OBSERVED_PRICE"),
    "Explicitly rejects non-positive observed prices with MISSING_OR_INVALID_OBSERVED_PRICE"
  );

  // 5. Verified Artisan Product Record + Market Observation Pairing (Proven Ground Truth)
  const sampleArtisanRecord: VerifiedArtisanProductInput = {
    id: baseObs1.id || "artisan_prod_001",
    category: "pottery",
    subcategory: "vase",
    material: "terracotta",
    craftTechnique: "wheel_thrown",
    color: "natural_ochre",
    dimensions: { heightCm: 25, diameterCm: 14 },
    weightGrams: 1100,
    quantity: 1,
    handmade: true,
    productionTimeHours: 6.0,
    artisanCosts: {
      rawMaterialCostINR: 150,
      laborCostINR: 400,
      packagingCostINR: 50,
      otherCostINR: 30,
      quantity: 1,
    },
    descriptionLength: 140,
    designComplexityScore: 0.6,
    imageQualityScore: 0.85,
    targetSellingPriceINR: 1800, // Matching observed real market price
  };

  const pairedAudit = PricingDatasetTransformer.auditObservationsForTraining(
    [baseObs1],
    [sampleArtisanRecord]
  );
  assert(pairedAudit.eligibleForTrainingCount === 1, "Eligible when paired with genuine artisan cost data");
  assert(pairedAudit.trainingRowsProduced === 1, "Produces 1 valid training row when complete ground truth exists");
  assert(
    pairedAudit.eligibleTrainingRows[0].target_selling_price_inr === 1800,
    "Preserves verified observed market price as target_selling_price_inr"
  );
  assert(
    pairedAudit.eligibleTrainingRows[0].raw_material_cost_inr === 150,
    "Preserves verified raw_material_cost_inr without invention"
  );
  assert(
    pairedAudit.eligibleTrainingRows[0].labor_cost_inr === 400,
    "Preserves verified labor_cost_inr without invention"
  );

  // 6. Schema Compliance of Generated Row
  const generatedCsv = PricingDatasetTransformer.formatCanonicalCsv(pairedAudit.eligibleTrainingRows);
  const csvLines = generatedCsv.trim().split("\n");
  assert(csvLines.length === 2, "Canonical CSV formatter outputs header line + 1 data line");
  const headers = csvLines[0].split(",");
  const dataCols = csvLines[1].split(",");
  assert(headers.length === CANONICAL_CSV_HEADERS.length, `Header contains exact ${CANONICAL_CSV_HEADERS.length} columns`);
  assert(dataCols.length === CANONICAL_CSV_HEADERS.length, `Data row contains exact ${CANONICAL_CSV_HEADERS.length} columns`);
  assert(CANONICAL_CSV_HEADERS.length === 28, "Canonical training schema is strictly 28 columns");

  // 7. Rejection if Artisan Record Has Incomplete Costs (No Partial Invention)
  const incompleteArtisan: VerifiedArtisanProductInput = {
    ...sampleArtisanRecord,
    id: "incomplete_artisan_002",
    artisanCosts: {
      ...sampleArtisanRecord.artisanCosts,
      laborCostINR: null as any, // Missing labor cost
    },
  };
  const incompleteAudit = PricingDatasetTransformer.auditObservationsForTraining(
    [{ ...baseObs1, id: "incomplete_artisan_002", fingerprint: "incomplete_fp_2" }],
    [incompleteArtisan]
  );
  assert(
    incompleteAudit.eligibleForTrainingCount === 0,
    "Rejects row when artisan cost data is partially missing, refusing to guess labor cost"
  );
  assert(
    incompleteAudit.detailedEvaluations[0].rejectionReasons.includes("INCOMPLETE_ARTISAN_COST_DATA"),
    "Flags INCOMPLETE_ARTISAN_COST_DATA when labor cost is missing"
  );

  // Test 8: Verified Artisan-Product Bridge for Pricing Dataset Preparation
  console.log("\n--- Testing 8: Verified Artisan-Product Bridge (buildArtisanProductInput) ---");

  const validCatalog: CatalogItem = {
    id: "item-banarasi-001",
    category: "Handloom & Textiles",
    originalImage: "https://example.com/banarasi.jpg",
    studioImage: "https://example.com/banarasi_studio.jpg",
    titleEn: "Handwoven Pure Silk Banarasi Saree",
    titleHi: "हस्तनिर्मित शुद्ध रेशम बनारसी साड़ी",
    descriptionEn: "Authentic handwoven pure katan silk Banarasi saree with traditional zari work.",
    descriptionHi: "पारंपरिक ज़री काम के साथ प्रामाणिक हस्तनिर्मित शुद्ध कातान रेशम बनारसी साड़ी।",
    searchTags: ["#silk", "#banarasi", "#handloom"],
    specs: {
      productName: "Banarasi Saree",
      material: "silk",
      craftTechnique: "handloom",
      color: "golden",
      dimensions: "5.5 m x 1.1 m",
      weight: "650 grams",
      quantity: "1 piece",
      isHandmade: true,
      productionTime: "24 hours",
      regionHeritage: "Varanasi, Uttar Pradesh",
    },
    pricing: {
      baseCost: 2800,
      marketPrice: 5200, // Artisan selected price (NOT treated as empirical market target)
      exhibitionPrice: 8500,
      explanationEn: "Calculated based on verified material and artisan production hours.",
      explanationHi: "सामग्री और शिल्पकार के श्रम समय के आधार पर मूल्य निर्धारण।",
      selectedTier: "market",
    },
    createdAt: "2026-09-06T08:00:00.000Z",
    status: "live",
    marketplacePlatforms: ["ONDC Karigar"],
  };

  const validCosts: ArtisanCostData = {
    rawMaterialCostINR: 1200,
    laborCostINR: 1800,
    packagingCostINR: 150,
    otherCostINR: 80,
    quantity: 1,
  };

  // 8.1 Complete valid CatalogItem + costs + explicit target price produces valid artisan input
  const validBridgeResult = buildArtisanProductInput(validCatalog, validCosts, 4800);
  assert(validBridgeResult.success === true, "Complete valid CatalogItem + costs produces valid artisan input");
  assert(validBridgeResult.productInput !== null, "Product input is populated when validation passes");
  assert(validBridgeResult.validationErrors.length === 0, "Zero validation errors on complete valid input");
  assert(validBridgeResult.productInput?.id === "item-banarasi-001", "ID is correctly preserved");
  assert(validBridgeResult.productInput?.category === "textiles", "Category normalized to textiles");
  assert(validBridgeResult.productInput?.subcategory === "saree", "Subcategory detected as saree");
  assert(validBridgeResult.productInput?.material === "silk", "Material preserved as silk");
  assert(validBridgeResult.productInput?.craftTechnique === "handloom", "Craft technique preserved as handloom");
  assert(validBridgeResult.productInput?.color === "golden", "Color preserved as golden");
  assert(validBridgeResult.productInput?.dimensions?.lengthCm === 550, "Length parsed correctly (5.5m -> 550cm)");
  assert(validBridgeResult.productInput?.dimensions?.widthCm === 110, "Width parsed correctly (1.1m -> 110cm)");
  assert(validBridgeResult.productInput?.weightGrams === 650, "Weight parsed correctly (650g)");
  assert(validBridgeResult.productInput?.productionTimeHours === 24, "Production time parsed correctly (24 hours)");
  assert(validBridgeResult.productInput?.targetSellingPriceINR === 4800, "Explicit target price 4800 is preserved");
  assert(
    validBridgeResult.productInput?.targetSellingPriceINR !== validCatalog.pricing.marketPrice,
    "Target price strictly uses explicitly provided price, NOT catalog.pricing.marketPrice"
  );

  // 8.2 Missing cost is rejected
  const missingCostData: ArtisanCostData = {
    ...validCosts,
    laborCostINR: 0, // Invalid/zero labor cost
  };
  const missingCostResult = buildArtisanProductInput(validCatalog, missingCostData, 4800);
  assert(missingCostResult.success === false, "Missing/zero labor cost is rejected");
  assert(
    missingCostResult.validationErrors.includes("MISSING_OR_INVALID_LABOR_COST"),
    "Flags MISSING_OR_INVALID_LABOR_COST when labor cost <= 0"
  );
  assert(missingCostResult.productInput === null, "Product input is null when cost is missing");

  // 8.3 Invalid cost (NaN/negative) is rejected
  const invalidCostData: ArtisanCostData = {
    ...validCosts,
    rawMaterialCostINR: -100,
  };
  const invalidCostResult = buildArtisanProductInput(validCatalog, invalidCostData, 4800);
  assert(invalidCostResult.success === false, "Negative raw material cost is rejected");
  assert(
    invalidCostResult.validationErrors.includes("MISSING_OR_INVALID_RAW_MATERIAL_COST"),
    "Flags MISSING_OR_INVALID_RAW_MATERIAL_COST on negative cost"
  );

  // 8.4 Missing physical ground-truth fields are rejected
  const missingDimCatalog: CatalogItem = {
    ...validCatalog,
    specs: {
      ...validCatalog.specs,
      dimensions: "", // Missing dimensions
    },
  };
  const missingDimResult = buildArtisanProductInput(missingDimCatalog, validCosts, 4800);
  assert(missingDimResult.success === false, "Missing dimensions is rejected rather than inventing values");
  assert(
    missingDimResult.validationErrors.includes("MISSING_PHYSICAL_DIMENSIONS"),
    "Flags MISSING_PHYSICAL_DIMENSIONS when dimensions string is empty"
  );

  const missingWeightCatalog: CatalogItem = {
    ...validCatalog,
    specs: {
      ...validCatalog.specs,
      weight: "", // Missing weight
    },
  };
  const missingWeightResult = buildArtisanProductInput(missingWeightCatalog, validCosts, 4800);
  assert(missingWeightResult.success === false, "Missing weight is rejected rather than inventing values");
  assert(
    missingWeightResult.validationErrors.includes("MISSING_OR_INVALID_WEIGHT"),
    "Flags MISSING_OR_INVALID_WEIGHT when weight string is empty"
  );

  const missingTimeCatalog: CatalogItem = {
    ...validCatalog,
    specs: {
      ...validCatalog.specs,
      productionTime: "", // Missing production time
    },
  };
  const missingTimeResult = buildArtisanProductInput(missingTimeCatalog, validCosts, 4800);
  assert(missingTimeResult.success === false, "Missing production time is rejected rather than guessing");
  assert(
    missingTimeResult.validationErrors.includes("MISSING_OR_INVALID_PRODUCTION_TIME"),
    "Flags MISSING_OR_INVALID_PRODUCTION_TIME when time string is empty"
  );

  // 8.5 Explicit target price requirement (Target price accepted ONLY when explicitly supplied)
  const noTargetPriceResult = buildArtisanProductInput(validCatalog, validCosts); // Target price omitted
  assert(noTargetPriceResult.success === false, "Fails when target selling price is omitted");
  assert(
    noTargetPriceResult.validationErrors.includes("MISSING_OR_INVALID_EXPLICIT_TARGET_SELLING_PRICE"),
    "Flags MISSING_OR_INVALID_EXPLICIT_TARGET_SELLING_PRICE when omitted"
  );
  assert(
    noTargetPriceResult.productInput === null,
    "Refuses to silently adopt catalog.pricing.marketPrice as empirical target"
  );

  // 8.6 Output fields preserve provenance
  assert(
    validBridgeResult.provenance.verifiedCosts.rawMaterialCostINR === 1200,
    "Provenance records exact verified raw material cost"
  );
  assert(
    validBridgeResult.provenance.verifiedCosts.laborCostINR === 1800,
    "Provenance records exact verified labor cost"
  );
  assert(
    validBridgeResult.provenance.explicitTargetSellingPrice === 4800,
    "Provenance records explicit target price"
  );
  assert(
    validBridgeResult.provenance.verifiedArtisanFacts.productionTimeHours === 24,
    "Provenance records exact production time hours"
  );

  // 8.7 Adapter compatibility with PricingDatasetTransformer
  const auditWithBridge = PricingDatasetTransformer.auditObservationsForTraining(
    [baseObs1],
    [validBridgeResult.productInput!]
  );
  assert(
    auditWithBridge.detailedEvaluations.length === 1,
    "PricingDatasetTransformer seamlessly consumes VerifiedArtisanProductInput from bridge"
  );

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
