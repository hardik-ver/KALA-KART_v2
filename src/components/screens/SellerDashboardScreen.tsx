import React, { useState } from "react";
import { 
  TrendingUp, 
  Package, 
  Eye, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  IndianRupee,
  Camera,
  Tag,
  Plus,
  ShoppingBag,
  ExternalLink,
  Share2,
  Calendar,
  User,
  ShieldCheck,
  Database,
  Code2,
  LogOut,
  MoreVertical,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArtisanUser, 
  CatalogItem, 
  RecentOrder, 
  LanguageCode 
} from "../../types/artisan";
import { DEFAULT_USER } from "../../data/sampleCrafts";
import { TTSButton } from "../common/TTSButton";
import { useTheme } from "../../context/ThemeContext";

interface SellerDashboardScreenProps {
  user: ArtisanUser | null;
  catalogItems: CatalogItem[];
  recentOrders: RecentOrder[];
  language: LanguageCode;
  onStartSell: () => void;
  onStartNewListing?: () => void;
  onViewInventory: () => void;
  onNavigateBuyer?: () => void;
  onSelectItem?: (item: CatalogItem) => void;
  onLanguageChange?: (lang: LanguageCode) => void;
  onLogout?: () => void;
  onOpenAdminMarketData?: () => void;
  onOpenCodeModal?: () => void;
}

