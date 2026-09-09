import React from "react";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  ShoppingBag,
  Database,
  Code2,
  LogOut,
  MapPin,
  Phone,
  Award,
  Globe,
  ChevronRight,
  Boxes,
  IndianRupee,
  Sun,
  Moon,
} from "lucide-react";
import { ArtisanUser, CatalogItem, RecentOrder, LanguageCode } from "../../types/artisan";
import { TTSButton } from "../common/TTSButton";
import { useTheme } from "../../context/ThemeContext";

interface SellerAccountScreenProps {
  user: ArtisanUser | null;
  language: LanguageCode;
  catalogItems: CatalogItem[];
  recentOrders: RecentOrder[];
  onLanguageChange: (lang: LanguageCode) => void;
  onLogout: () => void;
  onNavigateBuyer: () => void;
  onOpenAdminMarketData: () => void;
  onOpenCodeModal: () => void;
  onBack?: () => void;
}

export const SellerAccountScreen: React.FC<SellerAccountScreenProps> = ({
  user,
  language,
  catalogItems,
  recentOrders,
  onLanguageChange,
  onLogout,
  onNavigateBuyer,
  onOpenAdminMarketData,
  onOpenCodeModal,
  onBack,
}) => {
  const { theme, setTheme } = useTheme();
  const totalRevenue = recentOrders.reduce((acc, ord) => acc + ord.amount, 0);

  return (
    <div className="flex flex-col h-full bg-kk-surface text-kk-ink p-4 sm:p-5 overflow-y-auto font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-kk-line shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-kk-ink tracking-tight">
              {language === "hi" ? "शिल्पकार खाता व सेटिंग्स" : "Artisan Profile & Settings"}
            </h2>
            <span className="text-[10px] text-stone-500 font-semibold uppercase">
              Kala-Kart Artisan OS
            </span>
          </div>
        </div>

        <TTSButton
          text={
            language === "hi"
              ? "आपकी शिल्पकार प्रोफाइल, भाषा और सेटिंग्स।"
              : "Your artisan profile, language preferences, and settings."
          }
          lang={language}
          size="sm"
          variant="iconOnly"
        />
      </div>

      {/* Main Content with bottom padding for mobile navbar */}
      <div className="mt-3.5 space-y-3.5 flex-1 pb-28 md:pb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-kk-line p-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-kk-primary to-kk-primary-soft text-white flex items-center justify-center font-black text-xl shadow-xs border border-kk-line">
                {user?.name ? user.name[0] : "श"}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-extrabold text-kk-ink truncate">
                  {user?.name || "श्री राम प्रसाद"}
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-700" />
                  <span>शिल्प गुरु (Master Craftsman)</span>
                </span>
              </div>

              <p className="text-xs text-stone-600 font-medium mt-1 truncate">
                {user?.craftSpecialty || "पारंपरिक टेराकोटा एवं मृत्तिका शिल्प"}
              </p>

              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-stone-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {user?.location || "गोरखपुर, उत्तर प्रदेश"}
                </span>
                <span className="flex items-center gap-1 font-mono text-stone-400">
                  <Phone className="w-3 h-3 text-stone-400" />
                  +91 98765 43210
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-kk-line/70">
            <div className="text-center">
              <span className="text-[10px] font-semibold text-stone-500 block uppercase">
                {language === "hi" ? "सक्रिय उत्पाद" : "Listed Crafts"}
              </span>
              <span className="text-sm font-black text-kk-ink mt-0.5 block">
                {catalogItems.length}
              </span>
            </div>
            <div className="text-center border-x border-kk-line/70">
              <span className="text-[10px] font-semibold text-stone-500 block uppercase">
                {language === "hi" ? "कुल ऑर्डर" : "Orders"}
              </span>
              <span className="text-sm font-black text-kk-ink mt-0.5 block">
                {recentOrders.length}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-semibold text-stone-500 block uppercase">
                {language === "hi" ? "कुल बिक्री" : "Revenue"}
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5 block truncate">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences Section: Language */}
        <div className="bg-white rounded-2xl border border-kk-line p-3.5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {language === "hi" ? "प्राथमिकताएं" : "Preferences"}
          </span>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-stone-500" />
              <div>
                <span className="text-xs font-bold text-kk-ink block">
                  {language === "hi" ? "ऐप भाषा (Language)" : "App Language"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {language === "hi" ? "हिंदी या अंग्रेजी चुनें" : "Choose Hindi or English"}
                </span>
              </div>
            </div>

            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-kk-line">
              <button
                type="button"
                onClick={() => onLanguageChange("hi")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
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
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === "en"
                    ? "bg-kk-primary text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-kk-primary" />
              ) : (
                <Sun className="w-4 h-4 text-kk-primary" />
              )}
              <div>
                <span className="text-xs font-bold text-kk-ink block">
                  {language === "hi" ? "ऐप दिखावट (Theme)" : "App Appearance"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {language === "hi" ? "लाइट या डार्क मोड चुनें" : "Choose Light or Dark Mode"}
                </span>
              </div>
            </div>

            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-kk-line">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  theme === "light"
                    ? "bg-kk-primary text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                aria-label="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "लाइट" : "Light"}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  theme === "dark"
                    ? "bg-kk-primary text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                aria-label="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "डार्क" : "Dark"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links & Developer Tools */}
        <div className="bg-white rounded-2xl border border-kk-line p-3.5 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
            {language === "hi" ? "उपकरण एवं मॉड्यूल" : "Tools & Modules"}
          </span>

          <button
            type="button"
            onClick={onNavigateBuyer}
            className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between transition-colors border border-transparent hover:border-stone-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-kk-primary-soft text-kk-primary-dark flex items-center justify-center font-bold text-xs">
                <ShoppingBag className="w-4 h-4 text-kk-primary" />
              </div>
              <div>
                <span className="text-xs font-bold text-kk-ink block">
                  {language === "hi" ? "ग्राहक स्टोर देखें (Buyer Store)" : "Switch to Buyer Store"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {language === "hi" ? "कला-कार्ट ग्राहक मार्केटप्लेस देखें" : "Preview the marketplace from a buyer's view"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={onOpenAdminMarketData}
            className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between transition-colors border border-transparent hover:border-stone-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                <Database className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-kk-ink block">
                  {language === "hi" ? "मार्केट प्राइस एडमिन (ONDC)" : "Market Price Admin (ONDC)"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {language === "hi" ? "ONDC लाइव बेंचमार्क व डेटा" : "Inspect benchmark observations & ML model"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={onOpenCodeModal}
            className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between transition-colors border border-transparent hover:border-stone-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                <Code2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-kk-ink block">
                  {language === "hi" ? "कोटलिन व कंपोज़ आर्किटेक्चर" : "Kotlin & Compose Architecture"}
                </span>
                <span className="text-[10px] text-stone-500">
                  {language === "hi" ? "नेटिव एंड्रॉइड मॉडल व कोड देखें" : "View native mobile Android code"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Sign Out Card */}
        <div className="bg-white rounded-2xl border border-kk-line p-3.5 shadow-xs">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === "hi" ? "लॉगआउट / बाहर निकलें" : "Sign Out / Switch User"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
