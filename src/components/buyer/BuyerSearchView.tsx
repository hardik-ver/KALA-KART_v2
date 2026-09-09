import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";
import { BUYER_CATEGORIES } from "../../data/buyerData";
import { BuyerProductCard } from "./BuyerProductCard";

interface BuyerSearchViewProps {
  items: CatalogItem[];
  language: LanguageCode;
  wishlistIds: string[];
  initialCategory?: string;
  initialQuery?: string;
  onToggleWishlist: (e: React.MouseEvent, itemId: string) => void;
  onSelectItem: (item: CatalogItem) => void;
}

export const BuyerSearchView: React.FC<BuyerSearchViewProps> = ({
  items,
  language,
  wishlistIds,
  initialCategory = "all",
  initialQuery = "",
  onToggleWishlist,
  onSelectItem,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "orders">("featured");
  const [handmadeOnly, setHandmadeOnly] = useState<boolean>(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Common craft search pills
  const popularSearches = [
    { en: "Banarasi Silk", hi: "बनारसी सिल्क" },
    { en: "Brass Diya", hi: "पीतल दीपक" },
    { en: "Terracotta", hi: "टेराकोटा" },
    { en: "Wood Elephant", hi: "काष्ठ हाथी" },
    { en: "Blue Pottery", hi: "ब्लू पॉटरी" },
    { en: "Dhokra Bronze", hi: "ढोकरा कांस्य" },
  ];

  // Filtering and sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((item) => {
        const cat = item.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();
        return cat.includes(selected) || selected.includes(cat);
      });
    }

    // Handmade filter
    if (handmadeOnly) {
      result = result.filter((item) => item.specs?.isHandmade);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const titleEn = item.titleEn.toLowerCase();
        const titleHi = item.titleHi.toLowerCase();
        const cat = item.category.toLowerCase();
        const mat = (item.specs?.material || "").toLowerCase();
        const region = (item.specs?.regionHeritage || "").toLowerCase();
        const tech = (item.specs?.craftTechnique || "").toLowerCase();
        const tags = (item.searchTags || []).join(" ").toLowerCase();

        return (
          titleEn.includes(q) ||
          titleHi.includes(q) ||
          cat.includes(q) ||
          mat.includes(q) ||
          region.includes(q) ||
          tech.includes(q) ||
          tags.includes(q)
        );
      });
    }

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.pricing?.marketPrice || 0) - (b.pricing?.marketPrice || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.pricing?.marketPrice || 0) - (a.pricing?.marketPrice || 0));
    } else if (sortBy === "orders") {
      result.sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));
    }

    return result;
  }, [items, selectedCategory, handmadeOnly, searchQuery, sortBy]);

  return (
    <div className="space-y-4 pb-12">
      {/* Prominent Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "hi"
                ? "हस्तशिल्प, बनारसी सिल्क, पीतल या मिट्टी के दीये खोजें..."
                : "Search authentic handicrafts, silk, brass diya, wood..."
            }
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-[#231D1A] border border-kk-line dark:border-[#3D332C] rounded-2xl text-xs sm:text-sm text-kk-ink dark:text-[#F6EFEA] placeholder:text-stone-400 dark:placeholder-[#877C73] shadow-2xs focus:outline-hidden focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-[#F6EFEA]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0">
        {/* Category Pill: All */}
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
            selectedCategory === "all"
              ? "bg-kk-primary text-white shadow-2xs"
              : "bg-white text-stone-600 border border-kk-line hover:border-stone-300 dark:bg-[#231D1A] dark:text-[#B3A79E] dark:border-[#3D332C] dark:hover:border-[#52443B]"
          }`}
        >
          {language === "hi" ? "सभी शिल्प" : "All Crafts"}
        </button>

        {BUYER_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.craftDomain;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? "all" : cat.craftDomain)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isSelected
                  ? "bg-kk-primary text-white shadow-2xs"
                  : "bg-white text-stone-600 border border-kk-line hover:border-stone-300 dark:bg-[#231D1A] dark:text-[#B3A79E] dark:border-[#3D332C] dark:hover:border-[#52443B]"
              }`}
            >
              {language === "hi" ? cat.nameHi : cat.nameEn}
            </button>
          );
        })}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>

      {/* Secondary Filter & Sort Controls */}
      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Handmade Toggle */}
          <button
            type="button"
            onClick={() => setHandmadeOnly(!handmadeOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              handmadeOnly
                ? "bg-kk-ink text-white dark:bg-kk-primary dark:text-white shadow-2xs"
                : "bg-white text-stone-600 border border-kk-line hover:bg-stone-50 dark:bg-[#231D1A] dark:text-[#B3A79E] dark:border-[#3D332C] dark:hover:bg-[#2C2420]"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{language === "hi" ? "केवल हस्तनिर्मित" : "Handmade Only"}</span>
          </button>

          {/* Active Filter Clear */}
          {(selectedCategory !== "all" || handmadeOnly || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setHandmadeOnly(false);
                setSearchQuery("");
              }}
              className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors"
            >
              {language === "hi" ? "रीसेट करें" : "Reset"}
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold text-stone-700 bg-white border border-kk-line rounded-lg px-2 py-1 focus:outline-hidden focus:border-kk-primary dark:bg-[#231D1A] dark:text-[#F6EFEA] dark:border-[#3D332C]"
          >
            <option value="featured">{language === "hi" ? "अनुशंसित" : "Featured"}</option>
            <option value="price_asc">{language === "hi" ? "मूल्य: कम से अधिक" : "Price: Low to High"}</option>
            <option value="price_desc">{language === "hi" ? "मूल्य: अधिक से कम" : "Price: High to Low"}</option>
            <option value="orders">{language === "hi" ? "लोकप्रिय" : "Most Ordered"}</option>
          </select>
        </div>
      </div>

      {/* Popular Suggestions (When query is empty) */}
      {!searchQuery && selectedCategory === "all" && (
        <div className="pt-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
            {language === "hi" ? "लोकप्रिय खोजें:" : "Popular Searches:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularSearches.map((tag) => (
              <button
                key={tag.en}
                type="button"
                onClick={() => setSearchQuery(language === "hi" ? tag.hi : tag.en)}
                className="px-2.5 py-1 bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 rounded-lg text-xs transition-colors dark:bg-[#231D1A] dark:hover:bg-[#2C2420] dark:text-[#B3A79E] dark:border dark:border-[#3D332C]"
              >
                {language === "hi" ? tag.hi : tag.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-stone-500">
          {filteredItems.length} {language === "hi" ? "शिल्प उत्पाद उपलब्ध" : "crafts found"}
        </span>
      </div>

      {/* Search Results Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <BuyerProductCard
              key={item.id}
              item={item}
              language={language}
              isWishlisted={wishlistIds.includes(item.id)}
              onToggleWishlist={onToggleWishlist}
              onClick={onSelectItem}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center max-w-xs mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 border border-kk-line">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-kk-ink-soft">
            {language === "hi" ? "कोई उत्पाद नहीं मिला" : "No crafts found"}
          </h3>
          <p className="text-xs text-stone-500">
            {language === "hi"
              ? "कृपया वर्तनी जांचें या अन्य हस्तकला श्रेणी का चयन करें।"
              : "Try adjusting your search terms or clearing your category filters."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setHandmadeOnly(false);
            }}
            className="px-4 py-2 bg-kk-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-kk-primary-dark transition-colors"
          >
            {language === "hi" ? "सभी शिल्प देखें" : "View All Crafts"}
          </button>
        </div>
      )}
    </div>
  );
};
