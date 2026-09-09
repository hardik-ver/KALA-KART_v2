import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { playTextToSpeech, stopTextToSpeech } from "../../utils/speechUtils";
import { LanguageCode } from "../../types/artisan";

interface TTSButtonProps {
  text: string;
  lang?: LanguageCode | "hi-IN" | "en-IN" | string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "pill" | "iconOnly";
}

export const TTSButton: React.FC<TTSButtonProps> = ({
  text,
  lang = "hi",
  label,
  className = "",
  size = "md",
  variant = "pill",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopTextToSpeech();
      setIsPlaying(false);
    } else {
      playTextToSpeech(
        text,
        lang,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  const defaultLabel = label || (lang === "hi" ? "आवाज सुनें" : "Listen Audio");

  if (variant === "iconOnly") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={defaultLabel}
        className={`inline-flex items-center justify-center rounded-full transition-all active:scale-95 ${
          isPlaying
            ? "bg-kk-primary text-white animate-pulse shadow-md shadow-kk-primary/30"
            : "bg-stone-100 hover:bg-kk-primary-soft text-stone-700 hover:text-kk-primary-dark"
        } ${size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10"} ${className}`}
      >
        {isPlaying ? (
          <VolumeX className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"} />
        ) : (
          <Volume2 className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-full font-medium transition-all active:scale-95 border ${
        isPlaying
          ? "bg-kk-primary text-white border-kk-primary shadow-md shadow-kk-primary/30 animate-pulse"
          : "bg-kk-primary-soft/60 hover:bg-kk-primary-soft text-kk-primary-dark border-kk-primary-soft"
      } ${
        size === "sm"
          ? "px-3 py-1 text-xs"
          : size === "lg"
          ? "px-5 py-2.5 text-base"
          : "px-4 py-1.5 text-sm"
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>{lang === "hi" ? "रोकें" : "Stop"}</span>
        </>
      ) : (
        <>
          <Volume2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>{defaultLabel}</span>
        </>
      )}
    </button>
  );
};
