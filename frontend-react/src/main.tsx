import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let reloading = false;
    let hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) {
        hadController = true;
        return;
      }
      if (reloading) return;
      reloading = true;
      window.dispatchEvent(new CustomEvent('sop:pwa-controller-changed'));
    });

    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('sop:pwa-update-available', { detail: registration }));
            }
          });
        });

        window.setInterval(() => {
          registration.update().catch(() => null);
        }, 5 * 60 * 1000);
      })
      .catch(() => {
        // O app continua funcional mesmo quando o navegador bloqueia PWA.
      });
  });
}
