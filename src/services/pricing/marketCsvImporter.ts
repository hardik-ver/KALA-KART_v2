/**
 * Kala-Kart Verified Market Data CSV Importer & Validator
 *
 * Implements Step 4D CSV Batch Import:
 * - Parses RFC 4180 compliant CSV files with quoted fields and newlines
 * - Enforces canonical schema columns without inventing or guessing missing data
 * - Pipes every row through the existing validateMarketObservation schema engine
 * - Checks cryptographic SHA-256 deduplication fingerprints against repository & batch
 * - Strictly rejects synthetic records and unverified citations
 * - Never writes directly to files; interfaces only through existing ingestion/repository abstractions
 */

import { MarketPriceObservation, MarketDataSourceType } from "../../types/pricing";
import {
  validateMarketObservation,
  normalizeMarketObservation,
  generateObservationFingerprint,
} from "./marketObservationSchema";
import { IMarketObservationRepository } from "./marketObservationStore";
import { MarketIngestionService, BatchIngestionResult } from "./marketIngestionService";

export const CANONICAL_CSV_COLUMNS = [
  "source_type",
  "source_name",
  "reference",
  "category",
  "product_type",
  "material",
  "craft_technique",
  "observed_price_inr",
  "observation_date",
  "location",
  "confidence",
] as const;

export const REQUIRED_CSV_COLUMNS = [
  "source_type",
  "source_name",
  "reference",
  "category",
  "product_type",
  "material",
  "observed_price_inr",
  "observation_date",
] as const;

export interface CsvValidRow {
  rowNumber: number;
  fingerprint: string;
  observation: MarketPriceObservation;
}

export interface CsvInvalidRow {
  rowNumber: number;
  errors: string[];
  raw: Partial<MarketPriceObservation>;
}

export interface CsvDuplicateRow {
  rowNumber: number;
  fingerprint: string;
  source: string;
  productType: string;
  observedPriceINR: number;
  observationDate: string;
  reason: string;
  raw: Partial<MarketPriceObservation>;
}

export interface CsvReviewResult {
  totalFound: number;
  readyToImportCount: number;
  validationErrorsCount: number;
  duplicateCount: number;
  validRows: CsvValidRow[];
  invalidRows: CsvInvalidRow[];
  duplicateRows: CsvDuplicateRow[];
}

export interface CsvParseErrorResult {
  error: string;
  details?: string;
}

/**
 * Parses raw CSV string into an array of string arrays.
 * Handles commas inside quoted fields and escaped double-quotes.
 */
export function parseRawCsvText(csvText: string): { rows: string[][]; error?: string } {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i += 2;
        continue;
      }
      insideQuotes = !insideQuotes;
      i++;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
      i++;
      continue;
    }

    if ((char === "\r" || char === "\n") && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
      if (char === "\r" && nextChar === "\n") {
        i += 2;
      } else {
        i++;
      }
      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentField += char;
    i++;
  }

  if (insideQuotes) {
    return { rows: [], error: "Malformed CSV: Unclosed quotation mark detected." };
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return { rows };
}

/**
 * Validates CSV structure, headers, maps rows to MarketPriceObservation candidates,
 * and performs strict schema validation and deduplication preview without writing to disk.
 */
