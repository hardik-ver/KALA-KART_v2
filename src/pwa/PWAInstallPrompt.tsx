import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { IOSInstallModal } from './IOSInstallModal';

export const PWAInstallPrompt: React.FC = () => {
  const { isStandalone, canInstall, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = sessionStorage.getItem('kalakart_pwa_dismissed');
    if (!dismissed) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('kalakart_pwa_dismissed', 'true');
    } catch {
      // Safe fallback
    }
  };

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result === 'ios') {
      setShowIOSModal(true);
    } else if (result === 'accepted') {
      setIsDismissed(true);
    }
  };

  // If already standalone or user dismissed, don't show floating prompt
  if (isStandalone || isDismissed || !canInstall) {
    return <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />;
  }

  return (
    <>
      {/* Discreet floating pill in the top corner that doesn't obstruct content */}
      <aside
        aria-label="Install application"
        className="fixed top-2 right-2 z-40 flex items-center gap-1.5 bg-stone-900/90 hover:bg-stone-900 text-white pl-2.5 pr-1.5 py-1 rounded-full shadow-lg border border-amber-600/40 backdrop-blur-xs text-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-200 hover:text-white transition-colors"
          title="Install Kala-Kart as a standalone application on your home screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Install App</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="w-3 h-3" />
        </button>
      </aside>

      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
