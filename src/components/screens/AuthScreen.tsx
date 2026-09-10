import React, { useState } from "react";
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Users, 
  User, 
  CheckCircle2, 
  KeyRound, 
  RotateCcw, 
  ShoppingBag,
  Languages,
  Globe,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LanguageCode, ArtisanUser, SellerRole } from "../../types/artisan";
import { DEFAULT_USER } from "../../data/sampleCrafts";
import { TTSButton } from "../common/TTSButton";
import { KalaKartLogo } from "../common/KalaKartLogo";
import { playTextToSpeech, soundEffects } from "../../utils/speechUtils";
import { useTheme } from "../../context/ThemeContext";

interface AuthScreenProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onLoginSuccess: (user: ArtisanUser) => void;
  onCustomerLogin?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess,
  onCustomerLogin,
}) => {
  const { theme, setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("9876543210");
  const [otpCode, setOtpCode] = useState<string>("4826");
  const [selectedRole, setSelectedRole] = useState<SellerRole>("individual");
  const [artisanName, setArtisanName] = useState<string>("Rameshwar Sharma");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleProceedToStep2 = () => {
    soundEffects.playMicStart();
    setErrorMsg("");
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    soundEffects.playMicStart();
    setErrorMsg("");
    setCurrentStep(1);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg(language === "hi" ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    soundEffects.playMicStart();

    setTimeout(() => {
      setIsLoading(false);
      setAuthStep("otp");
      const msg = language === "hi" 
        ? "ओटीपी कोड 4 8 2 6 आपके फोन पर भेजा गया है।" 
        : "OTP code 4826 sent to your phone.";
      playTextToSpeech(msg, language);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg(language === "hi" ? "कृपया 4 अंकों का OTP कोड दर्ज करें" : "Please enter the 4-digit OTP code");
      return;
    }
    setIsLoading(true);
    soundEffects.playCelebration();

    setTimeout(() => {
      setIsLoading(false);
      const user: ArtisanUser = {
        ...DEFAULT_USER,
        name: artisanName || DEFAULT_USER.name,
        phone: `+91 ${phoneNumber}`,
        role: selectedRole,
        roleTitle: selectedRole === "individual" ? "Master Artisan (Shilp Guru)" : "Varanasi Weaver Co-operative",
        roleTitleHi: selectedRole === "individual" ? "मास्टर शिल्पकार (शिल्प गुरु)" : "बुनकर सहकारी समिति",
      };
      onLoginSuccess(user);
    }, 700);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    soundEffects.playCelebration();
    setTimeout(() => {
      setIsLoading(false);
      const user: ArtisanUser = {
        ...DEFAULT_USER,
        name: artisanName || DEFAULT_USER.name,
        role: selectedRole,
        roleTitle: selectedRole === "individual" ? "Master Artisan (Shilp Guru)" : "Varanasi Weaver Co-operative",
        roleTitleHi: selectedRole === "individual" ? "मास्टर शिल्पकार (शिल्प गुरु)" : "बुनकर सहकारी समिति",
      };
      onLoginSuccess(user);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-kk-surface text-kk-ink p-4 sm:p-6 overflow-y-auto font-sans">
      <AnimatePresence mode="wait" initial={false}>
        {currentStep === 1 ? (
          /* =======================================================
             SCREEN 1 — ROLE & LANGUAGE SELECTION
             ======================================================= */
          <motion.div
            key="screen-1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Top Header Bar: Kala-Kart Branding + Light/Dark Theme Switch + TTS Audio Guide */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-kk-line dark:border-[#3D332C]">
                <div className="flex items-center gap-2">
                  <KalaKartLogo
                    size="sm"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xs border border-stone-200 dark:border-[#3D332C] bg-white dark:bg-[#1E1815] p-0.5 shrink-0"
                    alt="Kala-Kart Logo"
                  />
                  <div className="flex flex-col justify-center leading-tight">
                    <h1 className="text-sm font-extrabold text-onboarding-title text-[#181210] dark:text-[#FFFFFF] tracking-tight leading-tight">
                      Kala-Kart
                    </h1>
                    <span className="text-[10px] text-stone-600 dark:text-[#877C73] font-bold uppercase tracking-wider leading-tight">
                      {language === "hi" ? "शिल्पकार लॉगिन" : "Artisan Login"}
                    </span>
                  </div>
                </div>

                {/* Theme Toggle & TTS Guide */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Compact Segmented Light / Dark Toggle */}
                  <div className="flex items-center bg-stone-100 dark:bg-[#1E1815] p-0.5 rounded-lg border border-stone-200 dark:border-[#382E28] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`px-2 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        theme === "light"
                          ? "bg-white text-stone-900 shadow-2xs"
                          : "text-stone-500 dark:text-[#877C73] hover:text-stone-800 dark:hover:text-[#F6EFEA]"
                      }`}
                      aria-label="Light Mode"
                    >
                      <Sun className={`w-3.5 h-3.5 ${theme === "light" ? "text-amber-600" : "text-stone-400 dark:text-[#877C73]"}`} />
                      <span className="text-[11px] font-bold">{language === "hi" ? "लाइट" : "Light"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`px-2 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#352C27] text-[#F6EFEA] border border-[#4D3F37] shadow-none"
                          : "text-stone-500 dark:text-[#877C73] hover:text-stone-800 dark:hover:text-[#F6EFEA]"
                      }`}
                      aria-label="Dark Mode"
                    >
                      <Moon className={`w-3.5 h-3.5 ${theme === "dark" ? "text-kk-primary" : "text-stone-400 dark:text-[#877C73]"}`} />
                      <span className="text-[11px] font-bold">{language === "hi" ? "डार्क" : "Dark"}</span>
                    </button>
                  </div>

                  {/* Sound / TTS Guide Button */}
                  <TTSButton
                    text={
                      language === "hi"
                        ? "कला-कार्ट में आपका स्वागत है। अपनी भाषा और श्रेणी चुनें, फिर आगे बढ़ें।"
                        : "Welcome to Kala-Kart. Select your language and seller category, then tap proceed."
                    }
                    lang={language}
                    size="sm"
                    variant="iconOnly"
                  />
                </div>
              </div>

              {/* Welcome to Kala-Kart Typography */}
              <div className="pt-0.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-onboarding-title text-[#181210] dark:text-[#FFFFFF] tracking-tight">
                  {language === "hi" ? "कला-कार्ट में आपका स्वागत है" : "Welcome to Kala-Kart"}
                </h2>
                <p className="text-xs text-stone-600 dark:text-[#877C73] mt-1 font-semibold">
                  {language === "hi"
                    ? "भारत के प्रामाणिक शिल्पकारों और हथकरघा बुनकरों का डिजिटल मंच"
                    : "Empowering India's authentic master artisans & weavers"}
                </p>
              </div>

              {/* Language Selection: Same visual treatment as Seller / Customer Selector */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-[#B3A79E] block mb-1.5">
                  {language === "hi" ? "भाषा चुनें • Select Language" : "Select Language • भाषा"}
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-stone-100/90 dark:bg-[#1E1815] rounded-xl border border-stone-200 dark:border-[#382E28] text-sm font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onLanguageChange("hi")}
                    className={`py-2.5 sm:py-3 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      language === "hi"
                        ? "bg-white dark:bg-[#352C27] text-stone-900 dark:text-[#F6EFEA] shadow-xs dark:shadow-none dark:border dark:border-[#4D3F37] font-extrabold"
                        : "text-stone-700 dark:text-[#B3A79E] hover:text-stone-900 dark:hover:text-[#F6EFEA] hover:bg-white/80 dark:hover:bg-[#28201C] font-semibold"
                    }`}
                  >
                    <Languages className={`w-4 h-4 ${language === "hi" ? "text-kk-primary" : "text-stone-500 dark:text-[#877C73]"}`} />
                    <span className="truncate font-bold">हिंदी (Hindi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange("en")}
                    className={`py-2.5 sm:py-3 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      language === "en"
                        ? "bg-white dark:bg-[#352C27] text-stone-900 dark:text-[#F6EFEA] shadow-xs dark:shadow-none dark:border dark:border-[#4D3F37] font-extrabold"
                        : "text-stone-700 dark:text-[#B3A79E] hover:text-stone-900 dark:hover:text-[#F6EFEA] hover:bg-white/80 dark:hover:bg-[#28201C] font-semibold"
                    }`}
                  >
                    <Globe className={`w-4 h-4 ${language === "en" ? "text-kk-primary" : "text-stone-500 dark:text-[#877C73]"}`} />
                    <span className="truncate font-bold">English</span>
                  </button>
                </div>
              </div>

              {/* Enlarged Seller / Customer Selector */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-[#B3A79E] block mb-1.5">
                  {language === "hi" ? "खाते का प्रकार" : "Account Type"}
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-stone-100/90 dark:bg-[#1E1815] rounded-xl border border-stone-200 dark:border-[#382E28] text-sm sm:text-base font-bold shadow-2xs">
                  <button
                    type="button"
                    className="py-3 sm:py-3.5 px-3 rounded-lg bg-white dark:bg-[#352C27] text-stone-900 dark:text-[#F6EFEA] shadow-xs dark:shadow-none dark:border dark:border-[#4D3F37] flex items-center justify-center gap-2.5 transition-all cursor-default font-extrabold"
                  >
                    <User className="w-4.5 h-4.5 text-kk-primary shrink-0" />
                    <span className="truncate">{language === "hi" ? "विक्रेता (Seller)" : "Seller"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCustomerLogin}
                    className="py-3 sm:py-3.5 px-3 rounded-lg text-stone-700 dark:text-[#B3A79E] hover:text-stone-900 dark:hover:text-[#F6EFEA] hover:bg-white/80 dark:hover:bg-[#28201C] transition-all flex items-center justify-center gap-2.5 group cursor-pointer active:scale-98 font-semibold"
                  >
                    <ShoppingBag className="w-4.5 h-4.5 text-stone-500 dark:text-[#877C73] group-hover:text-kk-primary transition-colors shrink-0" />
                    <span className="truncate">{language === "hi" ? "ग्राहक (Customer)" : "Customer"}</span>
                  </button>
                </div>
              </div>

              {/* Seller Category Selection Cards (Individual Artisan vs Craft Co-operative) */}
              <div className="pt-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-[#B3A79E] block mb-2">
                  {language === "hi" ? "आपकी श्रेणी चुनें (Role)" : "Select Seller Category"}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Individual Artisan */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("individual")}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      selectedRole === "individual"
                        ? "bg-white dark:bg-[#2C231F] border-kk-primary ring-2 ring-kk-primary/20 shadow-xs"
                        : "bg-white/90 dark:bg-[#231D1A] border-stone-300 dark:border-[#3D332C] hover:border-stone-400 dark:hover:border-[#52443B]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-lg ${selectedRole === "individual" ? "bg-kk-primary-soft dark:bg-[#423126] text-kk-primary-dark dark:text-kk-primary" : "bg-stone-100 dark:bg-[#2A221E] text-stone-700 dark:text-[#B3A79E]"}`}>
                        <User className="w-4 h-4" />
                      </div>
                      {selectedRole === "individual" && <CheckCircle2 className="w-4 h-4 text-kk-primary" />}
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-[#F6EFEA] mt-0.5">
                      {language === "hi" ? "व्यक्तिगत शिल्पकार" : "Individual Artisan"}
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-[#877C73] font-semibold leading-tight">
                      {language === "hi" ? "एकल कारीगर / बुनकर" : "Solo craftsman / weaver"}
                    </span>
                  </button>

                  {/* Co-operative / Group */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("cooperative")}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      selectedRole === "cooperative"
                        ? "bg-white dark:bg-[#2C231F] border-kk-primary ring-2 ring-kk-primary/20 shadow-xs"
                        : "bg-white/90 dark:bg-[#231D1A] border-stone-300 dark:border-[#3D332C] hover:border-stone-400 dark:hover:border-[#52443B]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-lg ${selectedRole === "cooperative" ? "bg-kk-primary-soft dark:bg-[#423126] text-kk-primary-dark dark:text-kk-primary" : "bg-stone-100 dark:bg-[#2A221E] text-stone-700 dark:text-[#B3A79E]"}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      {selectedRole === "cooperative" && <CheckCircle2 className="w-4 h-4 text-kk-primary" />}
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-[#F6EFEA] mt-0.5">
                      {language === "hi" ? "बुनकर समूह / समिति" : "Craft Co-operative"}
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-[#877C73] font-semibold leading-tight">
                      {language === "hi" ? "SHG / क्लस्टर समूह" : "SHG / Artisan Cluster"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions of Screen 1: Proceed Button & Compliance Badges */}
            <div className="mt-6 pt-2 space-y-4">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-kk-primary hover:bg-kk-primary-dark text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-kk-primary/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>{language === "hi" ? "आगे बढ़ें • Proceed" : "Proceed"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Bottom Trust & Govt Compliance Badges */}
              <div className="pt-3 border-t border-stone-200 dark:border-[#3D332C] text-center">
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-stone-600 dark:text-[#877C73] font-bold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ONDC Enabled</span>
                  </span>
                  <span>•</span>
                  <span>GeM e-Marketplace</span>
                  <span>•</span>
                  <span>Ministry of Textiles</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =======================================================
             SCREEN 2 — ACCOUNT DETAILS & VERIFICATION
             ======================================================= */
          <motion.div
            key="screen-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Top Header Bar: Back Button, Step Indicator, Theme Toggle & Sound Guide */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-kk-line dark:border-[#3D332C]">
                {/* Back Button with High Contrast in Light & Dark Mode */}
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-stone-800 dark:text-[#F6EFEA] bg-white dark:bg-[#231D1A] hover:bg-stone-100 dark:hover:bg-[#2C2420] border border-stone-300 dark:border-[#382E28] shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-kk-primary-dark dark:text-kk-primary shrink-0" />
                  <span>{language === "hi" ? "वापस" : "Back"}</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[11px] font-bold text-stone-600 dark:text-[#877C73]">
                    {language === "hi" ? "चरण 2/2" : "Step 2 of 2"}
                  </span>
                  {/* Theme toggle icon button */}
                  <div className="flex items-center bg-stone-100 dark:bg-[#1E1815] p-0.5 rounded-lg border border-stone-200 dark:border-[#382E28] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="p-1 rounded-md text-stone-600 dark:text-[#B3A79E] hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                      aria-label="Toggle Theme"
                      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                      {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-600" />}
                    </button>
                  </div>
                  <TTSButton
                    text={
                      language === "hi"
                        ? "अपना नाम और मोबाइल नंबर दर्ज करें, फिर ओटीपी प्राप्त करें।"
                        : "Enter your name and mobile number, then request an OTP to sign in."
                    }
                    lang={language}
                    size="sm"
                    variant="iconOnly"
                  />
                </div>
              </div>

              {/* Heading: Enter your details + Selected Role Badge */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-onboarding-title text-[#181210] dark:text-[#FFFFFF] tracking-tight">
                    {language === "hi" ? "अपना विवरण दर्ज करें" : "Enter your details"}
                  </h2>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-kk-primary-soft dark:bg-[#423126] text-stone-900 dark:text-kk-primary border border-kk-primary/30 shrink-0">
                    {selectedRole === "individual"
                      ? (language === "hi" ? "व्यक्तिगत शिल्पकार" : "Individual")
                      : (language === "hi" ? "समूह / समिति" : "Co-operative")}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-[#877C73] mt-1 font-semibold">
                  {language === "hi"
                    ? "खाता सत्यापन हेतु अपना विवरण और 10 अंकों का मोबाइल नंबर भरें"
                    : "Fill in your profile details and mobile number for verification"}
                </p>
              </div>

              {/* Form Step: Phone & Name vs OTP Verification */}
              {authStep === "phone" ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  {/* Artisan / Group Name Field */}
                  <div>
                    <label className="text-xs font-extrabold text-stone-700 dark:text-[#B3A79E] block mb-1">
                      {language === "hi" ? "आपका नाम / संस्था का नाम" : "Artisan / Group Name"}
                    </label>
                    <input
                      type="text"
                      value={artisanName}
                      onChange={(e) => setArtisanName(e.target.value)}
                      placeholder={language === "hi" ? "उदा. रामेश्वर शर्मा" : "e.g. Rameshwar Sharma"}
                      className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#231D1A] border border-stone-300 dark:border-[#3D332C] text-sm font-bold text-stone-900 dark:text-[#F6EFEA] placeholder:text-stone-400 dark:placeholder:text-[#877C73] focus:outline-none focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20 shadow-xs"
                    />
                  </div>

                  {/* Phone Number Field with +91 country code */}
                  <div>
                    <label className="text-xs font-extrabold text-stone-700 dark:text-[#B3A79E] block mb-1">
                      {language === "hi" ? "मोबाइल नंबर (OTP सत्यापन)" : "Mobile Number (for instant OTP)"}
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-xs font-extrabold text-stone-800 dark:text-[#B3A79E] border-r border-stone-300 dark:border-[#3D332C] pr-2">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="w-full h-12 pl-18 pr-4 rounded-xl bg-white dark:bg-[#231D1A] border border-stone-300 dark:border-[#3D332C] text-base font-bold text-stone-900 dark:text-[#F6EFEA] tracking-wider placeholder:text-stone-400 dark:placeholder:text-[#877C73] focus:outline-none focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20 shadow-xs"
                      />
                      <Phone className="absolute right-3.5 w-4 h-4 text-stone-500 dark:text-[#877C73] pointer-events-none" />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errorMsg}</p>
                  )}

                  {/* Send OTP Primary Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-kk-primary hover:bg-kk-primary-dark text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-kk-primary/25 active:scale-98 transition-all mt-2 cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === "hi" ? "OTP भेजा जा रहा है..." : "Sending OTP..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === "hi" ? "OTP प्राप्त करें (Send OTP)" : "SEND OTP • ओटीपी भेजें"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  {/* OTP Code Box */}
                  <div className="p-4 bg-white dark:bg-[#231D1A] rounded-2xl border border-stone-300 dark:border-[#3D332C] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-stone-800 dark:text-[#B3A79E]">
                        {language === "hi" ? "+91 " + phoneNumber + " पर भेजा गया OTP" : "Enter OTP sent to +91 " + phoneNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAuthStep("phone")}
                        className="text-xs text-kk-primary-dark dark:text-kk-primary font-extrabold hover:underline cursor-pointer"
                      >
                        {language === "hi" ? "नंबर बदलें" : "Edit"}
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3 w-4 h-4 text-stone-500 dark:text-[#877C73]" />
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="4826"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-50 dark:bg-[#1E1815] border border-stone-300 dark:border-[#3D332C] text-center font-mono text-2xl font-black tracking-widest text-stone-900 dark:text-[#F6EFEA] focus:outline-none focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200 dark:border-[#332B25]">
                      <span className="text-[11px] text-stone-600 dark:text-[#877C73] font-semibold">
                        {language === "hi" ? "डेमो कोड: 4826" : "Demo verification code: 4826"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode("4826")}
                        className="text-[11px] text-kk-primary-dark dark:text-kk-primary font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{language === "hi" ? "ऑटो-फिल" : "Auto-fill"}</span>
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold">{errorMsg}</p>
                  )}

                  {/* Verify OTP Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-kk-primary hover:bg-kk-primary-dark text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-kk-primary/25 active:scale-98 transition-all cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === "hi" ? "सत्यापित हो रहा है..." : "Verifying & Logging in..."}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>{language === "hi" ? "सत्यापित करें व प्रवेश करें" : "VERIFY & ENTER DASHBOARD"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Divider: ────────  OR CONTINUE WITH  ──────── */}
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="flex-1 border-t border-stone-300 dark:border-[#3D332C]" />
                <span className="text-[11px] font-extrabold text-stone-500 dark:text-[#877C73] uppercase tracking-wider shrink-0 select-none">
                  {language === "hi" ? "या फिर" : "or continue with"}
                </span>
                <div className="flex-1 border-t border-stone-300 dark:border-[#3D332C]" />
              </div>

              {/* Google Sign-in Option */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-white dark:bg-[#231D1A] hover:bg-stone-50 dark:hover:bg-[#2C2420] border border-stone-300 dark:border-[#3D332C] text-stone-800 dark:text-[#F6EFEA] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98 cursor-pointer disabled:opacity-75"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{language === "hi" ? "Google खाते से तुरंत जुड़ें" : "Sign in with Google"}</span>
              </button>
            </div>

            {/* Bottom Trust & Govt Compliance Badges */}
            <div className="mt-6 pt-3 border-t border-stone-200 dark:border-[#3D332C] text-center">
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-stone-600 dark:text-[#877C73] font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ONDC Enabled</span>
                </span>
                <span>•</span>
                <span>GeM e-Marketplace</span>
                <span>•</span>
                <span>Ministry of Textiles</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
