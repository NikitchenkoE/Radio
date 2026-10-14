import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global unhandled error & rejection boundary to catch silent audio/fetch/media aborts
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Interrupted audio play, aborted requests, or cancelled actions are normal browser events
    const reason = event.reason;
    if (
      !reason ||
      reason?.name === 'AbortError' ||
      reason?.name === 'NotAllowedError' ||
      reason?.name === 'DOMException' ||
      reason?.message?.includes?.('interrupted') ||
      reason?.message?.includes?.('user gesture')
    ) {
      event.preventDefault();
      return;
    }
    console.debug('Handled unhandled rejection:', reason);
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    if (event.error?.name === 'AbortError' || event.message?.includes?.('ResizeObserver')) {
      event.preventDefault();
    }
  });
}

// Clean up any legacy audio stream caches
if (typeof window !== 'undefined' && 'caches' in window) {
  try {
    caches.delete('sloboda-audio-burst-cache-v2').catch(() => {});
    caches.delete('sloboda-pwa-static-v2').catch(() => {});
    caches.delete('sloboda-pwa-static-v3').catch(() => {});
  } catch {}
}

// Register Service Worker for PWA compliance and offline app shell safely
if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  window.location.protocol.startsWith('http')
) {
  const registerSw = () => {
    try {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg?.update().catch(() => {});
        })
        .catch((err) => {
          console.debug('PWA Service Worker registration notice:', err);
        });
    } catch (e) {
      console.debug('SW register try-catch notice:', e);
    }
  };

  if (document.readyState === 'complete') {
    registerSw();
  } else {
    window.addEventListener('load', registerSw, { once: true });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

