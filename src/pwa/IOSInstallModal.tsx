import React from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-stone-700 bg-stone-800 shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="Kala-Kart"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Install Kala-Kart on iPhone</h3>
            <p className="text-xs text-stone-400">Add to your Home Screen for a standalone app experience</p>
          </div>
        </div>

        <div className="space-y-3 my-4 text-xs text-stone-300">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/50">
            <div className="p-2 rounded-lg bg-stone-700 text-white shrink-0 mt-0.5">
              <Share className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <p className="font-semibold text-white">1. Tap the Share button</p>
              <p className="text-stone-400 mt-0.5">In the bottom Safari toolbar, tap the square icon with an upward arrow.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/50">
            <div className="p-2 rounded-lg bg-stone-700 text-white shrink-0 mt-0.5">
              <PlusSquare className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white">2. Select &ldquo;Add to Home Screen&rdquo;</p>
              <p className="text-stone-400 mt-0.5">Scroll down the share menu and tap &ldquo;Add to Home Screen&rdquo; (होम स्क्रीन में जोड़ें).</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/50">
            <div className="p-2 rounded-lg bg-stone-700 text-white shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">3. Tap &ldquo;Add&rdquo; in the top-right</p>
              <p className="text-stone-400 mt-0.5">Kala-Kart will install as a standalone app with no browser address bar.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
