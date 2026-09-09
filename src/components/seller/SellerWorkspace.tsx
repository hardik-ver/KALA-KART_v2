import React, { useState } from "react";
import {
  CraftCategory,
  LanguageCode,
  CatalogItem,
  ArtisanUser,
  RecentOrder,
} from "../../types/artisan";
import { SellerDashboardScreen } from "../screens/SellerDashboardScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { SellerOrdersScreen } from "../screens/SellerOrdersScreen";
import { SellerAccountScreen } from "../screens/SellerAccountScreen";
import { SellerBottomNav } from "./SellerBottomNav";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ImageStudioScreen } from "../screens/ImageStudioScreen";
import { VoiceCatalogScreen } from "../screens/VoiceCatalogScreen";
import { PricingAssistantScreen } from "../screens/PricingAssistantScreen";
import { MarketplaceListingScreen } from "../screens/MarketplaceListingScreen";
import { KalaKartLogo } from "../common/KalaKartLogo";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  User,
  PlusCircle,
  ShoppingBag,
  Database,
  Code2,
  LogOut,
  ChevronDown,
  Settings,
  MoreVertical,
  X,
  Sun,
  Moon,
} from "lucide-react";
import type { AppScreen } from "../../App";
import { useTheme } from "../../context/ThemeContext";

interface SellStepInfo {
  id: string;
  num: number;
  nameHi: string;
  nameEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SellerWorkspaceProps {
  currentScreen: AppScreen;
  user: ArtisanUser | null;
  language: LanguageCode;
  catalogItems: CatalogItem[];
  recentOrders: RecentOrder[];
  onNavigate: (screen: AppScreen) => void;
  onLanguageChange: (lang: LanguageCode) => void;
  onLogout: () => void;
  onNavigateBuyer: () => void;
  onOpenAdminMarketData: () => void;
  onOpenCodeModal: () => void;
  onStartSell: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onUpdateStock: (id: string, newStock: number) => void;

  // Sell Flow Props
  selectedCraft: CraftCategory | null;
  onSelectCraft: (craft: CraftCategory) => void;
  rawImage: string;
  studioImage: string;
  catalogData: CatalogItem | null;
  onProceedFromOnboarding: () => void;
  onImageReady: (raw: string, studio: string) => void;
  onCatalogReady: (catalog: CatalogItem) => void;
  onPriceSelected: (catalog: CatalogItem) => void;
  onPublishDone: () => void;
  sellSteps: SellStepInfo[];
  currentSellStepNum: number;
}

export const SellerWorkspace: React.FC<SellerWorkspaceProps> = ({
  currentScreen,
  user,
  language,
  catalogItems,
  recentOrders,
  onNavigate,
  onLanguageChange,
  onLogout,
  onNavigateBuyer,
  onOpenAdminMarketData,
  onOpenCodeModal,
  onStartSell,
  onSelectItem,
  onUpdateStock,
  selectedCraft,
  onSelectCraft,
  rawImage,
  studioImage,
  catalogData,
  onProceedFromOnboarding,
  onImageReady,
  onCatalogReady,
  onPriceSelected,
  onPublishDone,
  sellSteps,
  currentSellStepNum,
}) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const isSellFlow = currentScreen.startsWith("sell_");

