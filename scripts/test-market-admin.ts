#!/usr/bin/env tsx
/**
 * Kala-Kart Step 4D: Verified Market Data Admin Test Suite
 *
 * Validates:
 * 1. Valid observation submission via MarketIngestionService
 * 2. Validation error display and exact error message return
 * 3. Duplicate observation handling without duplicate record creation
 * 4. Strict rejection of synthetic observations
 * 5. Summary metrics computation (Total, Last 365 Days, Distinct Sources, Distinct Categories)
 * 6. Observation display data preservation without exposing artisan personal data
 * 7. Confirmation that observation submission does NOT modify pricing_training.csv
 * 8. Confirmation that production model remains DATASET_NOT_READY when training dataset has zero empirical rows
 */

import fs from "fs";
import path from "path";
import {
  MarketIngestionService,
  IngestionResult,
} from "../src/services/pricing/marketIngestionService";
import {
  FileMarketObservationRepository,
} from "../src/services/pricing/marketObservationStore";
import { MarketPriceObservation } from "../src/types/pricing";
import {
  previewMarketCsv,
  importValidMarketObservations,
  parseRawCsvText,
} from "../src/services/pricing/marketCsvImporter";

console.log("==================================================");
console.log("KALA-KART STEP 4D: MARKET DATA ADMIN TEST SUITE");
console.log("==================================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    process.exitCode = 1;
  }
}