export async function previewMarketCsv(
  csvText: string,
  repository: IMarketObservationRepository
): Promise<{ success: true; review: CsvReviewResult } | { success: false; error: string }> {
  if (!csvText || csvText.trim().length === 0) {
    return { success: false, error: "Empty CSV file: File contains no data or headers." };
  }

  const { rows, error: parseError } = parseRawCsvText(csvText);
  if (parseError) {
    return { success: false, error: parseError };
  }

  if (rows.length === 0) {
    return { success: false, error: "Empty CSV file: No valid rows found." };
  }

  // Header Validation
  const headerRow = rows[0].map((h) => h.trim().toLowerCase());
  const missingRequired = REQUIRED_CSV_COLUMNS.filter((col) => !headerRow.includes(col));
  if (missingRequired.length > 0) {
    return {
      success: false,
      error: `Missing required CSV column(s): ${missingRequired.join(", ")}. Required columns are: ${REQUIRED_CSV_COLUMNS.join(", ")}.`,
    };
  }

  const colIndexMap: Record<string, number> = {};
  headerRow.forEach((col, idx) => {
    colIndexMap[col] = idx;
  });

  const getVal = (row: string[], colName: string): string => {
    const idx = colIndexMap[colName];
    if (idx === undefined || idx >= row.length) return "";
    return row[idx].trim();
  };

  const dataRows = rows.slice(1);
  if (dataRows.length === 0) {
    return { success: false, error: "CSV header is present, but file contains zero observation data rows." };
  }

  const validRows: CsvValidRow[] = [];
  const invalidRows: CsvInvalidRow[] = [];
  const duplicateRows: CsvDuplicateRow[] = [];
  const seenFingerprintsInBatch = new Map<string, number>();

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNumber = i + 2; // Row 1 is header

    // Check for row column count anomalies
    if (row.length > headerRow.length) {
      invalidRows.push({
        rowNumber,
        errors: [
          `Malformed row: Contains ${row.length} columns but header has ${headerRow.length} columns (possible unescaped comma).`,
        ],
        raw: {
          productType: row[0] || "Unknown",
        },
      });
      continue;
    }

    const rawPriceStr = getVal(row, "observed_price_inr");
    let observedPriceINR: number;
    if (rawPriceStr === "") {
      observedPriceINR = NaN;
    } else {
      observedPriceINR = Number(rawPriceStr);
    }

    const rawConfidenceStr = getVal(row, "confidence");
    let confidence: number | undefined = undefined;
    if (rawConfidenceStr !== "") {
      confidence = Number(rawConfidenceStr);
    }

    const rawCraftTechnique = getVal(row, "craft_technique");
    const rawLocation = getVal(row, "location");

    // Check synthetic flags if present in columns
    const rawIsSynthetic = getVal(row, "is_synthetic") || getVal(row, "issynthetic");
    const isSyntheticBool = rawIsSynthetic.toLowerCase() === "true";

    const candidate: Partial<MarketPriceObservation> = {
      sourceType: (getVal(row, "source_type") || undefined) as MarketDataSourceType,
      source: getVal(row, "source_name"),
      urlOrReference: getVal(row, "reference"),
      productCategory: getVal(row, "category"),
      productType: getVal(row, "product_type"),
      material: getVal(row, "material"),
      craftTechnique: rawCraftTechnique || undefined,
      observedPriceINR,
      currency: "INR",
      observationDate: getVal(row, "observation_date"),
      location: rawLocation || undefined,
      confidence,
      isSynthetic: isSyntheticBool, // If marked synthetic in CSV, pass through so validation rejects it
    };

    // 1. Strict Schema Validation
    const validation = validateMarketObservation(candidate);
    if (!validation.isValid) {
      invalidRows.push({
        rowNumber,
        errors: validation.errors,
        raw: candidate,
      });
      continue;
    }

    // 2. Normalization & Fingerprint Generation
    const normalized = normalizeMarketObservation(candidate as MarketPriceObservation);
    const fingerprint = normalized.fingerprint || generateObservationFingerprint(normalized);

    // 3. Deduplication Check against Repository
    const existingInRepo = await repository.getByFingerprint(fingerprint);
    if (existingInRepo) {
      duplicateRows.push({
        rowNumber,
        fingerprint,
        source: normalized.source,
        productType: normalized.productType,
        observedPriceINR: normalized.observedPriceINR,
        observationDate: normalized.observationDate,
        reason: `Already exists in repository (Obs ID: ${existingInRepo.id || "existing"}, Source: ${existingInRepo.source})`,
        raw: normalized,
      });
      continue;
    }

    // 4. Deduplication Check against previous rows in this CSV
    const prevRowNumber = seenFingerprintsInBatch.get(fingerprint);
    if (prevRowNumber !== undefined) {
      duplicateRows.push({
        rowNumber,
        fingerprint,
        source: normalized.source,
        productType: normalized.productType,
        observedPriceINR: normalized.observedPriceINR,
        observationDate: normalized.observationDate,
        reason: `Duplicate of Row ${prevRowNumber} in this CSV file`,
        raw: normalized,
      });
      continue;
    }

    // Record as unique & valid for import
    seenFingerprintsInBatch.set(fingerprint, rowNumber);
    validRows.push({
      rowNumber,
      fingerprint,
      observation: normalized,
    });
  }

  return {
    success: true,
    review: {
      totalFound: dataRows.length,
      readyToImportCount: validRows.length,
      validationErrorsCount: invalidRows.length,
      duplicateCount: duplicateRows.length,
      validRows,
      invalidRows,
      duplicateRows,
    },
  };
}

/**
 * Imports reviewed valid observations through the existing MarketIngestionService pipeline.
 */
export async function importValidMarketObservations(
  validObservations: MarketPriceObservation[],
  ingestionService: MarketIngestionService
): Promise<BatchIngestionResult> {
  return await ingestionService.ingestBatch(validObservations);
}
