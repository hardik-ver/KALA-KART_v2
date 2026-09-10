import React, { useState } from 'react';
import { Smartphone, CheckCircle, Download } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { IOSInstallModal } from './IOSInstallModal';
import { LanguageCode } from '../types/artisan';

interface PWAInstallSettingItemProps {
  language: LanguageCode;
}

export const PWAInstallSettingItem: React.FC<PWAInstallSettingItemProps> = ({ language }) => {
  const { isStandalone, canInstall, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  const handleInstall = async () => {
    const res = await promptInstall();
    if (res === 'ios') {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-kk-primary" />
          <div>
            <span className="text-xs font-bold text-kk-ink block">
              {language === 'hi' ? 'ऐप इंस्टॉल करें (Install App)' : 'Install Standalone App'}
            </span>
            <span className="text-[10px] text-stone-500">
              {isStandalone
                ? (language === 'hi' ? 'स्टैंडअलोन ऐप सक्रिय है' : 'Running as standalone app')
                : (language === 'hi' ? 'होम स्क्रीन पर जोड़ें (बिना ब्राउज़र बार)' : 'Add to home screen (no browser bar)')}
            </span>
          </div>
        </div>

        <div>
          {isStandalone ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'इंस्टॉल है' : 'Installed'}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleInstall}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-kk-primary text-white shadow-2xs hover:bg-kk-primary-dark transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'इंस्टॉल' : 'Install'}</span>
            </button>
          )}
        </div>
      </div>

      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