async function runStep4DTests() {
  const testStoragePath = path.join(process.cwd(), "data", "pricing", "test_admin_observations.json");
  if (fs.existsSync(testStoragePath)) {
    fs.unlinkSync(testStoragePath);
  }

  const testRepo = new FileMarketObservationRepository(testStoragePath);
  const ingestionService = new MarketIngestionService(testRepo);

  // Baseline check: pricing_training.csv
  const trainingCsvPath = path.join(process.cwd(), "data", "pricing", "pricing_training.csv");
  const initialCsvContent = fs.existsSync(trainingCsvPath) ? fs.readFileSync(trainingCsvPath, "utf-8") : "";

  // Baseline check: model metadata
  const metadataPath = path.join(process.cwd(), "data", "pricing", "model_metadata.json");
  const initialMetadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf-8")) : null;

  // -------------------------------------------------------------
  // Test 1: Valid observation submission via MarketIngestionService
  // -------------------------------------------------------------
  console.log("\n--- Test 1: Valid Observation Submission ---");
  const validCandidate: Partial<MarketPriceObservation> = {
    sourceType: "GOVERNMENT",
    source: "Export Promotion Council for Handicrafts",
    urlOrReference: "EPCH/BULLETIN/2026/MAR/BLUE-POTTERY-01",
    productCategory: "pottery",
    productType: "Blue Pottery Decorative Floral Vase 10in",
    material: "Blue Pottery Ceramic Quartz",
    craftTechnique: "Hand Glazed Firing",
    observedPriceINR: 1250,
    currency: "INR",
    observationDate: "2026-03-01",
    location: "Jaipur, Rajasthan",
    confidence: 0.95,
    isSynthetic: false,
  };

  const submitResult1: IngestionResult = await ingestionService.ingestObservation(validCandidate);

  assert(submitResult1.status === "ACCEPTED", "Valid observation is ACCEPTED by ingestion service");
  assert(!!submitResult1.observation?.id, "Accepted observation receives unique UUID", submitResult1.observation?.id);
  assert(submitResult1.observation?.observedPriceINR === 1250, "Observed price INR preserved exactly (1250)");
  assert(!!submitResult1.fingerprint && submitResult1.fingerprint.length === 64, "Deterministic SHA-256 fingerprint generated");
  assert(submitResult1.observation?.sourceType === "GOVERNMENT", "Source type preserved as GOVERNMENT");
  assert(await testRepo.count() === 1, "Repository count incremented to 1");

  // -------------------------------------------------------------
  // Test 2: Validation error display and exact error reporting
  // -------------------------------------------------------------
  console.log("\n--- Test 2: Validation Error Display ---");
  const invalidCandidateMissingPrice: Partial<MarketPriceObservation> = {
    sourceType: "ARTISAN_COOPERATIVE",
    source: "Kashmir Handloom Weavers Federation",
    urlOrReference: "KHWF-SURVEY-2026-04",
    productCategory: "textiles",
    productType: "Pashmina Shawl Handwoven",
    material: "Cashmere Wool",
    observationDate: "2026-02-15",
    isSynthetic: false,
    // missing observedPriceINR
  };

  const submitResult2: IngestionResult = await ingestionService.ingestObservation(invalidCandidateMissingPrice);
  assert(submitResult2.status === "REJECTED", "Missing price observation is REJECTED");
  assert(
    !!submitResult2.errors?.some((e) => e.toLowerCase().includes("price")),
    "Exact validation error returned for missing price",
    JSON.stringify(submitResult2.errors)
  );

  const invalidFutureDateCandidate: Partial<MarketPriceObservation> = {
    sourceType: "OFFICIAL_MARKETPLACE",
    source: "Tribes India Official Trifed Portal",
    urlOrReference: "TRIFED/2030/SURVEY/01",
    productCategory: "metalwork",
    productType: "Dhokra Brass Bell",
    material: "Brass",
    observedPriceINR: 900,
    observationDate: "2030-01-01", // future date
    isSynthetic: false,
  };

  const submitResultFuture: IngestionResult = await ingestionService.ingestObservation(invalidFutureDateCandidate);
  assert(submitResultFuture.status === "REJECTED", "Future observation date is REJECTED");
  assert(
    !!submitResultFuture.errors?.some((e) => e.toLowerCase().includes("future")),
    "Validation returns future date error",
    JSON.stringify(submitResultFuture.errors)
  );

  // -------------------------------------------------------------
  // Test 3: Duplicate observation handling
  // -------------------------------------------------------------
  console.log("\n--- Test 3: Duplicate Observation Handling ---");
  // Submitting candidate with identical key attributes to Test 1
  const duplicateCandidate: Partial<MarketPriceObservation> = {
    ...validCandidate,
  };

  const submitResultDuplicate: IngestionResult = await ingestionService.ingestObservation(duplicateCandidate);
  assert(submitResultDuplicate.status === "DUPLICATE", "Identical observation flagged as DUPLICATE");
  assert(
    submitResultDuplicate.fingerprint === submitResult1.fingerprint,
    "Duplicate fingerprint matches existing record"
  );
  assert(
    submitResultDuplicate.observation?.id === submitResult1.observation?.id,
    "Duplicate returns existing observation ID without creating new entry"
  );
  assert(await testRepo.count() === 1, "Repository count remains 1 (no duplicate record stored)");

  // -------------------------------------------------------------
  // Test 4: Rejection of synthetic observations
  // -------------------------------------------------------------
  console.log("\n--- Test 4: Rejection of Synthetic Observations ---");
  const syntheticCandidate: Partial<MarketPriceObservation> = {
    sourceType: "OTHER_VERIFIED",
    source: "Synthetic Test Generator",
    urlOrReference: "synthetic_demo_data.csv#44",
    productCategory: "woodcraft",
    productType: "Sandalwood Box",
    material: "Sandalwood",
    observedPriceINR: 800,
    observationDate: "2026-01-10",
    isSynthetic: true, // Marked synthetic
  };

  const submitResultSynthetic: IngestionResult = await ingestionService.ingestObservation(syntheticCandidate);
  assert(submitResultSynthetic.status === "REJECTED", "Synthetic observation is strictly REJECTED");
  assert(
    !!submitResultSynthetic.errors?.some((e) => e.toLowerCase().includes("synthetic")),
    "Synthetic error returned explicitly",
    JSON.stringify(submitResultSynthetic.errors)
  );

  // -------------------------------------------------------------
  // Test 5: Summary metrics calculation (No fabricated counts)
  // -------------------------------------------------------------
  console.log("\n--- Test 5: Summary Metrics Calculation ---");
  // Add a second legitimate observation from another cooperative
  const validCandidate2: Partial<MarketPriceObservation> = {
    sourceType: "ARTISAN_COOPERATIVE",
    source: "Dastkar Crafts Society",
    urlOrReference: "DASTKAR/NATURE-BAZAAR/2026/02",
    productCategory: "textiles",
    productType: "Kalamkari Hand Painted Cotton Saree",
    material: "Pure Cotton",
    craftTechnique: "Kalamkari Natural Dye",
    observedPriceINR: 3400,
    currency: "INR",
    observationDate: "2026-02-20",
    location: "New Delhi",
    confidence: 0.90,
    isSynthetic: false,
  };

  const submitResultSecond = await ingestionService.ingestObservation(validCandidate2);
  assert(submitResultSecond.status === "ACCEPTED", "Second valid observation is ACCEPTED");

  const storedObservations = await testRepo.getAll();
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const totalCount = storedObservations.length;
  const last365DaysCount = storedObservations.filter((obs) => {
    const d = new Date(obs.observationDate);
    return !isNaN(d.getTime()) && d >= oneYearAgo;
  }).length;
  const distinctSourcesCount = new Set(
    storedObservations.map((o) => (o.source || "").toLowerCase().trim()).filter(Boolean)
  ).size;
  const distinctCategoriesCount = new Set(
    storedObservations.map((o) => (o.productCategory || "").toLowerCase().trim()).filter(Boolean)
  ).size;

  assert(totalCount === 2, "Total verified observations count is 2 (real count)", `${totalCount}`);
  assert(last365DaysCount === 2, "Last 365 days count is 2 (real count)", `${last365DaysCount}`);
  assert(distinctSourcesCount === 2, "Distinct sources count is 2 (real count)", `${distinctSourcesCount}`);
  assert(distinctCategoriesCount === 2, "Distinct craft categories count is 2 (real count)", `${distinctCategoriesCount}`);

  // -------------------------------------------------------------
  // Test 6: Recent observations display fields & privacy
  // -------------------------------------------------------------
  console.log("\n--- Test 6: Recent Observations Fields & Privacy ---");
  for (const obs of storedObservations) {
    assert(!!obs.source, "Display record has valid Source");
    assert(!!obs.productType, "Display record has valid Product Type");
    assert(!!obs.material, "Display record has valid Material");
    assert(obs.observedPriceINR > 0, "Display record has positive INR Price");
    assert(!!obs.observationDate, "Display record has valid Date");
    assert(obs.confidence >= 0 && obs.confidence <= 1, "Display record has valid Confidence score");
    // Ensure no artisan personal private identity is exposed
    assert(!("artisanPhone" in obs) && !("artisanAadhaar" in obs) && !("artisanBankDetails" in obs),
      "Observation does not expose artisan personal confidential credentials");
  }

  // -------------------------------------------------------------
  // Test 7: Confirmation that submission does NOT modify pricing_training.csv
  // -------------------------------------------------------------
  console.log("\n--- Test 7: Integrity of pricing_training.csv ---");
  const postCsvContent = fs.existsSync(trainingCsvPath) ? fs.readFileSync(trainingCsvPath, "utf-8") : "";
  assert(
    initialCsvContent === postCsvContent,
    "pricing_training.csv was NOT modified by market data ingestion"
  );

  // -------------------------------------------------------------
  // Test 8: Confirmation that production model remains DATASET_NOT_READY
  // -------------------------------------------------------------
  console.log("\n--- Test 8: Production Model Status Check ---");
  const postMetadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf-8")) : null;
  assert(
    postMetadata?.status === "dataset_required",
    "Production model status remains 'dataset_required' (DATASET_NOT_READY)"
  );
  assert(
    (postMetadata?.trainingSampleCount || 0) === 0,
    "Production trainingSampleCount remains 0 empirical samples"
  );

  // -------------------------------------------------------------
  // Test 9: Valid CSV Parsing and Canonical Column Mapping
  // -------------------------------------------------------------
  console.log("\n--- Test 9: Valid CSV Parsing & Preview ---");
  const validCsvContent = `source_type,source_name,reference,category,product_type,material,craft_technique,observed_price_inr,observation_date,location,confidence
GOVERNMENT,Central Cottage Industries Emporium,CCIE/DELHI/2026/01,woodcraft,Carved Sheesham Wood Jewelry Box,Sheesham Wood,Hand Carving,1850,2026-02-10,"Janpath, New Delhi",0.90
ARTISAN_COOPERATIVE,Sahaj Crafts Cooperative,SAHAJ/GUJ/2026/55,textiles,Hand Embroidered Cotton Wall Hanging,Cotton,Applique Embroidery,2400,2026-02-12,"Dahod, Gujarat",0.88`;

  const previewResult1 = await previewMarketCsv(validCsvContent, testRepo);
  assert(previewResult1.success === true, "Valid CSV parsed and previewed successfully");
  if (previewResult1.success) {
    assert(previewResult1.review.totalFound === 2, "Preview found exactly 2 observations");
    assert(previewResult1.review.readyToImportCount === 2, "Both valid observations are ready to import");
    assert(previewResult1.review.validationErrorsCount === 0, "Zero validation errors in valid CSV");
    assert(previewResult1.review.duplicateCount === 0, "Zero duplicates in unique CSV");
    assert(previewResult1.review.validRows[0].observation.observedPriceINR === 1850, "Parsed price 1850 correctly");
    assert(previewResult1.review.validRows[1].observation.observedPriceINR === 2400, "Parsed price 2400 correctly");
    assert(previewResult1.review.validRows[0].observation.isSynthetic === false, "isSynthetic is strictly false for row 1");
    assert(previewResult1.review.validRows[1].observation.isSynthetic === false, "isSynthetic is strictly false for row 2");
  }

  // -------------------------------------------------------------
  // Test 10: Missing Required CSV Column
  // -------------------------------------------------------------
  console.log("\n--- Test 10: Missing Required Column in Header ---");
  const missingHeaderCsv = `source_type,source_name,reference,category,product_type,material,observation_date,location
GOVERNMENT,Tribes India,TRIFED/REF/01,metalwork,Dokra Figure,Bell Metal,2026-01-20,Bhopal`;
  // missing observed_price_inr

  const previewMissingCol = await previewMarketCsv(missingHeaderCsv, testRepo);
  assert(previewMissingCol.success === false, "CSV missing required column is rejected at header validation");
  if (!previewMissingCol.success && "error" in previewMissingCol) {
    assert(
      previewMissingCol.error.toLowerCase().includes("observed_price_inr"),
      "Error identifies missing observed_price_inr column",
      previewMissingCol.error
    );
  }

  // -------------------------------------------------------------
  // Test 11: Malformed CSV (Unclosed Quote & Row Inconsistency)
  // -------------------------------------------------------------
  console.log("\n--- Test 11: Malformed CSV Handling ---");
  const unclosedQuoteCsv = `source_type,source_name,reference,category,product_type,material,observed_price_inr,observation_date
GOVERNMENT,"Unclosed quote source,REF/01,pottery,Clay Mug,Terracotta,350,2026-01-10`;

  const previewMalformed = await previewMarketCsv(unclosedQuoteCsv, testRepo);
  assert(previewMalformed.success === false, "Unclosed quotation mark triggers graceful parse error");
  if (!previewMalformed.success && "error" in previewMalformed) {
    assert(
      previewMalformed.error.toLowerCase().includes("unclosed quotation"),
      "Error explicitly mentions unclosed quotation mark",
      previewMalformed.error
    );
  }

  // -------------------------------------------------------------
  // Test 12: CSV Row Schema Validation & Exact Errors
  // -------------------------------------------------------------
  console.log("\n--- Test 12: CSV Row Level Schema Validation ---");
  const mixedCsv = `source_type,source_name,reference,category,product_type,material,observed_price_inr,observation_date,confidence
GOVERNMENT,Dastkar Craft Fair,DAST/2026/01,jewelry,Silver Filigree Earrings,Silver,3200,2026-02-01,0.95
INVALID_SOURCE_TYPE,Dastkar Craft Fair,DAST/2026/02,jewelry,Silver Filigree Brooch,Silver,1500,2026-02-01,0.90
ARTISAN_COOPERATIVE,SEWA Bharat,SEWA/2026/09,textiles,Chanderi Silk Dupatta,Silk,-500,2026-02-01,0.85
ARTISAN_COOPERATIVE,SEWA Bharat,SEWA/2026/10,textiles,Chanderi Silk Saree,Silk,4500,2035-01-01,0.85`;
  // Row 2: Invalid source type
  // Row 3: Negative price (-500)
  // Row 4: Future date (2035-01-01)

  const previewMixed = await previewMarketCsv(mixedCsv, testRepo);
  assert(previewMixed.success === true, "Mixed CSV preview completes without throwing an unhandled exception");
  if (previewMixed.success) {
    assert(previewMixed.review.totalFound === 4, "Found 4 total observations in mixed CSV");
    assert(previewMixed.review.readyToImportCount === 1, "Only 1 valid observation ready to import");
    assert(previewMixed.review.validationErrorsCount === 3, "3 rows flagged with validation errors");
    assert(
      previewMixed.review.invalidRows.some((r) => r.rowNumber === 3 && r.errors.some((e) => e.includes("sourceType"))),
      "Row 3 rejected with sourceType validation error"
    );
    assert(
      previewMixed.review.invalidRows.some((r) => r.rowNumber === 4 && r.errors.some((e) => e.includes("strictly positive"))),
      "Row 4 rejected with negative price error"
    );
    assert(
      previewMixed.review.invalidRows.some((r) => r.rowNumber === 5 && r.errors.some((e) => e.includes("future"))),
      "Row 5 rejected with future date error"
    );
  }

  // -------------------------------------------------------------
  // Test 13: CSV Duplicate Handling (Intra-batch & Repository)
  // -------------------------------------------------------------
  console.log("\n--- Test 13: CSV Duplicate Handling ---");
  // The first row matches Test 1 which is already in testRepo!
  // The second row is a new unique item.
  // The third row is identical to the second row (intra-batch duplicate).
  const duplicateCsv = `source_type,source_name,reference,category,product_type,material,craft_technique,observed_price_inr,observation_date,location,confidence
GOVERNMENT,Export Promotion Council for Handicrafts,EPCH/BULLETIN/2026/MAR/BLUE-POTTERY-01,pottery,Blue Pottery Decorative Floral Vase 10in,Blue Pottery Ceramic Quartz,Hand Glazed Firing,1250,2026-03-01,"Jaipur, Rajasthan",0.95
CRAFT_COUNCIL,Crafts Council of India,CCI/CHN/2026/03,woodcraft,Kondapalli Wooden Toy,Softwood,Hand Painted,650,2026-02-20,Chennai,0.90
CRAFT_COUNCIL,Crafts Council of India,CCI/CHN/2026/03,woodcraft,Kondapalli Wooden Toy,Softwood,Hand Painted,650,2026-02-20,Chennai,0.90`;

  const previewDuplicates = await previewMarketCsv(duplicateCsv, testRepo);
  assert(previewDuplicates.success === true, "Duplicate CSV preview succeeds");
  if (previewDuplicates.success) {
    assert(previewDuplicates.review.totalFound === 3, "Found 3 observations in duplicate test CSV");
    assert(previewDuplicates.review.readyToImportCount === 1, "Exactly 1 observation is ready to import");
    assert(previewDuplicates.review.duplicateCount === 2, "Found 2 duplicate rows (1 repo duplicate, 1 in-batch duplicate)");
    assert(
      previewDuplicates.review.duplicateRows.some((d) => d.rowNumber === 2 && d.reason.includes("repository")),
      "Row 2 correctly flagged as existing in repository"
    );
    assert(
      previewDuplicates.review.duplicateRows.some((d) => d.rowNumber === 4 && d.reason.includes("Row 3")),
      "Row 4 correctly flagged as intra-batch duplicate of Row 3"
    );
  }

  // -------------------------------------------------------------
  // Test 14: CSV Synthetic Data Rejection
  // -------------------------------------------------------------
  console.log("\n--- Test 14: CSV Synthetic Data Strict Rejection ---");
  const syntheticCsv = `source_type,source_name,reference,category,product_type,material,observed_price_inr,observation_date
GOVERNMENT,Synthetic_Demo_Data,DEMO_REF_01,pottery,Pottery Vase,Clay,800,2026-01-10
ARTISAN_COOPERATIVE,Verified Weaver Coop,REF_WEAVER_10,textiles,Handloom Silk Saree,Silk,3500,2026-01-15`;

  const previewSynthetic = await previewMarketCsv(syntheticCsv, testRepo);
  assert(previewSynthetic.success === true, "Synthetic CSV preview runs without unhandled crash");
  if (previewSynthetic.success) {
    assert(previewSynthetic.review.validationErrorsCount === 1, "Synthetic row rejected by validation engine");
    assert(
      previewSynthetic.review.invalidRows.some((r) => r.errors.some((e) => e.toLowerCase().includes("synthetic"))),
      "Synthetic row rejected with explicit synthetic prohibition message"
    );
    assert(previewSynthetic.review.readyToImportCount === 1, "Non-synthetic empirical row is preserved as ready");
  }

  // -------------------------------------------------------------
  // Test 15: Batch Ingestion Execution & Verification
  // -------------------------------------------------------------
  console.log("\n--- Test 15: Batch Ingestion Execution ---");
  if (previewResult1.success) {
    const validObsList = previewResult1.review.validRows.map((r) => r.observation);
    const batchResult = await importValidMarketObservations(validObsList, ingestionService);
    assert(batchResult.acceptedCount === 2, "Batch ingestion accepted both 2 valid observations");
    assert(batchResult.duplicateCount === 0, "Zero duplicates in initial batch ingestion");
    assert(batchResult.rejectedCount === 0, "Zero rejections in valid batch ingestion");
    assert(await testRepo.count() === 4, "Repository total count now 4 (2 previous + 2 from CSV batch)");
  }

  // -------------------------------------------------------------
  // Test 16: Post-CSV Import File and Model Integrity Check
  // -------------------------------------------------------------
  console.log("\n--- Test 16: File and Model Integrity Post-CSV ---");
  const postCsvTraining = fs.existsSync(trainingCsvPath) ? fs.readFileSync(trainingCsvPath, "utf-8") : "";
  assert(
    initialCsvContent === postCsvTraining,
    "pricing_training.csv was NOT touched or populated by CSV import"
  );

  const postCsvMetadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf-8")) : null;
  assert(
    postCsvMetadata?.status === "dataset_required",
    "Model status remains strictly 'dataset_required' (DATASET_NOT_READY)"
  );
  assert(
    (postCsvMetadata?.trainingSampleCount || 0) === 0,
    "Model trainingSampleCount remains 0 empirical samples"
  );

  // Clean up isolated test file
  if (fs.existsSync(testStoragePath)) {
    fs.unlinkSync(testStoragePath);
  }

  console.log("\n==================================================");
  console.log(`STEP 4D TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log("==================================================");

  if (passedTests === totalTests) {
    console.log("ALL STEP 4D VERIFIED MARKET DATA ADMIN TESTS PASSED!");
  } else {
    console.error("SOME STEP 4D TESTS FAILED.");
    process.exitCode = 1;
  }
}

runStep4DTests().catch((err) => {
  console.error("Step 4D test run encountered an unhandled error:", err);
  process.exit(1);
});
