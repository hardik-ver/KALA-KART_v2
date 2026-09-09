import React, { useState } from "react";
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  User, 
  CheckCircle2, 
  KeyRound, 
  RotateCcw, 
  ShoppingBag 
} from "lucide-react";
import { LanguageCode, ArtisanUser, SellerRole } from "../../types/artisan";
import { DEFAULT_USER } from "../../data/sampleCrafts";
import { TTSButton } from "../common/TTSButton";
import { KalaKartLogo } from "../common/KalaKartLogo";
import { playTextToSpeech, soundEffects } from "../../utils/speechUtils";

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
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("9876543210");
  const [otpCode, setOtpCode] = useState<string>("4826");
  const [selectedRole, setSelectedRole] = useState<SellerRole>("individual");
  const [artisanName, setArtisanName] = useState<string>("Rameshwar Sharma");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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
        role: selectedRole,
      };
      onLoginSuccess(user);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-kk-surface text-kk-ink p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-kk-line">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <KalaKartLogo
            size="sm"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xs border border-kk-line bg-kk-surface p-0.5 shrink-0"
            alt="Kala-Kart Logo"
          />
          <div className="flex flex-col justify-center leading-tight">
            <h1 className="text-sm font-extrabold text-kk-ink tracking-tight leading-tight">
              Kala-Kart
            </h1>
            <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider leading-tight">
              {language === "hi" ? "शिल्पकार लॉगिन" : "Artisan Login"}
            </span>
          </div>
        </div>

        {/* Language Switch & TTS Guide */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-kk-line">
            <button
              type="button"
              onClick={() => onLanguageChange("hi")}
              className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                language === "hi"
                  ? "bg-kk-primary text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                language === "en"
                  ? "bg-kk-primary text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              EN
            </button>
          </div>

          <TTSButton
            text={
              language === "hi"
                ? "नमस्ते! अपने मोबाइल नंबर से लॉगिन करें और अपने हस्तशिल्प को ऑनलाइन बेचें।"
                : "Welcome! Login with your phone number to manage and sell your handicrafts."
            }
            lang={language}
            size="sm"
            variant="iconOnly"
          />
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-3.5 sm:mt-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5 sm:space-y-4">
          {/* Plain Welcome Text */}
          <div className="pt-0.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-kk-ink tracking-tight">
              {language === "hi" ? "कला-कार्ट में आपका स्वागत है" : "Welcome to Kala-Kart"}
            </h2>
          </div>

          {/* Enlarged Seller / Customer Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-stone-100/90 dark:bg-[#1E1815] rounded-xl border border-kk-line/90 dark:border-[#382E28] text-sm font-bold shadow-2xs">
            <button
              type="button"
              className="py-2.5 sm:py-3 px-3 rounded-lg bg-white dark:bg-[#352C27] text-kk-ink dark:text-[#F6EFEA] shadow-xs dark:shadow-none dark:border dark:border-[#4D3F37] flex items-center justify-center gap-2 transition-all cursor-default"
            >
              <User className="w-4 h-4 text-kk-primary shrink-0" />
              <span className="truncate">{language === "hi" ? "विक्रेता (Seller)" : "Seller"}</span>
            </button>
            <button
              type="button"
              onClick={onCustomerLogin}
              className="py-2.5 sm:py-3 px-3 rounded-lg text-stone-600 dark:text-[#B3A79E] hover:text-kk-ink dark:hover:text-[#F6EFEA] hover:bg-white/70 dark:hover:bg-[#28201C] transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-stone-400 dark:text-[#877C73] group-hover:text-kk-primary transition-colors shrink-0" />
              <span className="truncate">{language === "hi" ? "ग्राहक (Customer)" : "Customer"}</span>
            </button>
          </div>

          {/* Craft Role Toggle (Individual Artisan vs Co-operative) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-[#B3A79E] block mb-2">
              {language === "hi" ? "आपकी श्रेणी चुनें (Role)" : "Select Seller Category"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Individual Artisan */}
              <button
                type="button"
                onClick={() => setSelectedRole("individual")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  selectedRole === "individual"
                    ? "bg-white dark:bg-[#2C231F] border-kk-primary ring-2 ring-kk-primary/20 shadow-xs"
                    : "bg-white/80 dark:bg-[#231D1A] border-kk-line dark:border-[#3D332C] hover:border-stone-300 dark:hover:border-[#52443B] opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${selectedRole === "individual" ? "bg-kk-primary-soft dark:bg-[#423126] text-kk-primary-dark dark:text-kk-primary" : "bg-stone-100 dark:bg-[#2A221E] text-stone-600 dark:text-[#B3A79E]"}`}>
                    <User className="w-4 h-4" />
                  </div>
                  {selectedRole === "individual" && <CheckCircle2 className="w-4 h-4 text-kk-primary" />}
                </div>
                <span className="font-bold text-xs text-kk-ink dark:text-[#F6EFEA] mt-1">
                  {language === "hi" ? "व्यक्तिगत शिल्पकार" : "Individual Artisan"}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-[#877C73] font-medium">
                  {language === "hi" ? "एकल कारीगर / बुनकर" : "Solo craftsman / weaver"}
                </span>
              </button>

              {/* Co-operative / Group */}
              <button
                type="button"
                onClick={() => setSelectedRole("cooperative")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  selectedRole === "cooperative"
                    ? "bg-white dark:bg-[#2C231F] border-kk-primary ring-2 ring-kk-primary/20 shadow-xs"
                    : "bg-white/80 dark:bg-[#231D1A] border-kk-line dark:border-[#3D332C] hover:border-stone-300 dark:hover:border-[#52443B] opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${selectedRole === "cooperative" ? "bg-kk-primary-soft dark:bg-[#423126] text-kk-primary-dark dark:text-kk-primary" : "bg-stone-100 dark:bg-[#2A221E] text-stone-600 dark:text-[#B3A79E]"}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  {selectedRole === "cooperative" && <CheckCircle2 className="w-4 h-4 text-kk-primary" />}
                </div>
                <span className="font-bold text-xs text-kk-ink dark:text-[#F6EFEA] mt-1">
                  {language === "hi" ? "बुनकर समूह / समिति" : "Craft Co-operative"}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-[#877C73] font-medium">
                  {language === "hi" ? "SHG / क्लस्टर समूह" : "SHG / Artisan Cluster"}
                </span>
              </button>
            </div>
          </div>

          {/* Form Step: Phone vs OTP */}
          {authStep === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              {/* Artisan Name Field */}
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  {language === "hi" ? "आपका नाम / संस्था का नाम" : "Artisan / Group Name"}
                </label>
                <input
                  type="text"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  placeholder={language === "hi" ? "उदा. रामेश्वर शर्मा" : "e.g. Rameshwar Sharma"}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-stone-300 text-sm font-semibold text-kk-ink focus:outline-none focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20 shadow-xs"
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  {language === "hi" ? "मोबाइल नंबर (OTP सत्यापन)" : "Mobile Number (for instant OTP)"}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-xs font-bold text-stone-600 border-r border-kk-line pr-2">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="w-full h-12 pl-18 pr-4 rounded-xl bg-white border border-stone-300 text-base font-bold text-kk-ink tracking-wider focus:outline-none focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20 shadow-xs"
                  />
                  <Phone className="absolute right-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
              )}

              {/* Send OTP Primary Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-kk-primary hover:bg-kk-primary-dark text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-kk-ink/20 active:scale-95 transition-all mt-2"
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
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              {/* OTP Code Box */}
              <div className="p-4 bg-white rounded-2xl border border-kk-line shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-600">
                    {language === "hi" ? "+91 " + phoneNumber + " पर भेजा गया OTP" : "Enter OTP sent to +91 " + phoneNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthStep("phone")}
                    className="text-xs text-kk-primary font-bold hover:underline"
                  >
                    {language === "hi" ? "नंबर बदलें" : "Edit"}
                  </button>
                </div>

                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="4826"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-50 border border-stone-300 text-center font-mono text-2xl font-black tracking-widest text-kk-ink focus:outline-none focus:border-kk-primary focus:ring-2 focus:ring-kk-primary/20"
                  />
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                  <span className="text-[11px] text-stone-500">
                    {language === "hi" ? "डेमो कोड: 4826" : "Demo verification code: 4826"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode("4826")}
                    className="text-[11px] text-kk-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === "hi" ? "ऑटो-फिल" : "Auto-fill"}</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
              )}

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-kk-primary hover:bg-kk-primary-dark text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-kk-ink/20 active:scale-95 transition-all"
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
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="flex-1 border-t border-kk-line" />
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 select-none">
              {language === "hi" ? "या फिर" : "or continue with"}
            </span>
            <div className="flex-1 border-t border-kk-line" />
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        <div className="mt-4 pt-3 border-t border-kk-line text-center">
          <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ONDC Enabled</span>
            </span>
            <span>•</span>
            <span>GeM e-Marketplace</span>
            <span>•</span>
            <span>Ministry of Textiles</span>
          </div>
        </div>
      </div>
    </div>
  );
};