export const SellerDashboardScreen: React.FC<SellerDashboardScreenProps> = ({
  user = DEFAULT_USER,
  catalogItems,
  recentOrders,
  language,
  onStartSell,
  onStartNewListing,
  onViewInventory,
  onNavigateBuyer,
  onSelectItem,
  onLanguageChange,
  onLogout,
  onOpenAdminMarketData,
  onOpenCodeModal,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  // Fallback to onStartSell if onStartNewListing was passed, or vice versa
  const handleTriggerSell = () => {
    if (onStartSell) {
      onStartSell();
    } else if (onStartNewListing) {
      onStartNewListing();
    }
  };

  const activeUser = user || DEFAULT_USER;
  const firstName = (activeUser.name || "Artisan").trim().split(/\s+/)[0];
  const totalSales = activeUser.totalEarnings.toLocaleString("en-IN");
  const totalItems = catalogItems.length;

  const audioSummaryHi = `नमस्ते ${activeUser.name} जी! इस महीने आपने ${totalItems} उत्पादों के माध्यम से कुल ₹${totalSales} की बिक्री की है। नए उत्पाद जोड़ने के लिए नीचे दिए गए नारंगी बटन पर टैप करें।`;
  const audioSummaryEn = `Hello ${activeUser.name}! You have earned ₹${totalSales} across ${totalItems} listed craft items this month. Tap the orange button to sell a new craft product.`;

  return (
    <div className="flex flex-col h-full bg-kk-surface text-kk-ink p-4 sm:p-5 overflow-y-auto font-sans relative select-none">
      {/* Top Profile Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-kk-line">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 border-2 border-kk-primary shadow-xs flex items-center justify-center text-stone-400 overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7 text-stone-400 translate-y-1"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.5a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zM4 19.25a8 8 0 0116 0v.25a1 1 0 01-1 1H5a1 1 0 01-1-1v-.25z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {activeUser.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-bold text-kk-ink tracking-tight leading-tight">
                Hey, {firstName}
              </h2>
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-kk-primary-soft text-kk-primary-dark uppercase tracking-wider">
                {activeUser.role === "individual" ? "Shilp Guru" : "Co-op"}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Summary Speaker & Quick Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          <TTSButton
            text={language === "hi" ? audioSummaryHi : audioSummaryEn}
            lang={language}
            variant="pill"
            size="sm"
            label={language === "hi" ? "रिपोर्ट सुनें" : "Listen Summary"}
          />

          {/* Quick Menu / Settings Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-kk-line transition-colors"
              aria-label="Settings and Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-9 w-60 bg-white rounded-2xl border border-kk-line shadow-xl p-2.5 space-y-2 z-50"
                  role="dialog"
                  aria-label="Seller Quick Menu"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 px-1">
                  <span className="text-xs font-bold text-kk-ink">
                    {language === "hi" ? "त्वरित विकल्प" : "Options & Settings"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMenu(false)}
                    className="text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Language Switch inside Three-Dot Menu */}
                {onLanguageChange && (
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-bold text-stone-600">
                        {language === "hi" ? "भाषा (Language)" : "Language"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-stone-200/60 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          onLanguageChange("hi");
                        }}
                        className={`py-1 rounded-md transition-all ${
                          language === "hi"
                            ? "bg-kk-primary text-white shadow-2xs"
                            : "text-stone-700 hover:text-stone-900 hover:bg-white/60"
                        }`}
                      >
                        हिंदी (HI)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLanguageChange("en");
                        }}
                        className={`py-1 rounded-md transition-all ${
                          language === "en"
                            ? "bg-kk-primary text-white shadow-2xs"
                            : "text-stone-700 hover:text-stone-900 hover:bg-white/60"
                        }`}
                      >
                        English (EN)
                      </button>
                    </div>
                  </div>
                )}

                {/* Appearance / Theme Switch inside Three-Dot Menu */}
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <div className="flex items-center gap-1.5">
                      {theme === "dark" ? (
                        <Moon className="w-3.5 h-3.5 text-kk-primary" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-kk-primary" />
                      )}
                      <span className="text-[11px] font-bold text-stone-600">
                        {language === "hi" ? "दिखावट (Theme)" : "Appearance"}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-stone-400">
                      {theme === "dark"
                        ? language === "hi"
                          ? "डार्क"
                          : "Dark"
                        : language === "hi"
                        ? "लाइट"
                        : "Light"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-stone-200/60 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`py-1 px-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        theme === "light"
                          ? "bg-kk-primary text-white shadow-2xs"
                          : "text-stone-700 hover:text-stone-900 hover:bg-white/60"
                      }`}
                      aria-label="Light Mode"
                    >
                      <Sun className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === "hi" ? "लाइट" : "Light"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`py-1 px-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        theme === "dark"
                          ? "bg-kk-primary text-white shadow-2xs"
                          : "text-stone-700 hover:text-stone-900 hover:bg-white/60"
                      }`}
                      aria-label="Dark Mode"
                    >
                      <Moon className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === "hi" ? "डार्क" : "Dark"}</span>
                    </button>
                  </div>
                </div>

                {onNavigateBuyer && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onNavigateBuyer();
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-kk-primary-soft/50 text-kk-primary font-semibold text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{language === "hi" ? "खरीदार बाज़ार देखें" : "Buyer Marketplace"}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {onOpenAdminMarketData && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenAdminMarketData();
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === "hi" ? "मार्केट प्राइस एडमिन (ONDC)" : "Market Price Admin (ONDC)"}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                )}

                {onOpenCodeModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenCodeModal();
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === "hi" ? "कोटलिन / कंपोज़ आर्किटेक्चर" : "Kotlin Architecture"}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                )}

                {onLogout && (
                  <div className="pt-1.5 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-red-50 text-red-600 font-medium text-xs flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === "hi" ? "लॉगआउट करें" : "Sign Out"}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Primary CTA Banner: "Sell New Craft / Add New Product" */}
      <div className="mt-3.5">
        <button
          type="button"
          onClick={handleTriggerSell}
          className="relative overflow-hidden w-full p-5 sm:p-6 md:p-6.5 bg-gradient-to-br from-[#38281F] via-[#2A1D17] to-[#1C130E] dark:from-[#2C1F18] dark:via-[#201712] dark:to-[#150F0B] text-white rounded-2xl sm:rounded-3xl flex items-center justify-between shadow-xl shadow-[#1C130E]/25 dark:shadow-black/60 active:scale-[0.98] transition-all group border border-[#5C4334]/80 dark:border-[#4A3427] hover:border-kk-primary"
        >
          {/* Subtle warm ember / ambient gradient accents preserving the dark brownish theme */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-kk-primary/30 via-kk-primary-dark/15 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-[#8C5331]/20 via-transparent to-transparent rounded-full blur-xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4 sm:gap-5 text-left">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-kk-primary to-kk-primary-dark flex items-center justify-center text-white shadow-lg shadow-black/30 group-hover:scale-105 transition-transform flex-shrink-0 border border-white/20">
              <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#EDD6C8] dark:text-[#E8A57A] block">
                {language === "hi" ? "AI कैमरा व स्टूडियो एनहांसर" : "AI Camera & Studio Enhancer"}
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white dark:text-[#FBF7F4] leading-tight mt-0.5">
                {language === "hi" ? "+ नया उत्पाद बेचें (Sell New Craft)" : "+ SELL NEW CRAFT PRODUCT"}
              </h3>
              <p className="text-xs sm:text-sm text-[#D7CCC4] dark:text-[#C5B8AF] font-normal mt-1">
                {language === "hi" ? "फोटो खींचें • आवाज से विवरण • तुरंत लिस्ट करें" : "Snap photo • Voice catalog • Instant listing"}
              </p>
            </div>
          </div>
          <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 dark:bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-kk-primary group-hover:border-kk-primary transition-all flex-shrink-0 group-hover:translate-x-0.5">
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </button>
      </div>

      {/* 3 Quick Performance Analytics Cards */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {language === "hi" ? "व्यापार विश्लेषण (Overview)" : "Performance Analytics"}
          </h3>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            ● Live Sync
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Total Sales Revenue */}
          <div className="p-3 bg-white rounded-2xl border border-kk-line shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {language === "hi" ? "कुल कमाई" : "Revenue"}
              </span>
              <IndianRupee className="w-3.5 h-3.5 text-kk-primary" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-kk-ink leading-none">
                ₹{activeUser.totalEarnings.toLocaleString("en-IN")}
              </h4>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-2.5 h-2.5" /> +18.4%
              </span>
            </div>
          </div>

          {/* Total Listed Products */}
          <div 
            onClick={onViewInventory}
            role="button"
            tabIndex={0}
            className="p-3 bg-white rounded-2xl border border-kk-line shadow-xs flex flex-col justify-between cursor-pointer hover:border-orange-300 active:scale-[0.97] transition-all"
          >
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {language === "hi" ? "उत्पाद" : "Listed"}
              </span>
              <Package className="w-3.5 h-3.5 text-kk-primary" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-kk-ink leading-none">
                {catalogItems.length}
              </h4>
              <span className="text-[10px] font-medium text-stone-500 block mt-1">
                {catalogItems.filter(i => i.status === "live").length} {language === "hi" ? "लाइव" : "Live"}
              </span>
            </div>
          </div>

          {/* Views & Inquiries */}
          <div className="p-3 bg-white rounded-2xl border border-kk-line shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {language === "hi" ? "पूछताछ" : "Inquiries"}
              </span>
              <Eye className="w-3.5 h-3.5 text-kk-primary" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-kk-ink leading-none">
                {activeUser.totalInquiriesCount}
              </h4>
              <span className="text-[10px] font-medium text-kk-primary block mt-1">
                34 {language === "hi" ? "नए खरीदार" : "Leads"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings Carousel */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {language === "hi" ? "सक्रिय उत्पाद (Active Listings)" : "Active Products Carousel"}
            </h3>
            <span className="text-[10px] font-semibold text-stone-400">
              ({catalogItems.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onViewInventory}
            className="text-xs text-kk-primary font-semibold flex items-center gap-0.5 hover:underline"
          >
            <span>{language === "hi" ? "सभी देखें" : "View All"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Scrollable Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
          {catalogItems.map((item) => {
            const activePrice =
              item.pricing.selectedTier === "base"
                ? item.pricing.baseCost
                : item.pricing.selectedTier === "market"
                ? item.pricing.marketPrice
                : item.pricing.exhibitionPrice;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectItem) {
                    onSelectItem(item);
                  } else {
                    onViewInventory();
                  }
                }}
                role="button"
                tabIndex={0}
                className="w-48 sm:w-52 flex-shrink-0 snap-start bg-white rounded-2xl border border-kk-line shadow-xs overflow-hidden cursor-pointer hover:border-kk-primary hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo with status badge */}
                <div className="relative w-full h-32 bg-stone-900 overflow-hidden">
                  <img
                    src={item.studioImage || item.originalImage}
                    alt={item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status Badge */}
                  <span
                    className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-xs ${
                      item.status === "live"
                        ? "bg-emerald-600 text-white"
                        : item.status === "sold"
                        ? "bg-stone-800 text-stone-300"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {item.status === "live" ? "● Live" : item.status === "sold" ? "Sold Out" : "Draft"}
                  </span>

                  {/* Price Tag */}
                  <div className="absolute bottom-2 right-2 bg-kk-ink/90 text-white px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-xs border border-white/20">
                    ₹{activePrice.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5 flex-1 flex flex-col justify-between bg-white dark:bg-[#1E1713]">
                  <div>
                    <h4 className="font-semibold text-xs text-kk-ink dark:text-[#F6EFEA] line-clamp-2 leading-snug min-h-[2rem]">
                      {language === "hi" ? item.titleHi : item.titleEn}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-stone-100 dark:border-[#332A24] text-[10px] text-stone-500 dark:text-[#9A8B80] font-medium">
                    <span>{item.viewsCount || 120} {language === "hi" ? "व्यूज" : "views"}</span>
                    <span className="text-kk-primary font-semibold flex items-center gap-0.5">
                      {language === "hi" ? "विवरण" : "Details"} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* "+ Add New Craft" Action Card at end of Carousel */}
          <div
            onClick={handleTriggerSell}
            role="button"
            tabIndex={0}
            className="w-40 sm:w-44 flex-shrink-0 snap-start bg-kk-primary-soft/30 dark:bg-[#251E1A] rounded-2xl border-2 border-dashed border-kk-primary-soft dark:border-[#42352D] hover:border-kk-primary hover:bg-kk-primary-soft/50 dark:hover:bg-[#2E2622] dark:hover:border-kk-primary cursor-pointer transition-all flex flex-col items-center justify-center p-4 text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-kk-primary text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-kk-primary leading-tight">
              {language === "hi" ? "+ नया उत्पाद" : "+ Add Craft"}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-[#B3A79E] font-normal mt-1">
              {language === "hi" ? "कैमरा से जोड़ें" : "Launch Camera"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders & B2B Inquiries Section */}
      <div className="mt-4 pb-28 md:pb-14">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {language === "hi" ? "ताज़ा ऑर्डर व खरीदार मांग (Recent Orders)" : "Recent Orders & B2B Demands"}
            </h3>
          </div>
          <span className="text-[10px] font-medium text-stone-400">
            GeM / ONDC / FabIndia
          </span>
        </div>

        <div className="space-y-2">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              role="button"
              tabIndex={0}
              className="p-3 bg-white dark:bg-[#1E1713] rounded-xl border border-kk-line dark:border-[#382B24] shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-stone-300 dark:hover:border-[#523F34] active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={order.itemImage}
                  alt={order.itemTitle}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-kk-line dark:border-[#382B24]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase bg-stone-100 dark:bg-[#2F2520] text-stone-700 dark:text-[#D1C5BD]">
                      {order.buyerType === "gem" ? "🏛️ GeM Govt" : order.buyerType === "b2b_wholesale" ? "🏢 Wholesale" : "🛍️ ONDC Retail"}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-[#8C7E74]">
                      {order.orderNumber}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-kk-ink dark:text-[#F6EFEA] line-clamp-2 leading-snug mt-1">
                    {order.buyerName}{" "}
                    <span className="font-bold text-kk-primary whitespace-nowrap">
                      • {order.quantity}x
                    </span>
                  </h4>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-xs sm:text-sm font-bold text-kk-ink dark:text-[#F6EFEA] block">
                  ₹{order.amount.toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5 uppercase ${
                    order.status === "completed"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      : order.status === "shipped"
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOrder(null);
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 border border-kk-line shadow-2xl space-y-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Order Details</span>
                  <h3 className="text-sm font-bold text-kk-ink">{selectedOrder.orderNumber}</h3>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedOrder.itemImage}
                  alt={selectedOrder.itemTitle}
                  className="w-14 h-14 rounded-xl object-cover border border-kk-line"
                />
                <div>
                  <h4 className="font-semibold text-xs text-kk-ink">{selectedOrder.itemTitle}</h4>
                  <p className="text-xs text-stone-500 font-normal mt-0.5">Quantity: {selectedOrder.quantity} units</p>
                  <p className="text-sm font-bold text-kk-primary mt-1">₹{selectedOrder.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-normal">Buyer:</span>
                  <span className="font-semibold text-kk-ink">{selectedOrder.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-normal">Channel:</span>
                  <span className="font-semibold text-stone-700">{selectedOrder.buyerTypeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-normal">Ordered:</span>
                  <span className="font-medium text-stone-600">{selectedOrder.date}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTriggerSell}
                  className="flex-1 py-2.5 bg-kk-primary text-white rounded-xl text-xs font-semibold hover:bg-kk-primary-dark active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "नया जोड़ें" : "Add Similar"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-200 active:scale-95 transition-all"
                >
                  {language === "hi" ? "बंद करें" : "Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
