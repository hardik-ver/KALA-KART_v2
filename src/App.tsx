/**
 * Kala-Kart: Virtual Business Manager for Indian Artisans & Weavers
 * Production-Grade Native Android UI & Full E-Commerce Flow
 */

import React, { useState, useEffect } from "react";
import {
  CraftCategory,
  LanguageCode,
  CatalogItem,
  ArtisanUser,
  RecentOrder,
} from "./types/artisan";
import {
  CRAFT_CATEGORIES,
  INITIAL_CATALOG_ITEMS,
  RECENT_ORDERS,
} from "./data/sampleCrafts";
import { SplashScreen } from "./components/screens/SplashScreen";
import { AuthScreen } from "./components/screens/AuthScreen";
import { SellerDashboardScreen } from "./components/screens/SellerDashboardScreen";
import { InventoryScreen } from "./components/screens/InventoryScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { ImageStudioScreen } from "./components/screens/ImageStudioScreen";
import { VoiceCatalogScreen } from "./components/screens/VoiceCatalogScreen";
import { PricingAssistantScreen } from "./components/screens/PricingAssistantScreen";
import { MarketplaceListingScreen } from "./components/screens/MarketplaceListingScreen";
import { MarketDataAdminScreen } from "./components/admin/MarketDataAdminScreen";
import { BuyerMarketplaceScreen } from "./components/screens/BuyerMarketplaceScreen";
import { CodeInspectorModal } from "./components/modals/CodeInspectorModal";
import { AppShell } from "./components/layout/AppShell";
import { SellerWorkspace } from "./components/seller/SellerWorkspace";
import { AnimatePresence, motion } from "motion/react";
import { screenVariants } from "./utils/motion";
import {
  Flame,
  Camera,
  Mic,
  IndianRupee,
  ShoppingBag,
} from "lucide-react";

export type AppScreen =
  | "splash"
  | "auth"
  | "dashboard"
  | "inventory"
  | "orders"
  | "account"
  | "buyer_home"
  | "sell_onboarding"
  | "sell_studio"
  | "sell_voice"
  | "sell_pricing"
  | "sell_publish"
  | "admin_market_data";

