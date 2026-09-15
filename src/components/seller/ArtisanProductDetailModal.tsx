import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag } from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";

interface ArtisanProductDetailModalProps {
  product: CatalogItem | null;
  language: LanguageCode;
  onClose: () => void;
}

export const ArtisanProductDetailModal: React.FC<ArtisanProductDetailModalProps> = ({
  product,
  language,
  onClose,
}) => {
  if (!product) return null;

  const activePrice =
    product.pricing?.selectedTier === "base"
      ? product.pricing.baseCost
      : product.pricing?.selectedTier === "market"
      ? product.pricing.marketPrice
      : product.pricing?.exhibitionPrice || product.pricing?.marketPrice || 0;

  const title = language === "hi" ? product.titleHi : product.titleEn;
  const description = language === "hi" ? product.descriptionHi : product.descriptionEn;
  const imageSrc = product.studioImage || product.originalImage;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#1E1713] text-kk-ink dark:text-[#F6EFEA] rounded-3xl max-w-sm w-full p-5 border border-kk-line dark:border-[#382B24] shadow-2xl space-y-4 font-sans max-h-[85vh] flex flex-col"
        >
          {/* Header: Title + Status + Close (X) */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#332A24] pb-3 shrink-0">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-semibold text-stone-400 dark:text-[#9A8B80] uppercase tracking-wider block">
                {language === "hi" ? "उत्पाद विवरण" : "Product Details"}
              </span>
              <h3 className="text-sm font-bold text-kk-ink dark:text-[#F6EFEA] truncate">
                {product.category.toUpperCase()}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  product.status === "live"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    : product.status === "sold"
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                }`}
              >
                {product.status === "live"
                  ? "● Live"
                  : product.status === "sold"
                  ? "Sold"
                  : "Draft"}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-[#F6EFEA] hover:bg-stone-100 dark:hover:bg-[#332A24] transition-colors interactive-hover-nav"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto space-y-3.5 pr-0.5 -mr-0.5">
            {/* Photo & Main Info */}
            <div className="flex items-start gap-3">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={title}
                  className="w-16 h-16 rounded-xl object-cover border border-kk-line dark:border-[#382B24] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-[#2A201A] flex items-center justify-center border border-kk-line dark:border-[#382B24] shrink-0 text-stone-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-kk-ink dark:text-[#F6EFEA] line-clamp-2 leading-snug">
                  {title}
                </h4>
                <p className="text-sm font-extrabold text-kk-primary mt-1">
                  ₹{activePrice.toLocaleString("en-IN")}
                </p>
                {product.viewsCount !== undefined && (
                  <p className="text-[11px] text-stone-500 dark:text-[#9A8B80] mt-0.5">
                    {product.viewsCount} {language === "hi" ? "व्यूज" : "views"}
                  </p>
                )}
              </div>
            </div>

            {/* Specifications / Available Data */}
            <div className="p-3 bg-stone-50 dark:bg-[#2A201A] rounded-xl space-y-1.5 text-xs">
              {product.specs?.material && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "सामग्री:" : "Material:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.material}
                  </span>
                </div>
              )}
              {product.specs?.craftTechnique && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "शिल्प कला:" : "Craft Technique:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.craftTechnique}
                  </span>
                </div>
              )}
              {product.specs?.regionHeritage && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "मूल क्षेत्र:" : "Origin/Region:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.regionHeritage}
                  </span>
                </div>
              )}
              {product.specs?.dimensions && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "आकार:" : "Dimensions:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.dimensions}
                  </span>
                </div>
              )}
              {product.specs?.weight && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "वजन:" : "Weight:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.weight}
                  </span>
                </div>
              )}
              {product.specs?.color && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "रंग:" : "Color:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.color}
                  </span>
                </div>
              )}
              {product.specs?.quantity && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "उपलब्ध मात्रा:" : "Quantity:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.specs.quantity}
                  </span>
                </div>
              )}
              {product.marketplacePlatforms && product.marketplacePlatforms.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-[#9A8B80]">
                    {language === "hi" ? "चैनल्स:" : "Channels:"}
                  </span>
                  <span className="font-semibold text-kk-ink dark:text-[#F6EFEA]">
                    {product.marketplacePlatforms.join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Description if available */}
            {description && (
              <div className="p-3 bg-stone-50 dark:bg-[#2A201A] rounded-xl text-xs space-y-1">
                <span className="text-stone-500 dark:text-[#9A8B80] font-medium block">
                  {language === "hi" ? "विवरण" : "Description"}
                </span>
                <p className="text-stone-700 dark:text-[#D1C5BD] leading-relaxed text-[11.5px]">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-stone-100 dark:border-[#332A24] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-stone-100 dark:bg-[#332A24] text-stone-700 dark:text-[#E8DDD5] rounded-xl text-xs font-semibold hover:bg-stone-200 dark:hover:bg-[#40342D] transition-all interactive-hover-btn"
            >
              {language === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
