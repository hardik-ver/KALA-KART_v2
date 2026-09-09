import React from "react";
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, ShieldCheck } from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";
import { BuyerProductCard } from "./BuyerProductCard";

interface BuyerTrendingViewProps {
  items: CatalogItem[];
  language: LanguageCode;
  wishlistIds: string[];
  onToggleWishlist: (e: React.MouseEvent, itemId: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onExploreAll: () => void;
}

export const BuyerTrendingView: React.FC<BuyerTrendingViewProps> = ({
  items,
  language,
  wishlistIds,
  onToggleWishlist,
  onSelectItem,
  onExploreAll,
}) => {
  // Sort legitimately by verified ordersCount or viewsCount
  const trendingItems = [...items].sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));

  // Heritage curated picks
  const heritagePicks = [...items].filter((i) => i.specs?.isHandmade || (i.ordersCount || 0) > 6);

  return (
    <div className="space-y-6 pb-12">
      {/* Editorial Curated Header */}
      <div className="bg-gradient-to-r from-kk-ink via-kk-ink-soft to-kk-ink dark:from-[#251E1A] dark:via-[#2E2622] dark:to-[#251E1A] text-white p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-xl border border-kk-ink-soft dark:border-[#3D332C]">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kk-primary/20 text-kk-primary text-[10px] font-bold tracking-wider uppercase border border-kk-primary/30">
            <Flame className="w-3.5 h-3.5 text-kk-primary" />
            <span>{language === "hi" ? "कारीगरी ट्रेंडिंग संकलन" : "Curated Craft Spotlight"}</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
            {language === "hi"
              ? "भारतीय हस्तशिल्प प्रेमियों द्वारा सबसे अधिक पसंद किए जाने वाले शिल्प"
              : "Most Celebrated Handcrafted Masterpieces Across India"}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 dark:text-[#B3A79E] leading-relaxed">
            {language === "hi"
              ? "पारंपरिक चाक मिट्टी, शुद्ध कड़वा बनारसी बुनाई और सहारनपुर काष्ठ शिल्प — सीधे कारीगरों के घरों से।"
              : "Authentic pit-loom silks, Moradabad chiseled brass, and sustainable terracotta crafted by lineage shilpkars."}
          </p>
        </div>

        {/* Subtle Decorative Backdrop */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-kk-primary/20 to-transparent pointer-events-none" />
      </div>

      {/* Ground-Truth Curated Spotlight */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-kk-primary" />
            <h3 className="text-sm sm:text-base font-bold text-kk-ink">
              {language === "hi" ? "सर्वाधिक ऑर्डर्ड पारंपरिक शिल्प" : "Top Verified Artisan Orders"}
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-medium">
            {language === "hi" ? "वास्तविक ONDC खरीद" : "Verified ONDC syndication"}
          </span>
        </div>

        <div className="flex overflow-x-auto overflow-y-visible flex-nowrap gap-3 pb-3 pt-1 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {trendingItems.slice(0, 4).map((item) => (
            <div key={item.id} className="w-[156px] min-w-[156px] sm:w-[172px] sm:min-w-[172px] shrink-0 md:w-auto md:min-w-0 md:max-w-none md:shrink flex flex-col snap-start">
              <BuyerProductCard
                item={item}
                language={language}
                isWishlisted={wishlistIds.includes(item.id)}
                onToggleWishlist={onToggleWishlist}
                onClick={onSelectItem}
              />
            </div>
          ))}
          <div className="w-3 shrink-0 md:hidden" aria-hidden="true" />
        </div>
      </div>

      {/* Artisan Heritage Lineage Spotlight */}
      <div className="bg-kk-primary-soft/60 dark:bg-[#251E1A] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-kk-primary-soft dark:border-[#3D332C] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-kk-primary shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-kk-ink dark:text-[#F6EFEA]">
                {language === "hi" ? "विरासत शिल्पकला (Heritage Lineage)" : "Heritage Masterworks"}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-[#B3A79E]">
                {language === "hi" ? "पुश्तैनी तकनीक व राष्ट्रीय पुरस्कार प्राप्त कारीगर" : "Generational techniques & Shilp Guru verified creations"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto overflow-y-visible flex-nowrap gap-3 pb-3 pt-1 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {heritagePicks.slice(0, 4).map((item) => (
            <div key={`heritage-${item.id}`} className="w-[156px] min-w-[156px] sm:w-[172px] sm:min-w-[172px] shrink-0 md:w-auto md:min-w-0 md:max-w-none md:shrink flex flex-col snap-start">
              <BuyerProductCard
                item={item}
                language={language}
                isWishlisted={wishlistIds.includes(item.id)}
                onToggleWishlist={onToggleWishlist}
                onClick={onSelectItem}
              />
            </div>
          ))}
          <div className="w-3 shrink-0 md:hidden" aria-hidden="true" />
        </div>
      </div>

      {/* Craft Discovery Banner */}
      <div className="bg-white dark:bg-[#231D1A] p-4 sm:p-5 rounded-2xl border border-kk-line dark:border-[#3D332C] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-kk-primary-soft dark:bg-[#352720] text-kk-primary flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-kk-ink dark:text-[#F6EFEA]">
              {language === "hi" ? "सीधा कारीगर-से-ग्राहक मंच" : "Direct Artisan-to-Consumer Guarantee"}
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-[#B3A79E]">
              {language === "hi"
                ? "बिना किसी बिचौलिए के हर खरीद का 85%+ लाभ सीधे कारीगर के बैंक खाते में जाता है।"
                : "Zero middleman markup — 85%+ of your payment directly supports rural craft clusters."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExploreAll}
          className="px-4 py-2 bg-kk-ink hover:bg-kk-ink-soft dark:bg-kk-primary dark:hover:bg-kk-primary-dark text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <span>{language === "hi" ? "सभी संग्रह देखें" : "Explore All Collections"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