export default function App() {
  // Navigation & User State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [user, setUser] = useState<ArtisanUser | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("hi");

  // Catalog & Inventory Data
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(INITIAL_CATALOG_ITEMS);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(RECENT_ORDERS);

  // Active Flow Item Data (Step 1 to 5) - Initial photo state is empty/null
  const [selectedCraft, setSelectedCraft] = useState<CraftCategory | null>(CRAFT_CATEGORIES[0]);
  const [rawImage, setRawImage] = useState<string>("");
  const [studioImage, setStudioImage] = useState<string>("");
  const [catalogData, setCatalogData] = useState<CatalogItem | null>(INITIAL_CATALOG_ITEMS[0]);

  // UI Inspector & View controls
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isFullView, setIsFullView] = useState<boolean>(false);

  // Check for developer/admin route via URL query: ?admin=market_data or hash: #/admin/market-data
  useEffect(() => {
    const handleRouteCheck = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (
          params.get("admin") === "market_data" ||
          params.get("view") === "admin_market_data" ||
          hash === "#/admin/market-data" ||
          hash === "#admin_market_data"
        ) {
          setCurrentScreen("admin_market_data");
        } else if (
          params.get("view") === "buyer" ||
          params.get("view") === "buyer_home" ||
          hash === "#/buyer" ||
          hash === "#buyer"
        ) {
          setCurrentScreen("buyer_home");
        }
      } catch (e) {
        // Safe fallback in non-browser environments
      }
    };

    handleRouteCheck();
    window.addEventListener("popstate", handleRouteCheck);
    window.addEventListener("hashchange", handleRouteCheck);
    return () => {
      window.removeEventListener("popstate", handleRouteCheck);
      window.removeEventListener("hashchange", handleRouteCheck);
    };
  }, []);

  // Splash -> Auth or Dashboard
  const handleSplashFinish = () => {
    if (user) {
      setCurrentScreen("dashboard");
    } else {
      setCurrentScreen("auth");
    }
  };

  // Auth -> Dashboard
  const handleLogin = (loggedUser: ArtisanUser) => {
    setUser(loggedUser);
    setCurrentScreen("dashboard");
  };

  // Logout -> Auth
  const handleLogout = () => {
    setUser(null);
    setCurrentScreen("auth");
  };

  // Start "Sell" / "Add Item" flow
  const handleStartSellFlow = () => {
    const defaultCraft = CRAFT_CATEGORIES[0];
    setSelectedCraft(defaultCraft);
    setRawImage("");
    setStudioImage("");
    setCurrentScreen("sell_onboarding");
  };

  // Direct select and view item from dashboard/inventory
  const handleSelectItem = (item: CatalogItem) => {
    setCatalogData(item);
    setRawImage(item.originalImage);
    setStudioImage(item.studioImage);
    const matchedCraft = CRAFT_CATEGORIES.find((c) => c.id === item.category) || CRAFT_CATEGORIES[0];
    setSelectedCraft(matchedCraft);
    setCurrentScreen("sell_publish");
  };

  // Step 1 (Onboarding) -> Step 2 (Image Studio)
  const handleProceedFromOnboarding = () => {
    if (selectedCraft) {
      setRawImage("");
      setStudioImage("");
      setCurrentScreen("sell_studio");
    }
  };

  // Step 2 (Image Studio) -> Step 3 (Voice Catalog)
  const handleImageReady = (raw: string, studio: string) => {
    setRawImage(raw);
    setStudioImage(studio);
    setCurrentScreen("sell_voice");
  };

  // Step 3 (Voice Catalog) -> Step 4 (Pricing)
  const handleCatalogReady = (catalog: CatalogItem) => {
    setCatalogData(catalog);
    setCurrentScreen("sell_pricing");
  };

  // Step 4 (Pricing) -> Step 5 (Publish)
  const handlePriceSelected = (updatedCatalog: CatalogItem) => {
    setCatalogData(updatedCatalog);
    // Add or update in catalog items list
    setCatalogItems((prev) => [updatedCatalog, ...prev.filter((i) => i.id !== updatedCatalog.id)]);
    setCurrentScreen("sell_publish");
  };

  // Step 5 (Publish complete) -> Dashboard
  const handlePublishDone = () => {
    setCurrentScreen("dashboard");
  };

  // Sell Flow Step Indicator Mapping
  const sellSteps = [
    { id: "sell_onboarding", num: 1, nameHi: "कला चयन", nameEn: "Craft", icon: Flame },
    { id: "sell_studio", num: 2, nameHi: "स्टूडियो फोटो", nameEn: "Studio", icon: Camera },
    { id: "sell_voice", num: 3, nameHi: "आवाज विवरण", nameEn: "Voice AI", icon: Mic },
    { id: "sell_pricing", num: 4, nameHi: "मूल्य निर्धारण", nameEn: "Pricing", icon: IndianRupee },
    { id: "sell_publish", num: 5, nameHi: "ई-मार्केट", nameEn: "Publish", icon: ShoppingBag },
  ];

  const isSellFlow = currentScreen.startsWith("sell_");
  const currentSellStepNum = sellSteps.find((s) => s.id === currentScreen)?.num || 1;

  const isBuyer = currentScreen === "buyer_home";
  const isSplash = currentScreen === "splash";
  const isSeller =
    currentScreen === "dashboard" ||
    currentScreen === "inventory" ||
    currentScreen === "orders" ||
    currentScreen === "account" ||
    currentScreen.startsWith("sell_");

  return (
    <AppShell theme={isBuyer ? "buyer" : isSplash ? "dark" : "seller"}>
      <AnimatePresence mode="wait">
        {/* 1. Splash Screen */}
        {currentScreen === "splash" && (
          <motion.div
            key="screen-splash"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            <SplashScreen language={language} onFinish={handleSplashFinish} />
          </motion.div>
        )}

        {/* 2. Authentication Screen */}
        {currentScreen === "auth" && (
          <motion.div
            key="screen-auth"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto"
          >
            <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:border sm:border-kk-line sm:shadow-lg overflow-hidden flex flex-col bg-kk-surface text-kk-ink">
              <AuthScreen
                language={language}
                onLoginSuccess={handleLogin}
                onCustomerLogin={() => setCurrentScreen("buyer_home")}
                onLanguageChange={(lang) => setLanguage(lang)}
              />
            </div>
          </motion.div>
        )}

        {/* 3. Customer Marketplace Screen */}
        {currentScreen === "buyer_home" && (
          <motion.div
            key="screen-buyer-home"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col"
          >
            <BuyerMarketplaceScreen
              catalogItems={catalogItems}
              language={language}
              onLanguageChange={(lang) => setLanguage(lang)}
              onSwitchToSeller={() => setCurrentScreen("dashboard")}
              onLogout={() => setCurrentScreen("auth")}
              onOpenAdminMarketData={() => setCurrentScreen("admin_market_data")}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
            />
          </motion.div>
        )}

        {/* 4. Seller Workspace Screen */}
        {isSeller && (
          <motion.div
            key="screen-seller-workspace"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col"
          >
            <SellerWorkspace
              currentScreen={currentScreen}
              user={user}
              language={language}
              catalogItems={catalogItems}
              recentOrders={recentOrders}
              onNavigate={(screen) => setCurrentScreen(screen)}
              onLanguageChange={(lang) => setLanguage(lang)}
              onLogout={handleLogout}
              onNavigateBuyer={() => setCurrentScreen("buyer_home")}
              onOpenAdminMarketData={() => setCurrentScreen("admin_market_data")}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
              onStartSell={handleStartSellFlow}
              onSelectItem={handleSelectItem}
              onUpdateStock={(id, newStock) => {
                setCatalogItems((prev) =>
                  prev.map((it) => (it.id === id ? { ...it, stockCount: newStock } : it))
                );
              }}
              selectedCraft={selectedCraft}
              onSelectCraft={(craft) => setSelectedCraft(craft)}
              rawImage={rawImage}
              studioImage={studioImage}
              catalogData={catalogData}
              onProceedFromOnboarding={handleProceedFromOnboarding}
              onImageReady={handleImageReady}
              onCatalogReady={handleCatalogReady}
              onPriceSelected={handlePriceSelected}
              onPublishDone={handlePublishDone}
              sellSteps={sellSteps}
              currentSellStepNum={currentSellStepNum}
            />
          </motion.div>
        )}

        {/* 5. Market Price Admin View */}
        {currentScreen === "admin_market_data" && (
          <motion.div
            key="screen-admin-market-data"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden bg-slate-950 text-white overscroll-contain"
          >
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col min-h-0">
              <MarketDataAdminScreen
                onBack={() => setCurrentScreen(user ? "dashboard" : "buyer_home")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jetpack Compose Native Architecture Modal */}
      <CodeInspectorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </AppShell>
  );
}