  return (
    <div className="flex flex-col w-full h-full bg-kk-surface text-kk-ink overflow-hidden select-none">
      {/* 1. Desktop Seller Header (hidden on mobile to preserve mobile native app feel) */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-kk-line shadow-2xs z-30 shrink-0">
        <div className="flex items-center gap-3">
          <KalaKartLogo
            size="sm"
            className="w-8 h-8 rounded-xl shadow-2xs border border-kk-line bg-kk-surface p-0.5"
            alt="Kala-Kart Logo"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-kk-ink tracking-tight">
                कला-कार्ट (Kala-Kart)
              </span>
              <span className="bg-kk-primary-soft text-kk-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full border border-kk-primary/30 uppercase">
                Artisan OS
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              {language === "hi"
                ? "शिल्पकार एवं बुनकर कार्यक्षेत्र"
                : "Artisan & Weaver Workspace"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-kk-line text-xs font-semibold">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === "dashboard"
                ? "bg-kk-primary text-white shadow-2xs"
                : "text-stone-600 hover:text-kk-ink"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "डैशबोर्ड" : "Dashboard"}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("inventory")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === "inventory"
                ? "bg-kk-primary text-white shadow-2xs"
                : "text-stone-600 hover:text-kk-ink"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "इन्वेंट्री" : "Inventory"}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentScreen === "inventory"
                  ? "bg-white/25 text-white"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {catalogItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("orders")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === "orders"
                ? "bg-kk-primary text-white shadow-2xs"
                : "text-stone-600 hover:text-kk-ink"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "ऑर्डर" : "Orders"}</span>
            {recentOrders.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentScreen === "orders"
                    ? "bg-white/25 text-white"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {recentOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate("account")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === "account"
                ? "bg-kk-primary text-white shadow-2xs"
                : "text-stone-600 hover:text-kk-ink"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "खाता" : "Account"}</span>
          </button>

          <button
            type="button"
            onClick={onStartSell}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isSellFlow
                ? "bg-kk-primary text-white shadow-2xs"
                : "text-stone-600 hover:text-kk-ink"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "+ नया शिल्प जोड़ें" : "+ Add Craft"}</span>
          </button>
        </nav>

        {/* Right Desktop Controls: Buyer Store, Language, Settings/Admin */}
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={onNavigateBuyer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kk-primary-soft hover:bg-kk-primary/20 text-kk-primary-dark rounded-xl text-xs font-bold border border-kk-primary/30 transition-colors shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "ग्राहक स्टोर देखें" : "Buyer Store"}</span>
          </button>

          {/* Language Switch */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-kk-line">
            <button
              type="button"
              onClick={() => onLanguageChange("hi")}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                language === "hi"
                  ? "bg-kk-primary text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                language === "en"
                  ? "bg-kk-primary text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              EN
            </button>
          </div>

          {/* Settings & Admin Menu Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors border border-kk-line"
              aria-label="Settings and Developer Tools"
              title="Settings & Admin"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showAdminMenu && (
              <div
                className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-kk-line shadow-xl p-3 space-y-2 z-50 animate-in fade-in duration-150"
                role="dialog"
                aria-label="Seller Settings and Admin"
              >
                <div className="flex items-center justify-between pb-2 border-b border-kk-line/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-kk-primary-soft text-kk-primary-dark flex items-center justify-center font-bold text-xs">
                      ⚙️
                    </div>
                    <div>
                      <p className="text-xs font-bold text-kk-ink">
                        {language === "hi" ? "व्यवस्थापक उपकरण" : "Settings & Admin"}
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium">
                        {user?.name || "Artisan Portal"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminMenu(false)}
                    className="text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminMenu(false);
                      onOpenAdminMarketData();
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center gap-2 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {language === "hi"
                        ? "मार्केट प्राइस एडमिन (ONDC डेटा)"
                        : "Market Price Admin (ONDC)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminMenu(false);
                      onOpenCodeModal();
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center gap-2 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      {language === "hi"
                        ? "कोटलिन और कंपोज़ आर्किटेक्चर"
                        : "Kotlin & Compose Architecture"}
                    </span>
                  </button>

                  {/* Theme / Appearance Switch inside Admin Menu */}
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <div className="flex items-center gap-1.5">
                        {theme === "dark" ? (
                          <Moon className="w-3.5 h-3.5 text-kk-primary" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-kk-primary" />
                        )}
                        <span className="text-[11px] font-bold text-stone-600">
                          {language === "hi" ? "थीम (Theme)" : "Appearance"}
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

                  <div className="pt-2 border-t border-kk-line/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === "hi" ? "लॉगआउट करें" : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Workspace Viewport Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
        {/* Step Progress Stepper (Only active during Sell Flow) */}
        {isSellFlow && (
          <div className="w-full max-w-3xl mx-auto px-4 pt-3 pb-1 shrink-0">
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-kk-line shadow-2xs">
              {sellSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentSellStepNum > step.num;
                const isCurrent = currentSellStepNum === step.num;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (step.num <= currentSellStepNum || catalogData) {
                          onNavigate(step.id as AppScreen);
                        }
                      }}
                      className={`flex flex-col items-center gap-0.5 group transition-all ${
                        isCurrent
                          ? "scale-105"
                          : isCompleted
                          ? "opacity-90 hover:opacity-100"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? "bg-kk-primary text-white ring-4 ring-kk-primary-soft shadow-kk-ink/15"
                            : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-100 text-stone-500 border border-kk-line"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold ${
                          isCurrent
                            ? "text-kk-primary"
                            : isCompleted
                            ? "text-emerald-700"
                            : "text-stone-400"
                        }`}
                      >
                        {language === "hi" ? step.nameHi : step.nameEn}
                      </span>
                    </button>

                    {idx < sellSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 transition-all ${
                          currentSellStepNum > step.num ? "bg-emerald-500" : "bg-kk-line"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Screen Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Main Dashboard Screen */}
          {currentScreen === "dashboard" && (
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col flex-1">
              <SellerDashboardScreen
                user={user}
                language={language}
                catalogItems={catalogItems}
                recentOrders={recentOrders}
                onStartSell={onStartSell}
                onViewInventory={() => onNavigate("inventory")}
                onNavigateBuyer={onNavigateBuyer}
                onSelectItem={onSelectItem}
                onLanguageChange={onLanguageChange}
                onLogout={onLogout}
                onOpenAdminMarketData={onOpenAdminMarketData}
                onOpenCodeModal={onOpenCodeModal}
              />
            </div>
          )}

          {/* Full Inventory Screen */}
          {currentScreen === "inventory" && (
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col flex-1">
              <InventoryScreen
                items={catalogItems}
                language={language}
                onBack={() => onNavigate("dashboard")}
                onAddNew={onStartSell}
                onUpdateStock={onUpdateStock}
              />
            </div>
          )}

          {/* Orders Screen */}
          {currentScreen === "orders" && (
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col flex-1">
              <SellerOrdersScreen
                orders={recentOrders}
                language={language}
                onBack={() => onNavigate("dashboard")}
                onAddNewCraft={onStartSell}
              />
            </div>
          )}

          {/* Account Screen */}
          {currentScreen === "account" && (
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col flex-1">
              <SellerAccountScreen
                user={user}
                language={language}
                catalogItems={catalogItems}
                recentOrders={recentOrders}
                onLanguageChange={onLanguageChange}
                onLogout={onLogout}
                onNavigateBuyer={onNavigateBuyer}
                onOpenAdminMarketData={onOpenAdminMarketData}
                onOpenCodeModal={onOpenCodeModal}
                onBack={() => onNavigate("dashboard")}
              />
            </div>
          )}

          {/* Sell Flow Step 1: Craft Selection */}
          {currentScreen === "sell_onboarding" && (
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col flex-1">
              <OnboardingScreen
                selectedCraft={selectedCraft}
                onSelectCraft={onSelectCraft}
                language={language}
                onLanguageChange={onLanguageChange}
                onProceed={onProceedFromOnboarding}
                onBack={() => onNavigate("dashboard")}
              />
            </div>
          )}

          {/* Sell Flow Step 2: AI Image Studio */}
          {currentScreen === "sell_studio" && selectedCraft && (
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col flex-1">
              <ImageStudioScreen
                selectedCraft={selectedCraft}
                initialRawImage={rawImage || null}
                initialStudioImage={studioImage || null}
                language={language}
                onImageReady={onImageReady}
                onBack={() => onNavigate("sell_onboarding")}
              />
            </div>
          )}

          {/* Sell Flow Step 3: Voice Catalog AI */}
          {currentScreen === "sell_voice" && selectedCraft && (
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col flex-1">
              <VoiceCatalogScreen
                selectedCraft={selectedCraft}
                studioImage={studioImage}
                language={language}
                catalogData={catalogData}
                onCatalogReady={onCatalogReady}
                onBack={() => onNavigate("sell_studio")}
              />
            </div>
          )}

          {/* Sell Flow Step 4: Smart Fair Pricing */}
          {currentScreen === "sell_pricing" && catalogData && (
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col flex-1">
              <PricingAssistantScreen
                catalog={catalogData}
                language={language}
                onPriceSelected={onPriceSelected}
                onBack={() => onNavigate("sell_voice")}
              />
            </div>
          )}

          {/* Sell Flow Step 5: Publish & Syndication */}
          {currentScreen === "sell_publish" && catalogData && (
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col flex-1">
              <MarketplaceListingScreen
                catalog={catalogData}
                language={language}
                onReset={onPublishDone}
                onBack={() => onNavigate("sell_pricing")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Native Mobile Bottom Navigation Bar (Home, Inventory, Orders, Account) */}
      {!isSellFlow && (
        <SellerBottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          language={language}
          inventoryCount={catalogItems.length}
          ordersCount={recentOrders.length}
        />
      )}
    </div>
  );
};
