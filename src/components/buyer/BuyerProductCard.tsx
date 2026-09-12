import React from "react";
import { Heart, Sparkles } from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";

interface BuyerProductCardProps {
  item: CatalogItem;
  language: LanguageCode;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, itemId: string) => void;
  onClick: (item: CatalogItem) => void;
  onQuickAddToCart?: (e: React.MouseEvent, item: CatalogItem) => void;
}

export const BuyerProductCard: React.FC<BuyerProductCardProps> = ({
  item,
  language,
  isWishlisted,
  onToggleWishlist,
  onClick,
}) => {
  const title = language === "hi" ? item.titleHi : item.titleEn;
  const price = item.pricing?.marketPrice || item.pricing?.baseCost || 499;
  const craftLabel = item.specs?.craftTechnique || item.category;
  const region = item.specs?.regionHeritage;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
      className="group bg-white rounded-2xl border border-kk-line/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-stone-300 transition-all duration-200 overflow-hidden flex flex-col justify-between text-left cursor-pointer active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-kk-primary/40 h-full w-full max-w-full box-border select-none"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-stone-100">
        <img
          src={item.studioImage || item.originalImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Handmade / GI Badge */}
        {item.specs?.isHandmade && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-kk-ink/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs pointer-events-none max-w-[calc(100%-36px)] truncate">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
            <span className="truncate">{language === "hi" ? "हस्तनिर्मित" : "Handmade"}</span>
          </span>
        )}

        {/* Wishlist Button - Safely Positioned Inside Card */}
        <button
          type="button"
          onClick={(e) => onToggleWishlist(e, item.id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-75 shadow-xs backdrop-blur-xs z-10 ${
            isWishlisted
              ? "bg-kk-primary text-white"
              : "bg-white/90 dark:bg-[#231D1A]/90 text-stone-700 dark:text-[#B3A79E] hover:text-kk-primary dark:hover:text-kk-primary hover:bg-white dark:hover:bg-[#2E2622]"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${isWishlisted ? "fill-current scale-110" : ""}`}
          />
        </button>
      </div>

      {/* Card Info */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5 min-w-0 w-full">
        <div className="min-w-0 w-full">
          {/* Craft / Region Tag */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-stone-500 mb-1 font-medium min-w-0">
            <span className="text-kk-primary capitalize shrink-0 font-semibold">{craftLabel}</span>
            {region && (
              <>
                <span className="shrink-0 text-stone-300">•</span>
                <span className="truncate">{region}</span>
              </>
            )}
          </div>

          {/* Title - Controlled 2-Line Truncation (no mid-word breaking) */}
          <h3
            className="text-xs sm:text-sm font-bold text-kk-ink leading-snug group-hover:text-kk-primary transition-colors break-normal overflow-hidden min-h-[2rem]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 mt-auto w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium">₹</span>
              <span className="text-xs sm:text-base font-extrabold text-kk-ink tracking-tight truncate">
                {price.toLocaleString("en-IN")}
              </span>
            </div>
            {item.pricing?.exhibitionPrice && item.pricing.exhibitionPrice > price && (
              <span className="text-[9px] sm:text-[10px] text-stone-400 line-through block truncate">
                ₹{item.pricing.exhibitionPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <span className="text-[10px] sm:text-[11px] font-semibold text-kk-primary bg-kk-primary-soft group-hover:bg-kk-primary group-hover:text-white active:scale-95 px-2 sm:px-2.5 py-1 rounded-lg transition-all duration-150 shrink-0 whitespace-nowrap shadow-2xs">
            {language === "hi" ? "देखें" : "View"}
          </span>
        </div>
      </div>
    </div>
  );
};
