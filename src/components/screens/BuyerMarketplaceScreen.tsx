import React, { useState } from "react";
import {
  Home,
  Compass,
  Flame,
  Heart,
  ShoppingBag,
  Search,
  User,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  X,
  Database,
  Code2,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";
import { BuyerActiveTab, BuyerCartItem } from "../../types/buyer";
import { BUYER_CATALOG_EXPANDED } from "../../data/buyerData";
import { useTheme } from "../../context/ThemeContext";
import { KalaKartLogo } from "../common/KalaKartLogo";
import { BuyerHomeView } from "../buyer/BuyerHomeView";
import { BuyerSearchView } from "../buyer/BuyerSearchView";
import { BuyerTrendingView } from "../buyer/BuyerTrendingView";
import { BuyerWishlistView } from "../buyer/BuyerWishlistView";
import { BuyerCartView } from "../buyer/BuyerCartView";
import { BuyerProductDetailModal } from "../buyer/BuyerProductDetailModal";

interface BuyerMarketplaceScreenProps {
  catalogItems: CatalogItem[];
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSwitchToSeller: () => void;
  onLogout?: () => void;
  onOpenAdminMarketData?: () => void;
  onOpenCodeModal?: () => void;
}

export const BuyerMarketplaceScreen: React.FC<BuyerMarketplaceScreenProps> = ({
  catalogItems,
  language,
  onLanguageChange,
  onSwitchToSeller,
  onLogout,
  onOpenAdminMarketData,
  onOpenCodeModal,
}) => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<BuyerActiveTab>("home");
  const [wishlistIds, setWishlistIds] = useState<string[]>(["item-1", "item-2"]);
  const [cart, setCart] = useState<BuyerCartItem[]>([
    {
      id: "cart-1",
      product: BUYER_CATALOG_EXPANDED[0],
      quantity: 1,
      selectedPrice: 399,
      addedAt: new Date().toISOString(),
    },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>("");

  // Merge runtime artisan listings with expanded authentic catalog items
  // Unique by id
  const allProducts = React.useMemo(() => {
    const map = new Map<string, CatalogItem>();
    BUYER_CATALOG_EXPANDED.forEach((item) => map.set(item.id, item));
    catalogItems.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [catalogItems]);

  // Wishlist toggle
  const handleToggleWishlist = (e?: React.MouseEvent, itemId?: string) => {
    if (e) e.stopPropagation();
    if (!itemId) return;
    setWishlistIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Add to cart
  const handleAddToCart = (product: CatalogItem, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const price = product.pricing?.marketPrice || product.pricing?.baseCost || 499;
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${product.id}`,
          product,
          quantity,
          selectedPrice: price,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  // Open item modal
  const handleSelectItem = (item: CatalogItem) => {
    setSelectedProduct(item);
    setIsDetailModalOpen(true);
  };

  // Navigate to category in explore tab
  const handleSelectCategory = (categoryDomain: string) => {
    setSearchCategory(categoryDomain);
    setActiveTab("explore");
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-kk-surface text-kk-ink font-buyer relative overflow-hidden select-none">
      {/* 1. Clean Buyer Header (Kala-Kart branding, Search icon, Cart, More Menu) */}
      <header className="sticky top-0 z-30 bg-kk-surface/95 backdrop-blur-md px-3 sm:px-4 py-2 border-b border-kk-line flex items-center justify-between shadow-2xs w-full max-w-full box-border">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <KalaKartLogo
            size="sm"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-2xs border border-amber-900/10 bg-kk-surface p-0.5 shrink-0"
            alt="Kala-Kart Marketplace"
          />
          <div className="cursor-pointer select-none" onClick={() => setActiveTab("home")}>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-kk-ink tracking-tight leading-none">
                कला-कार्ट
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-kk-primary bg-kk-primary-soft px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Store
              </span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium hidden sm:block">
              {language === "hi" ? "कारीगरों का सीधा बाज़ार" : "Artisan Marketplace"}
            </span>
          </div>
        </div>

        {/* Desktop / Tablet Center Navigation Tabs (Hidden on mobile, pristine on desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-[#1E1815] p-1 rounded-xl border border-kk-line dark:border-[#382E28] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "home"
                ? "bg-white text-kk-ink shadow-2xs dark:bg-[#2E2622] dark:text-[#F6EFEA] dark:border dark:border-[#42352D]"
                : "text-stone-600 hover:text-kk-ink dark:text-[#A89C92] dark:hover:text-[#F6EFEA]"
            }`}
          >
            {language === "hi" ? "होम" : "Home"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "explore"
                ? "bg-white text-kk-ink shadow-2xs dark:bg-[#2E2622] dark:text-[#F6EFEA] dark:border dark:border-[#42352D]"
                : "text-stone-600 hover:text-kk-ink dark:text-[#A89C92] dark:hover:text-[#F6EFEA]"
            }`}
          >
            {language === "hi" ? "खोजें" : "Explore"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trending")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "trending"
                ? "bg-white text-kk-ink shadow-2xs dark:bg-[#2E2622] dark:text-[#F6EFEA] dark:border dark:border-[#42352D]"
                : "text-stone-600 hover:text-kk-ink dark:text-[#A89C92] dark:hover:text-[#F6EFEA]"
            }`}
          >
            {language === "hi" ? "ट्रेंडिंग" : "Trending"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "wishlist"
                ? "bg-white text-kk-ink shadow-2xs dark:bg-[#2E2622] dark:text-[#F6EFEA] dark:border dark:border-[#42352D]"
                : "text-stone-600 hover:text-kk-ink dark:text-[#A89C92] dark:hover:text-[#F6EFEA]"
            }`}
          >
            {language === "hi" ? "विशलिस्ट" : "Wishlist"} ({wishlistIds.length})
          </button>
        </nav>

        {/* Header Action Controls (Search, Wishlist on desktop, Cart, Menu) - Compact & never overflows */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Search trigger */}
          <button
            type="button"
            onClick={() => {
              setIsSearchExpanded(!isSearchExpanded);
              if (!isSearchExpanded && activeTab !== "explore") {
                setActiveTab("explore");
              }
            }}
            aria-label="Search"
            className={`p-2 rounded-xl transition-colors ${
              isSearchExpanded || activeTab === "explore"
                ? "bg-kk-primary-soft text-kk-primary"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Wishlist Shortcut */}
          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            aria-label="Wishlist"
            className={`hidden md:flex relative p-2 rounded-xl transition-colors ${
              activeTab === "wishlist"
                ? "bg-kk-primary-soft text-kk-primary"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Heart className="w-4 h-4" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-kk-primary" />
            )}
          </button>

          {/* Shopping Cart Icon */}
          <button
            type="button"
            onClick={() => setActiveTab("cart")}
            aria-label="Shopping Cart"
            className={`relative p-2 rounded-xl transition-colors ${
              activeTab === "cart"
                ? "bg-kk-primary text-white"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-kk-primary text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Secondary Actions / Menu Button */}
          <button
            type="button"
            onClick={() => setShowAccountModal(!showAccountModal)}
            aria-label="Menu"
            aria-expanded={showAccountModal}
            className="p-1.5 sm:p-2 rounded-xl border border-kk-line bg-white hover:bg-stone-50 text-stone-700 transition-colors flex items-center justify-center"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Expandable Mobile Search Field (Fits viewport perfectly, folds away) */}
      {isSearchExpanded && (
        <div className="bg-white px-3 py-2 border-b border-kk-line flex items-center gap-2 shadow-2xs z-20 animate-in slide-in-from-top-1 duration-150 w-full max-w-full box-border">
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none shrink-0" />
            <input
              type="text"
              autoFocus
              value={headerSearchQuery}
              onChange={(e) => {
                setHeaderSearchQuery(e.target.value);
                if (activeTab !== "explore") {
                  setActiveTab("explore");
                }
              }}
              placeholder={language === "hi" ? "प्रामाणिक हस्तशिल्प खोजें..." : "Search authentic crafts..."}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-100 border border-kk-line rounded-xl focus:bg-white focus:outline-hidden focus:border-kk-primary text-kk-ink transition-colors"
            />
            {headerSearchQuery && (
              <button
                type="button"
                onClick={() => setHeaderSearchQuery("")}
                className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsSearchExpanded(false)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-1 py-1 shrink-0"
          >
            {language === "hi" ? "बंद करें" : "Cancel"}
          </button>
        </div>
      )}

      {/* Customer Account & Navigation Dropdown Popover */}
      {showAccountModal && (
        <div
          className="absolute top-12 right-2 sm:right-4 z-50 w-64 max-w-[calc(100vw-16px)] bg-white rounded-2xl border border-kk-line shadow-2xl p-3 space-y-2.5 animate-in fade-in duration-150"
          role="dialog"
          aria-label="Buyer Menu"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-kk-primary-soft text-kk-primary flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-kk-ink truncate">Anita Deshmukh</p>
                <p className="text-[10px] text-stone-500 truncate">buyer@kalakart.in</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAccountModal(false)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("cart");
                setShowAccountModal(false);
              }}
              className="w-full text-left px-2 py-2 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                <span>{language === "hi" ? "शॉपिंग कार्ट" : "Shopping Bag"}</span>
              </div>
              <span className="text-[10px] bg-kk-primary-soft text-kk-primary font-bold px-2 py-0.5 rounded-full">
                {totalCartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("wishlist");
                setShowAccountModal(false);
              }}
              className="w-full text-left px-2 py-2 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-stone-500" />
                <span>{language === "hi" ? "सहेजे गए शिल्प (Wishlist)" : "Saved Crafts"}</span>
              </div>
              <span className="text-[10px] text-stone-500 font-bold">{wishlistIds.length}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("account");
                setShowAccountModal(false);
              }}
              className="w-full text-left px-2 py-2 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>{language === "hi" ? "ग्राहक खाता व ऑर्डर" : "Account & Orders"}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>

          {/* Language Switch inside menu */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500 text-[11px] font-medium">
              {language === "hi" ? "भाषा बदलें" : "Language"}
            </span>
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-kk-line">
              <button
                type="button"
                onClick={() => onLanguageChange("hi")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                  language === "hi" ? "bg-kk-primary text-white shadow-2xs" : "text-stone-600"
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange("en")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                  language === "en" ? "bg-kk-primary text-white shadow-2xs" : "text-stone-600"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Appearance / Theme Switch inside menu */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {theme === "dark" ? (
                <Moon className="w-3.5 h-3.5 text-kk-primary" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-kk-primary" />
              )}
              <span className="text-stone-500 text-[11px] font-medium">
                {language === "hi" ? "दिखावट" : "Appearance"}
              </span>
            </div>
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-kk-line">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${
                  theme === "light" ? "bg-kk-primary text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
                }`}
                aria-label="Light Mode"
              >
                <Sun className="w-3 h-3" />
                <span>{language === "hi" ? "लाइट" : "Light"}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${
                  theme === "dark" ? "bg-kk-primary text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
                }`}
                aria-label="Dark Mode"
              >
                <Moon className="w-3 h-3" />
                <span>{language === "hi" ? "डार्क" : "Dark"}</span>
              </button>
            </div>
          </div>

          {/* Switch to Artisan Mode Shortcut */}
          <div className="pt-2 border-t border-stone-100 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setShowAccountModal(false);
                onSwitchToSeller();
              }}
              className="w-full p-2 rounded-xl bg-kk-primary-soft hover:bg-kk-primary-soft/80 text-kk-primary text-[11px] font-bold transition-colors flex items-center justify-between"
            >
              <span>{language === "hi" ? "कारीगर पोर्टल पर जाएं" : "Switch to Artisan Mode"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onOpenAdminMarketData && (
              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  onOpenAdminMarketData();
                }}
                className="w-full p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === "hi" ? "मार्केट प्राइस एडमिन (ONDC)" : "Market Price Admin (ONDC)"}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-amber-600" />
              </button>
            )}

            {onOpenCodeModal && (
              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  onOpenCodeModal();
                }}
                className="w-full p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === "hi" ? "कोटलिन / कंपोज़ कोड" : "Kotlin & Compose"}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-blue-600" />
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  onLogout();
                }}
                className="w-full p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <span>{language === "hi" ? "लॉगआउट करें" : "Sign Out"}</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Viewport Content with Scroll */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 py-3 sm:py-4 pb-24 md:pb-8 w-full max-w-7xl mx-auto box-border">
        {activeTab === "home" && (
          <BuyerHomeView
            items={allProducts}
            language={language}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectItem={handleSelectItem}
            onSelectCategory={handleSelectCategory}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "explore" && (
          <BuyerSearchView
            items={allProducts}
            language={language}
            wishlistIds={wishlistIds}
            initialCategory={searchCategory}
            initialQuery={headerSearchQuery}
            onToggleWishlist={handleToggleWishlist}
            onSelectItem={handleSelectItem}
          />
        )}

        {activeTab === "trending" && (
          <BuyerTrendingView
            items={allProducts}
            language={language}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectItem={handleSelectItem}
            onExploreAll={() => setActiveTab("explore")}
          />
        )}

        {activeTab === "wishlist" && (
          <BuyerWishlistView
            items={allProducts}
            language={language}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectItem={handleSelectItem}
            onExplore={() => setActiveTab("explore")}
          />
        )}

        {activeTab === "cart" && (
          <BuyerCartView
            cart={cart}
            language={language}
            onUpdateQuantity={(id, qty) => {
              if (qty <= 0) {
                setCart((prev) => prev.filter((it) => it.id !== id));
              } else {
                setCart((prev) =>
                  prev.map((it) => (it.id === id ? { ...it, quantity: qty } : it))
                );
              }
            }}
            onRemoveItem={(id) => setCart((prev) => prev.filter((it) => it.id !== id))}
            onClearCart={() => setCart([])}
            onExplore={() => setActiveTab("explore")}
          />
        )}

        {activeTab === "account" && (
          <div className="max-w-md mx-auto space-y-4 py-1 animate-in fade-in duration-200">
            {/* Customer Profile Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-kk-line shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-kk-primary-soft text-kk-primary font-extrabold text-base flex items-center justify-center border border-kk-primary-soft shrink-0">
                  AD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-kk-ink">Anita Deshmukh</h3>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                      ONDC Verified
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate">anita.deshmukh@gmail.com</p>
                  <p className="text-[10px] text-stone-400 font-medium">Customer ID: ON-98214</p>
                </div>
              </div>
            </div>

            {/* Account Quick Options */}
            <div className="bg-white rounded-2xl border border-kk-line shadow-2xs divide-y divide-stone-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveTab("cart")}
                className="w-full p-3.5 text-left flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-kk-primary-soft text-kk-primary flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-kk-ink">
                      {language === "hi" ? "मेरी खरीदारी व कार्ट" : "My Orders & Cart"}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {totalCartCount} {language === "hi" ? "शिल्प कार्ट में" : "items in cart"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wishlist")}
                className="w-full p-3.5 text-left flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-kk-ink">
                      {language === "hi" ? "पसंदीदा शिल्प (Wishlist)" : "Saved Masterpieces"}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {wishlistIds.length} {language === "hi" ? "शिल्प सहेजे गए" : "items saved"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Language Selection */}
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-xs font-bold text-kk-ink">
                  {language === "hi" ? "भाषा प्राथमिकता" : "Language Preference"}
                </span>
                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-kk-line">
                  <button
                    type="button"
                    onClick={() => onLanguageChange("hi")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      language === "hi" ? "bg-kk-primary text-white shadow-xs" : "text-stone-600"
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange("en")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      language === "en" ? "bg-kk-primary text-white shadow-xs" : "text-stone-600"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            {/* Switch to Artisan Mode */}
            <div className="bg-kk-primary-soft/50 p-4 rounded-2xl border border-kk-primary-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-kk-ink">
                  {language === "hi" ? "कारीगर हैं? अपने शिल्प बेचें" : "Artisan Portal"}
                </span>
                <span className="text-[10px] font-bold text-kk-primary bg-kk-primary-soft px-2 py-0.5 rounded-full">
                  Artisan OS
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {language === "hi"
                  ? "अपने बनाए हस्तशिल्प को सीधे ONDC और ई-मार्केटप्लेस पर सूचीबद्ध करें।"
                  : "List and manage your handcrafted creations directly with AI Studio enhancement."}
              </p>
              <button
                type="button"
                onClick={onSwitchToSeller}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-kk-primary-soft/60 border border-kk-primary-soft text-kk-primary font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <span>{language === "hi" ? "कारीगर पोर्टल पर जाएं" : "Switch to Artisan Mode"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Settings & Developer Tools Card */}
            {(onOpenAdminMarketData || onOpenCodeModal) && (
              <div className="bg-white p-4 rounded-2xl border border-kk-line shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-xs font-bold text-kk-ink">
                    {language === "hi" ? "व्यवस्थापक व तकनीकी उपकरण" : "Settings & Developer Tools"}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {onOpenAdminMarketData && (
                    <button
                      type="button"
                      onClick={onOpenAdminMarketData}
                      className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === "hi" ? "मार्केट प्राइस एडमिन (ONDC डेटा)" : "Market Price Admin (ONDC)"}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  )}
                  {onOpenCodeModal && (
                    <button
                      type="button"
                      onClick={onOpenCodeModal}
                      className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{language === "hi" ? "कोटलिन / कंपोज़ आर्किटेक्चर" : "Kotlin Architecture"}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Logout / Exit */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-kk-line"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "लॉगआउट / मुख्य स्क्रीन" : "Sign Out / Exit"}</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Native Mobile Bottom Navigation Bar (Home, Explore, Trending, Wishlist, Profile) */}
      <nav
        role="navigation"
        aria-label="Buyer Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1C1614]/95 backdrop-blur-md rounded-t-2xl border-t border-kk-line dark:border-[#382E28] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-1.5 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none w-full max-w-full box-border"
      >
        {/* Home */}
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          aria-label="Home"
          className={`flex-1 min-w-0 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeTab === "home"
              ? "text-kk-primary font-bold"
              : "text-stone-500 hover:text-kk-ink dark:text-[#877C73] dark:hover:text-[#F6EFEA] font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === "home"
                ? "bg-kk-primary-soft/70 dark:bg-[#352C27] dark:border dark:border-[#4D3F37] dark:shadow-xs"
                : "border border-transparent"
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight truncate max-w-full mt-0.5">
            {language === "hi" ? "होम" : "Home"}
          </span>
        </button>

        {/* Explore */}
        <button
          type="button"
          onClick={() => {
            setSearchCategory("all");
            setActiveTab("explore");
          }}
          aria-label="Explore"
          className={`flex-1 min-w-0 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeTab === "explore"
              ? "text-kk-primary font-bold"
              : "text-stone-500 hover:text-kk-ink dark:text-[#877C73] dark:hover:text-[#F6EFEA] font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === "explore"
                ? "bg-kk-primary-soft/70 dark:bg-[#352C27] dark:border dark:border-[#4D3F37] dark:shadow-xs"
                : "border border-transparent"
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight truncate max-w-full mt-0.5">
            {language === "hi" ? "खोजें" : "Explore"}
          </span>
        </button>

        {/* Trending */}
        <button
          type="button"
          onClick={() => setActiveTab("trending")}
          aria-label="Trending"
          className={`flex-1 min-w-0 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeTab === "trending"
              ? "text-kk-primary font-bold"
              : "text-stone-500 hover:text-kk-ink dark:text-[#877C73] dark:hover:text-[#F6EFEA] font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === "trending"
                ? "bg-kk-primary-soft/70 dark:bg-[#352C27] dark:border dark:border-[#4D3F37] dark:shadow-xs"
                : "border border-transparent"
            }`}
          >
            <Flame className="w-4 h-4 shrink-0" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight truncate max-w-full mt-0.5">
            {language === "hi" ? "ट्रेंडिंग" : "Trending"}
          </span>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => setActiveTab("wishlist")}
          aria-label="Wishlist"
          className={`relative flex-1 min-w-0 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeTab === "wishlist"
              ? "text-kk-primary font-bold"
              : "text-stone-500 hover:text-kk-ink dark:text-[#877C73] dark:hover:text-[#F6EFEA] font-medium"
          }`}
        >
          <div
            className={`relative p-1 rounded-xl transition-all ${
              activeTab === "wishlist"
                ? "bg-kk-primary-soft/70 dark:bg-[#352C27] dark:border dark:border-[#4D3F37] dark:shadow-xs"
                : "border border-transparent"
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-kk-primary" />
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight truncate max-w-full mt-0.5">
            {language === "hi" ? "विशलिस्ट" : "Wishlist"}
          </span>
        </button>

        {/* Profile (Account) */}
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          aria-label="Profile"
          className={`flex-1 min-w-0 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeTab === "account"
              ? "text-kk-primary font-bold"
              : "text-stone-500 hover:text-kk-ink dark:text-[#877C73] dark:hover:text-[#F6EFEA] font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === "account"
                ? "bg-kk-primary-soft/70 dark:bg-[#352C27] dark:border dark:border-[#4D3F37] dark:shadow-xs"
                : "border border-transparent"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight truncate max-w-full mt-0.5">
            {language === "hi" ? "प्रोफाइल" : "Profile"}
          </span>
        </button>
      </nav>

      {/* Product Detail Modal */}
      <BuyerProductDetailModal
        item={selectedProduct}
        isOpen={isDetailModalOpen}
        language={language}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        onToggleWishlist={(id) => handleToggleWishlist(undefined, id)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
