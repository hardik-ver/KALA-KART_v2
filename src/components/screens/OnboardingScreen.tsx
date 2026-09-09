import React, { useEffect } from "react";
import { CraftCategory, LanguageCode } from "../../types/artisan";
import { CRAFT_CATEGORIES } from "../../data/sampleCrafts";
import { TTSButton } from "../common/TTSButton";
import { playTextToSpeech, stopTextToSpeech } from "../../utils/speechUtils";
import { 
  ArrowRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface OnboardingScreenProps {
  selectedCraft: CraftCategory | null;
  onSelectCraft: (craft: CraftCategory) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onProceed: () => void;
  onBack?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  selectedCraft,
  onSelectCraft,
  language,
  onLanguageChange,
  onProceed,
  onBack,
}) => {
  // Voice welcome greeting
  useEffect(() => {
    const greeting = language === "hi" 
      ? "नमस्ते शिल्पकार जी! अपने उत्पाद की शिल्प श्रेणी चुनें।"
      : "Welcome! Tap your craft category to begin digitizing your product.";
    const timer = setTimeout(() => {
      playTextToSpeech(greeting, language);
    }, 400);
    return () => {
      clearTimeout(timer);
      stopTextToSpeech();
    };
  }, [language]);

  const getCraftEmoji = (id: string) => {
    switch (id) {
      case "pottery":
        return "🏺";
      case "textiles":
        return "🧵";
      case "woodwork":
        return "🪵";
      case "metalcraft":
        return "🪔";
      case "jewelry":
        return "💍";
      case "miscellaneous":
        return "🎋";
      default:
        return "✨";
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-kk-surface text-kk-ink p-4 sm:p-5 overflow-y-auto font-sans isolate">
      {/* Top Section Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-kk-line">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="w-7 h-7 bg-kk-primary rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs">
            1
          </span>
          <div>
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {language === "hi" ? "1. शिल्प श्रेणी चयन" : "1. Select Craft Category"}
            </h2>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              Kala-Kart Studio
            </span>
          </div>
        </div>

        <TTSButton
          text={
            language === "hi"
              ? "नमस्ते! अपने उत्पाद की शिल्प श्रेणी चुनें।"
              : "Select your craft category to proceed."
          }
          lang={language}
          size="sm"
          variant="iconOnly"
        />
      </div>

      {/* Main Grid: 6 Category Aspect-Square Tiles */}
      <div className="mt-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
              {language === "hi" ? "अपनी पारंपरिक कला चुनें" : "Select Your Heritage Craft"}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              6 Categories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {CRAFT_CATEGORIES.map((craft) => {
              const isSelected = selectedCraft?.id === craft.id;
              return (
                <div
                  key={craft.id}
                  onClick={() => {
                    onSelectCraft(craft);
                    playTextToSpeech(
                      language === "hi" ? craft.nameHi : craft.nameEn,
                      language
                    );
                  }}
                  role="button"
                  tabIndex={0}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 p-2.5 text-center transition-all duration-200 cursor-pointer select-none active:scale-95 relative overflow-hidden ${
                    isSelected
                      ? "border-3 border-kk-primary bg-white shadow-md ring-4 ring-kk-primary/15"
                      : "border border-kk-line bg-white hover:border-stone-300 hover:bg-stone-50/80 opacity-85 hover:opacity-100 shadow-2xs"
                  }`}
                >
                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-kk-primary" />
                  )}

                  <div className="text-3xl sm:text-4xl transition-transform transform group-hover:scale-110">
                    {getCraftEmoji(craft.id)}
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-kk-ink leading-tight line-clamp-1">
                    {craft.nameEn.split(" / ")[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium line-clamp-1">
                    {craft.nameHi}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Audio Assistance Frame */}
        <div className="mt-3.5 p-3.5 bg-white rounded-2xl border border-kk-line shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-kk-surface text-kk-primary rounded-xl flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-stone-700 font-medium leading-snug">
                {language === "hi"
                  ? "श्रेणी चुनने के बाद 'आगे बढ़ें' दबाएं और उत्पाद की तस्वीर लें।"
                  : "Pick your craft category to launch the AI camera & studio enhancer."}
              </p>
            </div>
          </div>
          <TTSButton
            text={
              language === "hi"
                ? "श्रेणी चुनने के बाद 'आगे बढ़ें' दबाएं और उत्पाद की तस्वीर लें।"
                : "Pick your craft category to launch the AI camera and studio enhancer."
            }
            lang={language}
            variant="iconOnly"
            size="sm"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3.5 pt-3 border-t border-kk-line">
        <button
          type="button"
          disabled={!selectedCraft}
          onClick={onProceed}
          className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${
            selectedCraft
              ? "bg-kk-primary hover:bg-kk-primary-dark text-white shadow-orange-950/20"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
        >
          <span>
            {language === "hi" 
              ? (selectedCraft ? "आगे बढ़ें • AI फोटो स्टूडियो" : "कृपया शिल्प श्रेणी चुनें")
              : (selectedCraft ? "CONTINUE TO CAMERA STUDIO • आगे बढ़ें" : "SELECT A CRAFT CATEGORY")}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
