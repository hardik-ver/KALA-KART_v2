import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { LanguageCode } from "../../types/artisan";
import { playTextToSpeech, stopTextToSpeech } from "../../utils/speechUtils";
import { KalaKartLogo } from "../common/KalaKartLogo";
import { WavesBackground } from "../common/WavesBackground";

interface SplashScreenProps {
  language: LanguageCode;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ language, onFinish }) => {
  useEffect(() => {
    const welcomeText =
      language === "hi"
        ? "कला-कार्ट में आपका स्वागत है। पारंपरिक शिल्प का डिजिटल मंच।"
        : "Welcome to Kala-Kart. Empowering Traditional Craftsmanship.";
    const voiceTimer = setTimeout(() => {
      playTextToSpeech(welcomeText, language);
    }, 400);

    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearTimeout(voiceTimer);
      stopTextToSpeech();
    };
  }, [language, onFinish]);

  return (
    <div
      onClick={onFinish}
      role="button"
      tabIndex={0}
      className="flex flex-col h-full text-white p-6 justify-between items-center relative overflow-hidden select-none cursor-pointer bg-kk-ink"
    >
      {/* Fixed Waves shader background — identical in every environment,
          not theme-dependent, no blur/filter/overlay layered on top */}
      <div className="absolute inset-0 z-0">
        <WavesBackground />
      </div>

      {/* Top minimal status marker */}
      <div className="w-full flex justify-between items-center z-10 pt-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-kk-ink-soft/80 px-3 py-1 rounded-full border border-kk-ink-soft">
          Smart Artisan Engine
        </span>
        <span className="text-[10px] font-mono text-kk-primary font-semibold">
          v2.4 Pro
        </span>
      </div>

      {/* Central Hero Logo & Branding */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <div className="relative mb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-kk-primary via-kk-primary to-amber-400 p-1 shadow-2xl shadow-kk-ink/60 animate-pulse">
            <div className="w-full h-full bg-kk-surface rounded-[22px] flex items-center justify-center relative overflow-hidden p-1">
              <KalaKartLogo
                size="hero"
                className="w-full h-full rounded-[20px]"
                alt="Kala-Kart Official Logo"
              />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-sans">
          Kala-Kart
        </h1>
        <div className="h-1 w-12 bg-kk-primary rounded-full mx-auto mb-3" />

        <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xs leading-relaxed">
          {language === "hi"
            ? "पारंपरिक शिल्पकारों व बुनकरों का डिजिटल मंच"
            : "Empowering Traditional Craftsmanship"}
        </p>

        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
          {language === "hi"
            ? "वॉइस कैटलॉग • स्मार्ट मूल्य • ई-मार्केट"
            : "Voice Catalog • Smart Pricing • ONDC Ready"}
        </p>
      </div>

      {/* Bottom Loading Progress & Tap CTA */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 z-10 pb-4">
        <div className="w-full h-1.5 bg-kk-ink-soft rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-kk-primary to-amber-400 rounded-full animate-[progress_2.2s_ease-in-out_infinite]" />
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors group mt-1"
        >
          <span>{language === "hi" ? "आगे बढ़ने के लिए टैप करें" : "Tap anywhere to continue"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-kk-primary" />
        </button>
      </div>
    </div>
  );
};
