import React, { useState, useEffect, useRef } from "react";
import {
  MarketPriceObservation,
  MarketDataSourceType,
} from "../../types/pricing";
import type { CsvReviewResult } from "../../services/pricing/marketCsvImporter";
import {
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Tag,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  XCircle,
  AlertTriangle,
  FileUp,
} from "lucide-react";

const SOURCE_TYPES: readonly MarketDataSourceType[] = [
  "GOVERNMENT",
  "ARTISAN_COOPERATIVE",
  "CRAFT_COUNCIL",
  "OFFICIAL_MARKETPLACE",
  "VERIFIED_FAIR_OR_EXHIBITION",
  "OTHER_VERIFIED",
];

const CRAFT_CATEGORIES = [
  "pottery",
  "textiles",
  "metalwork",
  "woodcraft",
  "jewelry",
  "painting",
  "other",
];

interface MarketSummary {
  totalCount: number;
  last365DaysCount: number;
  distinctSourcesCount: number;
  distinctCategoriesCount: number;
}

interface IngestionResponseResult {
  status: "ACCEPTED" | "DUPLICATE" | "REJECTED";
  fingerprint?: string;
  observation?: MarketPriceObservation;
  errors?: string[];
  message: string;
}

interface MarketDataAdminScreenProps {
  onBack: () => void;
}

