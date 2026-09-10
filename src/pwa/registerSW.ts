import { registerSW } from 'virtual:pwa-register';

export function initPWA() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Auto update service worker on reload
        console.log('[Kala-Kart PWA] New content available');
      },
      onOfflineReady() {
        console.log('[Kala-Kart PWA] App ready to work standalone & offline');
      },
      onRegisterError(error) {
        console.error('[Kala-Kart PWA] Service worker registration failed:', error);
      },
    });
    return updateSW;
  }
  return undefined;
}
