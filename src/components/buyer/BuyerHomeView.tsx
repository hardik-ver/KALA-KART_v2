import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Flame,
  ChevronRight,
  Feather,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";
import { BUYER_CATEGORIES } from "../../data/buyerData";
import { BuyerProductCard } from "./BuyerProductCard";

interface BuyerHomeViewProps {
  items: CatalogItem[];
  language: LanguageCode;
  wishlistIds: string[];
  onToggleWishlist: (e: React.MouseEvent, itemId: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onSelectCategory: (craftDomain: string) => void;
  onNavigateTab: (tab: "explore" | "trending" | "cart") => void;
}

export const BuyerHomeView: React.FC<BuyerHomeViewProps> = ({
  items,
  language,
  wishlistIds,
  onToggleWishlist,
  onSelectItem,
  onSelectCategory,
  onNavigateTab,
}) => {
  // Curated lists
  const featuredProducts = items.slice(0, 4);
  const trendingProducts = [...items]
    .sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0))
    .slice(0, 4);
  const newArrivals = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* 2. Elegant Hero / Discovery Area (Minimal, artisan-focused, not oversized) */}
      <div className="bg-gradient-to-br from-kk-ink via-kk-ink-soft to-kk-ink dark:from-[#251E1A] dark:via-[#2E2622] dark:to-[#251E1A] text-white p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-xl border border-kk-ink-soft dark:border-[#3D332C] w-full max-w-full box-border">
        <div className="relative z-10 max-w-md sm:max-w-lg space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kk-primary/20 border border-kk-primary/40 text-kk-primary text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-kk-primary shrink-0" />
            <span className="truncate">{language === "hi" ? "सीधा भारतीय कारीगरों से" : "Direct from Indian Artisans"}</span>
          </div>

          <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight leading-snug break-normal">
            {language === "hi"
              ? "भारत के पुश्तैनी शिल्पकारों की अनूठी कलाकृतियां"
              : "Timeless Indian Craft, Directly from the Maker"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 dark:text-[#B3A79E] font-normal leading-relaxed break-normal">
            {language === "hi"
              ? "बिना किसी बिचौलिए के प्रामाणिक मिट्टी, सिल्क, पीतल व काष्ठ शिल्प सीधे बुनकरों व शिल्पकारों के घर से पाएं।"
              : "Discover master-crafted handlooms, chiseled brass, and alluvial terracotta with verified heritage provenance."}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab("explore")}
              className="px-4 py-2.5 bg-kk-primary hover:bg-kk-primary-dark text-white text-xs font-bold rounded-xl shadow-md shadow-kk-ink/40 dark:shadow-black/40 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>{language === "hi" ? "कारीगरी संग्रह देखें" : "Explore Collections"}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("trending")}
              className="px-3.5 py-2.5 bg-kk-ink-soft/80 hover:bg-kk-ink-soft dark:bg-[#352C27] dark:hover:bg-[#40352F] text-slate-200 dark:text-[#F6EFEA] border border-kk-ink-soft dark:border-[#4D3F37] rounded-xl text-xs font-semibold transition-all flex items-center justify-center shrink-0"
            >
              {language === "hi" ? "ट्रेंडिंग शिल्प" : "Trending Crafts"}
            </button>
          </div>
        </div>

        {/* Subtle Decorative Backdrop Elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-kk-primary/15 to-transparent pointer-events-none" />
      </div>

      {/* Bold Artisan Direct Benefit Promo Banner (Coffee-shop app inspired pattern) */}
      <div className="relative overflow-hidden bg-kk-primary text-white p-4 sm:p-5 rounded-2xl shadow-md border border-kk-primary-dark/20 w-full max-w-full box-border">
        <div className="relative z-10 max-w-[calc(100%-60px)] sm:max-w-md space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#251E1A] text-kk-primary text-[10px] font-bold uppercase tracking-wider shadow-xs dark:border dark:border-[#42352D]">
            <ShieldCheck className="w-3 h-3 text-kk-primary shrink-0" />
            <span>{language === "hi" ? "सीधा कारीगर लाभ" : "85%+ Direct to Artisan"}</span>
          </div>
          <h3 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight leading-snug text-white">
            {language === "hi"
              ? "बिना किसी बिचौलिए के हर खरीद का 85%+ लाभ सीधे कारीगर के बैंक खाते में जाता है।"
              : "Zero middleman markup — 85%+ of your payment directly supports rural craft clusters."}
          </h3>
        </div>

        {/* Icon in translucent circle & decorative bleeding circles */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10 shadow-xs">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-12 -bottom-10 w-24 h-24 rounded-full bg-kk-primary-dark/25 pointer-events-none" />
      </div>

      {/* 3. Horizontal Category Navigation (9 Domains) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-kk-ink">
              {language === "hi" ? "हस्तशिल्प श्रेणियां" : "Explore by Craft Domain"}
            </h3>
            <p className="text-[11px] text-stone-500">
              {language === "hi" ? "परंपरागत भारतीय शिल्प विधाएं" : "Heritage disciplines and artisan clusters"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("explore")}
            className="text-xs font-semibold text-kk-primary hover:underline flex items-center gap-0.5"
          >
            <span>{language === "hi" ? "सभी" : "View All"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Category Carousel */}
        <div className="flex items-stretch gap-2.5 overflow-x-auto overflow-y-hidden flex-nowrap no-scrollbar pb-1.5 scroll-smooth snap-x">
          {BUYER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.craftDomain)}
              className="group shrink-0 w-[104px] min-w-[104px] max-w-[104px] sm:w-32 bg-white rounded-2xl border border-kk-line shadow-2xs hover:shadow-md hover:border-stone-300 p-2 text-left transition-all active:scale-95 flex flex-col justify-between snap-start"
            >
              {/* Category Thumbnail Image */}
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-2 shrink-0">
                <img
                  src={cat.image}
                  alt={cat.nameEn}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-kk-ink truncate leading-snug group-hover:text-kk-primary transition-colors">
                  {language === "hi" ? cat.nameHi : cat.nameEn}
                </h4>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {cat.itemCount}+ {language === "hi" ? "उत्पाद" : "crafts"}
                </p>
              </div>
            </button>
          ))}
          {/* Edge spacer for smooth swipe to last item */}
          <div className="w-3 shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* 4. Featured / Curated Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-kk-primary shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-kk-ink truncate">
              {language === "hi" ? "विशिष्ट हस्तशिल्प (Featured Crafts)" : "Curated Artisan Picks"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("explore")}
            className="text-xs font-semibold text-kk-primary hover:underline shrink-0"
          >
            {language === "hi" ? "और देखें" : "See More"}
          </button>
        </div>

        <div className="flex overflow-x-auto overflow-y-visible flex-nowrap gap-3 pb-3 pt-1 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {featuredProducts.map((item) => (
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

      {/* 5. Trending Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-kk-primary shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-kk-ink truncate">
              {language === "hi" ? "ट्रेंडिंग हस्तशिल्प (Trending Now)" : "Trending Masterpieces"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("trending")}
            className="text-xs font-semibold text-kk-primary hover:underline shrink-0"
          >
            {language === "hi" ? "पूरा संग्रह" : "View All"}
          </button>
        </div>

        <div className="flex overflow-x-auto overflow-y-visible flex-nowrap gap-3 pb-3 pt-1 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {trendingProducts.map((item) => (
            <div key={`trending-${item.id}`} className="w-[156px] min-w-[156px] sm:w-[172px] sm:min-w-[172px] shrink-0 md:w-auto md:min-w-0 md:max-w-none md:shrink flex flex-col snap-start">
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

      {/* 6. New Arrivals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-kk-primary shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-kk-ink truncate">
              {language === "hi" ? "हाल ही में शामिल शिल्प (New Arrivals)" : "Fresh From The Looms & Kilns"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("explore")}
            className="text-xs font-semibold text-kk-primary hover:underline shrink-0"
          >
            {language === "hi" ? "और देखें" : "See More"}
          </button>
        </div>

        <div className="flex overflow-x-auto overflow-y-visible flex-nowrap gap-3 pb-3 pt-1 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {newArrivals.map((item) => (
            <div key={`new-${item.id}`} className="w-[156px] min-w-[156px] sm:w-[172px] sm:min-w-[172px] shrink-0 md:w-auto md:min-w-0 md:max-w-none md:shrink flex flex-col snap-start">
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

      {/* 7. Craft Discovery / Artisan Storytelling Section */}
      <div className="bg-kk-surface p-5 sm:p-6 rounded-3xl border border-kk-line space-y-4">
        <div className="flex items-center gap-2">
          <Feather className="w-5 h-5 text-kk-primary" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-kk-ink">
              {language === "hi" ? "शिल्पकार की आवाज़ व विरासत" : "The Artisan Heritage Guarantee"}
            </h3>
            <p className="text-xs text-stone-600">
              {language === "hi" ? "हर शिल्प के पीछे एक पुश्तैनी परंपरा की कहानी है" : "Every handcrafted piece carries centuries of cultural continuity"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-kk-line shadow-2xs space-y-1">
            <span className="text-kk-primary font-bold text-sm block">100% Direct</span>
            <h4 className="font-bold text-kk-ink-soft">
              {language === "hi" ? "बिना बिचौलियों के सीधा लाभ" : "No Intermediaries"}
            </h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              {language === "hi"
                ? "आपकी खरीद का अधिकांश भाग सीधे कारीगर और बुनकर परिवार तक पहुंचता है।"
                : "Payments flow directly into verified master artisan bank accounts."}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-kk-line shadow-2xs space-y-1">
            <span className="text-emerald-700 font-bold text-sm block">Eco-Conscious</span>
            <h4 className="font-bold text-kk-ink-soft">
              {language === "hi" ? "प्राकृतिक व पर्यावरण-अनुकूल" : "Natural Sustainable Raw Materials"}
            </h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              {language === "hi"
                ? "शुद्ध जलोढ़ मिट्टी, प्राकृतिक वनस्पति रंग और टिकाऊ शीशम की लकड़ी।"
                : "Alluvial river clay, organic lacquers, and sustainably seasoned timber."}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-kk-line shadow-2xs space-y-1">
            <span className="text-indigo-700 font-bold text-sm block">ONDC Karigar</span>
            <h4 className="font-bold text-kk-ink-soft">
              {language === "hi" ? "ओएनडीसी नेटवर्क प्रमाणीकरण" : "ONDC Open Commerce"}
            </h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              {language === "hi"
                ? "राष्ट्रीय ई-कॉमर्स नेटवर्क के मानकों पर सत्यापित शिल्प उत्पाद।"
                : "Standardized transparent logistics and dispute-free direct fulfillment."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