export const MarketDataAdminScreen: React.FC<MarketDataAdminScreenProps> = ({
  onBack,
}) => {
  // Form input state (zero fake pre-populated values, no default price)
  const [sourceType, setSourceType] = useState<MarketDataSourceType>("GOVERNMENT");
  const [sourceName, setSourceName] = useState<string>("");
  const [urlOrReference, setUrlOrReference] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string>("pottery");
  const [productType, setProductType] = useState<string>("");
  const [material, setMaterial] = useState<string>("");
  const [craftTechnique, setCraftTechnique] = useState<string>("");
  const [observedPrice, setObservedPrice] = useState<string>(""); // empty string, strictly no default price
  const [observationDate, setObservationDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [confidence, setConfidence] = useState<string>("0.85");

  // Submission & UI feedback state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionOutcome, setSubmissionOutcome] = useState<IngestionResponseResult | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Stored observations & live summary state
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [observations, setObservations] = useState<MarketPriceObservation[]>([]);
  const [summary, setSummary] = useState<MarketSummary>({
    totalCount: 0,
    last365DaysCount: 0,
    distinctSourcesCount: 0,
    distinctCategoriesCount: 0,
  });

  // Copied indicator
  const [copiedFingerprint, setCopiedFingerprint] = useState<string | null>(null);

  // Tab switcher state
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isReviewingCsv, setIsReviewingCsv] = useState<boolean>(false);
  const [csvReviewResult, setCsvReviewResult] = useState<CsvReviewResult | null>(null);
  const [csvParseError, setCsvParseError] = useState<string | null>(null);
  const [isImportingBatch, setIsImportingBatch] = useState<boolean>(false);
  const [batchImportOutcome, setBatchImportOutcome] = useState<{
    acceptedCount: number;
    duplicateCount: number;
    rejectedCount: number;
    totalProcessed: number;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV file processing & preview handler
  const processCsvFile = async (file: File) => {
    setCsvFile(file);
    setCsvReviewResult(null);
    setCsvParseError(null);
    setBatchImportOutcome(null);
    setIsReviewingCsv(true);

    try {
      const csvText = await file.text();
      const res = await fetch("/api/pricing/market-observations/preview-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setCsvReviewResult(data.review);
      } else {
        setCsvParseError(data.error || "Failed to parse and preview CSV file.");
      }
    } catch (err: any) {
      setCsvParseError(err.message || "Failed to communicate with CSV preview service.");
    } finally {
      setIsReviewingCsv(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processCsvFile(file);
  };

  const handleImportValidRows = async () => {
    if (!csvReviewResult || csvReviewResult.validRows.length === 0) return;

    setIsImportingBatch(true);
    setBatchImportOutcome(null);

    try {
      const observations = csvReviewResult.validRows.map((r) => r.observation);
      const res = await fetch("/api/pricing/market-observations/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observations }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const resData = data.result;
        setBatchImportOutcome({
          acceptedCount: resData.acceptedCount,
          duplicateCount: resData.duplicateCount,
          rejectedCount: resData.rejectedCount,
          totalProcessed: resData.totalProcessed,
          message: `Successfully imported ${resData.acceptedCount} verified observation(s). ${resData.duplicateCount} duplicate(s) skipped. ${resData.rejectedCount} rejected.`,
        });
        // Clear valid rows from preview after successful import, keeping summary visible
        setCsvReviewResult((prev) =>
          prev
            ? {
                ...prev,
                readyToImportCount: 0,
                validRows: [],
              }
            : null
        );
        // Refresh live market metrics and recent observations
        await fetchMarketData();
      } else {
        setCsvParseError(data.error || "Failed to import valid rows.");
      }
    } catch (err: any) {
      setCsvParseError(err.message || "Batch import request failed.");
    } finally {
      setIsImportingBatch(false);
    }
  };

  const handleClearCsv = () => {
    setCsvFile(null);
    setCsvReviewResult(null);
    setCsvParseError(null);
    setBatchImportOutcome(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fetch verified observations and real counts
  const fetchMarketData = async () => {
    setIsLoadingList(true);
    setNetworkError(null);
    try {
      const res = await fetch("/api/pricing/market-observations");
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setObservations(data.observations || []);
        setSummary(
          data.summary || {
            totalCount: 0,
            last365DaysCount: 0,
            distinctSourcesCount: 0,
            distinctCategoriesCount: 0,
          }
        );
      } else {
        setNetworkError(data.error || "Failed to load market data.");
      }
    } catch (err: any) {
      console.error("Failed to fetch market observations:", err);
      setNetworkError(err.message || "Failed to communicate with market data API.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionOutcome(null);
    setNetworkError(null);

    // Build raw candidate payload for the ingestion service
    const priceNum = observedPrice === "" ? NaN : parseFloat(observedPrice);
    const confidenceNum = confidence === "" ? NaN : parseFloat(confidence);

    const payload: Partial<MarketPriceObservation> = {
      sourceType,
      source: sourceName.trim(),
      urlOrReference: urlOrReference.trim(),
      productCategory: productCategory.trim(),
      productType: productType.trim(),
      material: material.trim(),
      craftTechnique: craftTechnique.trim() || undefined,
      observedPriceINR: priceNum,
      currency: "INR",
      observationDate: observationDate.trim(),
      location: location.trim() || undefined,
      confidence: confidenceNum,
      isSynthetic: false, // Strict mandate: Never synthetic
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pricing/market-observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.result) {
        const result: IngestionResponseResult = data.result;
        setSubmissionOutcome(result);

        // If accepted, clear dynamic entry fields and reload repository list
        if (result.status === "ACCEPTED") {
          setObservedPrice("");
          setUrlOrReference("");
          setProductType("");
          setMaterial("");
          setCraftTechnique("");
          setLocation("");
          fetchMarketData();
        }
      } else {
        setSubmissionOutcome({
          status: "REJECTED",
          errors: [data.error || "Server failed to process observation request."],
          message: "Ingestion request failed on server.",
        });
      }
    } catch (err: any) {
      console.error("Error submitting market observation:", err);
      setNetworkError(err.message || "Network request failed. Is the server running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyFingerprint = (fp: string) => {
    navigator.clipboard?.writeText(fp);
    setCopiedFingerprint(fp);
    setTimeout(() => setCopiedFingerprint(null), 2000);
  };

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 p-3 sm:p-6 pb-20 sm:pb-16 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Return to Artisan App"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-kk-primary shrink-0" />
                  <span>Verified Market Data</span>
                </h1>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0">
                  Admin / Dev
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Add source-backed artisan market observations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchMarketData}
            disabled={isLoadingList}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Security & Isolation Notice Banner */}
        <div className="p-3.5 bg-amber-950/30 border border-amber-600/30 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 min-w-0">
            <p className="font-bold text-amber-300 break-words">
              Developer / Admin Environment Isolation
            </p>
            <p className="text-amber-200/80 leading-relaxed break-words">
              This screen allows team members to enter verified, empirical market observations. Normal artisan users do not have access to this screen in their standard workflow. Production enterprise deployments must enforce strict role-based access control (RBAC) and OAuth authorization.
            </p>
          </div>
        </div>

        {/* Navigation Tabs: Manual Entry vs. Import CSV */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === "manual"
                  ? "bg-kk-primary text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Manual Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === "csv"
                  ? "bg-kk-primary text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span>Import CSV</span>
              {csvReviewResult && csvReviewResult.readyToImportCount > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full">
                  {csvReviewResult.readyToImportCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">Live Repository: {summary.totalCount} observations</span>
          </div>
        </div>

        {/* Manual Observation Form Container */}
        {activeTab === "manual" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-kk-primary" />
                  New Empirical Observation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every entry undergoes strict schema validation, deterministic normalization, and deduplication. Synthetic records are strictly rejected.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("csv")}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-colors"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Bulk CSV Import</span>
              </button>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Source Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Source Type <span className="text-kk-primary">*</span>
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as MarketDataSourceType)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none"
                  required
                >
                  {SOURCE_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Source Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Source Name <span className="text-kk-primary">*</span>
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. Export Promotion Council for Handicrafts"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                  required
                />
              </div>

              {/* 3. Reference / Citation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Reference / Citation <span className="text-kk-primary">*</span>
                </label>
                <input
                  type="text"
                  value={urlOrReference}
                  onChange={(e) => setUrlOrReference(e.target.value)}
                  placeholder="e.g. EPCH/TRADE/2026/03/POTTERY/08"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                  required
                />
              </div>

              {/* 4. Product Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Product Category <span className="text-kk-primary">*</span>
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none"
                  required
                >
                  {CRAFT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Product Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Product Type <span className="text-kk-primary">*</span>
                </label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="e.g. Blue Pottery Floral Vase"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                  required
                />
              </div>

              {/* 6. Material */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Material <span className="text-kk-primary">*</span>
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Blue Pottery, Chanderi Silk, Brass"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                  required
                />
              </div>

              {/* 7. Craft Technique */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Craft Technique
                </label>
                <input
                  type="text"
                  value={craftTechnique}
                  onChange={(e) => setCraftTechnique(e.target.value)}
                  placeholder="e.g. Hand Glazed, Handloom, Lost Wax"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                />
              </div>

              {/* 8. Observed Price (INR) - Strictly no default */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Observed Price (₹) <span className="text-kk-primary">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={observedPrice}
                    onChange={(e) => setObservedPrice(e.target.value)}
                    placeholder="Enter empirical price in INR"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* 9. Observation Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Observation Date <span className="text-kk-primary">*</span>
                </label>
                <input
                  type="date"
                  value={observationDate}
                  onChange={(e) => setObservationDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* 10. Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none placeholder:text-slate-600"
                />
              </div>

              {/* 11. Confidence (0.0 to 1.0) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Confidence (0.0 – 1.0)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-kk-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Observations are stored in the empirical repository. Models are never retrained automatically.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-kk-primary hover:bg-kk-primary-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-kk-primary-dark/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating & Ingesting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Verified Observation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Network / Transport Error */}
          {networkError && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{networkError}</span>
            </div>
          )}

          {/* Submission Outcome: 4. SUCCESS STATE */}
          {submissionOutcome && submissionOutcome.status === "ACCEPTED" && (
            <div className="mt-5 p-4 bg-emerald-950/40 border border-emerald-600/50 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Verified market observation added</span>
              </div>

              {submissionOutcome.observation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-emerald-900/40">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Observation ID</span>
                    <span className="font-mono text-emerald-300 font-semibold">{submissionOutcome.observation.id || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Source</span>
                    <span className="text-white font-medium">{submissionOutcome.observation.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Product Type</span>
                    <span className="text-white font-medium">{submissionOutcome.observation.productType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Observed Price</span>
                    <span className="text-emerald-400 font-bold">₹{submissionOutcome.observation.observedPriceINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Observation Date</span>
                    <span className="text-white font-mono">{submissionOutcome.observation.observationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Fingerprint</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 truncate">
                      <span className="truncate">{submissionOutcome.fingerprint}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyFingerprint(submissionOutcome.fingerprint || "")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
                        title="Copy fingerprint"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submission Outcome: 5. DUPLICATE STATE */}
          {submissionOutcome && submissionOutcome.status === "DUPLICATE" && (
            <div className="mt-5 p-4 bg-amber-950/40 border border-amber-600/50 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>Duplicate observation</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                An observation with an identical cryptographic fingerprint already exists in the repository. No duplicate record was created.
              </p>

              {submissionOutcome.observation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-amber-900/40">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Existing Observation ID</span>
                    <span className="font-mono text-amber-300 font-semibold">{submissionOutcome.observation.id || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Source</span>
                    <span className="text-white font-medium">{submissionOutcome.observation.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Product Type</span>
                    <span className="text-white font-medium">{submissionOutcome.observation.productType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Observed Price</span>
                    <span className="text-amber-400 font-bold">₹{submissionOutcome.observation.observedPriceINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Observation Date</span>
                    <span className="text-white font-mono">{submissionOutcome.observation.observationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Fingerprint</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 truncate">
                      <span className="truncate">{submissionOutcome.fingerprint}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyFingerprint(submissionOutcome.fingerprint || "")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
                        title="Copy fingerprint"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submission Outcome: REJECTION / VALIDATION ERRORS */}
          {submissionOutcome && submissionOutcome.status === "REJECTED" && (
            <div className="mt-5 p-4 bg-red-950/40 border border-red-600/50 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>Observation Rejected by Validation Engine</span>
              </div>
              <ul 
                className="space-y-1 text-xs text-red-200 list-disc list-inside max-h-48 overflow-y-auto overscroll-contain pr-1"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {submissionOutcome.errors && submissionOutcome.errors.length > 0 ? (
                  submissionOutcome.errors.map((err, idx) => (
                    <li key={idx} className="break-words">{err}</li>
                  ))
                ) : (
                  <li className="break-words">{submissionOutcome.message}</li>
                )}
              </ul>
            </div>
          )}
        </div>
        )}

        {/* CSV Batch Importer Container */}
        {activeTab === "csv" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 animate-in fade-in">
            {/* CSV Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-kk-primary" />
                  Import Verified Market Observations (CSV)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload empirical market observations in bulk. File is strictly parsed, validated, and deduplicated before committing to repository.
                </p>
              </div>

              {csvFile && (
                <button
                  type="button"
                  onClick={handleClearCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Clear / Choose Different File</span>
                </button>
              )}
            </div>

            {/* Canonical Schema Columns Specification Banner */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <FileText className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Canonical CSV Header Specification</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {["source_type", "source_name", "reference", "category", "product_type", "material", "observed_price_inr", "observation_date"].map((col) => (
                  <span key={col} className="px-2 py-0.5 bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/30 rounded-md font-semibold">
                    {col} *
                  </span>
                ))}
                {["craft_technique", "location", "confidence"].map((col) => (
                  <span key={col} className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                    {col} (optional)
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                * Required columns. Observations must identify their empirical source with verifiable reference URL/citation. Synthetic demo data is strictly rejected.
              </p>
            </div>

            {/* File Picker / Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-upload"
            />

            {!csvReviewResult && !isReviewingCsv && !csvParseError && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.type.includes("csv"))) {
                    await processCsvFile(droppedFile);
                  } else {
                    setCsvParseError("Please select a valid .csv file.");
                  }
                }}
                className="border-2 border-dashed border-slate-700 hover:border-[#EA580C]/60 hover:bg-slate-800/30 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-3"
              >
                <div className="p-4 bg-slate-800/80 rounded-2xl text-slate-400 group-hover:text-[#EA580C] group-hover:scale-105 transition-all">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200 group-hover:text-white">
                    Select a verified market observations CSV file
                  </p>
                  <p className="text-xs text-slate-400">
                    Drag and drop or browse local storage (.csv)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-2 px-4 py-2 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Browse File</span>
                </button>
              </div>
            )}

            {/* Reviewing Spinner State */}
            {isReviewingCsv && (
              <div className="p-10 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <RefreshCw className="w-8 h-8 text-[#EA580C] animate-spin mx-auto" />
                <p className="text-sm font-bold text-white">
                  Parsing and validating CSV against market observation schema...
                </p>
                <p className="text-xs text-slate-400">
                  Computing SHA-256 fingerprints and checking empirical source compliance.
                </p>
              </div>
            )}

            {/* Parse / Structural Error Display */}
            {csvParseError && (
              <div className="p-4 bg-red-950/40 border border-red-600/50 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>CSV Parsing / Ingestion Error</span>
                </div>
                <p className="text-xs text-red-200 leading-relaxed font-mono">
                  {csvParseError}
                </p>
                <button
                  type="button"
                  onClick={handleClearCsv}
                  className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  Select Another CSV File
                </button>
              </div>
            )}

            {/* Batch Import Outcome Banner */}
            {batchImportOutcome && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Batch Ingestion Completed</span>
                </div>
                <p className="text-xs text-emerald-200">
                  {batchImportOutcome.message}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
                    {batchImportOutcome.acceptedCount} Ingested
                  </span>
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                    {batchImportOutcome.duplicateCount} Duplicates Skipped
                  </span>
                  {batchImportOutcome.rejectedCount > 0 && (
                    <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold">
                      {batchImportOutcome.rejectedCount} Rejected
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CSV Review Summary Dashboard */}
            {csvReviewResult && (
              <div className="space-y-6 animate-in fade-in">
                {/* Active File Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FileSpreadsheet className="w-4 h-4 text-[#EA580C]" />
                    <span className="font-bold text-white">{csvFile?.name || "Uploaded File"}</span>
                    {csvFile && <span className="text-slate-500">({(csvFile.size / 1024).toFixed(1)} KB)</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCsv}
                    className="text-xs text-slate-400 hover:text-white underline text-left sm:text-right"
                  >
                    Change File
                  </button>
                </div>

                {/* 4 Review Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3 sm:p-3.5 bg-slate-950 border border-slate-800 rounded-xl min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                      Total Found
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                      {csvReviewResult.totalFound}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                      observations found
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 uppercase tracking-wider truncate">
                      Ready to Import
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-0.5">
                      {csvReviewResult.readyToImportCount}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-emerald-300/80 mt-0.5 truncate">
                      ready to import
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-rose-400 uppercase tracking-wider truncate">
                      Validation Errors
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-400 mt-0.5">
                      {csvReviewResult.validationErrorsCount}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-rose-300/80 mt-0.5 truncate">
                      validation errors
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-amber-400 uppercase tracking-wider truncate">
                      Duplicates
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-amber-400 mt-0.5">
                      {csvReviewResult.duplicateCount}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-amber-300/80 mt-0.5 truncate">
                      duplicate{csvReviewResult.duplicateCount === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>

                {/* Invalid Rows Section */}
                {csvReviewResult.validationErrorsCount > 0 && (
                  <div className="space-y-3 p-3.5 sm:p-4 bg-red-950/20 border border-red-900/40 rounded-xl">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Invalid Rows ({csvReviewResult.validationErrorsCount}) — Strict Validation Rejections</span>
                    </div>
                    <p className="text-xs text-red-200/80">
                      The following rows violated market observation schema rules and cannot be imported:
                    </p>
                    <div 
                      className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain pr-1 rounded-lg"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {csvReviewResult.invalidRows.map((inv) => (
                        <div
                          key={inv.rowNumber}
                          className="p-3 bg-slate-950/80 border border-red-900/50 rounded-lg text-xs space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 text-slate-300 font-bold">
                            <span className="text-red-400 font-mono shrink-0">Row {inv.rowNumber}</span>
                            <span className="text-slate-400 text-[11px] truncate max-w-full">
                              {inv.raw.productType || "Unknown Product"} ({inv.raw.source || "No Source"})
                            </span>
                          </div>
                          <ul className="space-y-0.5 text-[11px] text-red-300 list-disc list-inside break-words">
                            {inv.errors.map((err, eIdx) => (
                              <li key={eIdx} className="break-words">{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duplicate Rows Section */}
                {csvReviewResult.duplicateCount > 0 && (
                  <div className="space-y-3 p-3.5 sm:p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Duplicate Observations ({csvReviewResult.duplicateCount}) — Identified by Cryptographic Fingerprint</span>
                    </div>
                    <p className="text-xs text-amber-200/80">
                      The following rows match existing observations and will be skipped to preserve dataset uniqueness:
                    </p>
                    <div 
                      className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain pr-1 rounded-lg"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {csvReviewResult.duplicateRows.map((dup) => (
                        <div
                          key={dup.rowNumber}
                          className="p-3 bg-slate-950/80 border border-amber-900/50 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 text-slate-300 font-bold">
                            <span className="text-amber-400 font-mono shrink-0">Row {dup.rowNumber}</span>
                            <span className="text-slate-300 text-[11px] truncate max-w-full">
                              {dup.productType} • ₹{dup.observedPriceINR.toFixed(2)} ({dup.source})
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-300/80 break-words">
                            {dup.reason}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            Fingerprint: {dup.fingerprint}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Import Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    {csvReviewResult.readyToImportCount > 0 ? (
                      <span>
                        <strong className="text-emerald-400">{csvReviewResult.readyToImportCount}</strong> valid observation{csvReviewResult.readyToImportCount === 1 ? "" : "s"} eligible for empirical ingestion.
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Zero valid, non-duplicate rows available for import.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleImportValidRows}
                    disabled={csvReviewResult.readyToImportCount === 0 || isImportingBatch}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                      csvReviewResult.readyToImportCount > 0 && !isImportingBatch
                        ? "bg-kk-primary hover:bg-kk-primary-dark text-white cursor-pointer active:scale-95"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    {isImportingBatch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Importing Observations...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Import Valid Observations ({csvReviewResult.readyToImportCount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. MARKET DATA SUMMARY */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Market Data Summary
            </h2>
            <span className="text-[11px] text-slate-500">
              Computed directly from empirical repository (No fabricated statistics)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-2xl min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-medium block leading-tight truncate">
                Total Verified Observations
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {summary.totalCount}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-2xl min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-medium block leading-tight truncate">
                Observations in Last 365 Days
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {summary.last365DaysCount}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-2xl min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-medium block leading-tight truncate">
                Distinct Verified Sources
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {summary.distinctSourcesCount}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 bg-slate-900 border border-slate-800 rounded-2xl min-w-0">
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-medium block leading-tight truncate">
                Distinct Craft Categories
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {summary.distinctCategoriesCount}
              </span>
            </div>
          </div>
        </div>

        {/* 7. RECENT OBSERVATIONS TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 max-w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-kk-primary shrink-0" />
                <span>Recent Verified Observations ({observations.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Empirical price benchmarks recorded across official surveys and cooperatives. No artisan personal data is exposed.
              </p>
            </div>
          </div>

          {observations.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/80">
              <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                No verified market observations recorded yet
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Use the form above to add empirical market price records from government bodies, artisan cooperatives, or verified craft exhibitions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0 px-1 sm:px-0">
              <table className="w-full min-w-[620px] text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {observations.map((obs, idx) => (
                    <tr key={obs.id || obs.fingerprint || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-[180px]" title={obs.source}>
                          {obs.source}
                        </div>
                        {obs.sourceType && (
                          <span className="text-[10px] text-amber-400 font-mono block">
                            {obs.sourceType}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200 truncate max-w-[160px]" title={obs.productType}>
                          {obs.productType}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {obs.productCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                        {obs.material}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        ₹{obs.observedPriceINR.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {obs.observationDate}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {obs.location || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {Math.round((obs.confidence || 0.85) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 10. MODEL TRAINING STATUS CARD */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-kk-primary shrink-0" />
            <div>
              <p className="font-bold text-slate-300">Production ML Model Status: DATASET_NOT_READY</p>
              <p className="text-[11px] text-slate-500">
                Adding verified observations does NOT automatically retrain the Random Forest regressor. Training is an explicit batch operation performed only after audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
