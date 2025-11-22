// Service Worker Registration
// Include this script in your HTML pages to enable PWA features

(function() {
  'use strict';

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return;
  }

  // Wait for page load
  window.addEventListener('load', () => {
    registerServiceWorker();
    setupInstallPrompt();
    checkForUpdates();
  });

  // Register the service worker
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✓ Service Worker registered successfully:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker update found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification();
          }
        });
      });

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Handle install prompt for PWA
  let deferredPrompt;

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('Install prompt triggered');

      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Save the event for later use
      deferredPrompt = e;

      // Show custom install button/notification
      showInstallPromotion();
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('✓ PWA installed successfully');
      deferredPrompt = null;
      hideInstallPromotion();

      // Track installation (analytics, etc.)
      trackInstallation();
    });
  }

  // Show custom install promotion
  function showInstallPromotion() {
    const installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 90%;
        animation: slideUp 0.3s ease-out;
      ">
        <span style="font-size: 24px;">🐉</span>
        <div style="flex: 1;">
          <strong>Install Skyrim Bestiary</strong>
          <div style="font-size: 0.9em; opacity: 0.9;">Access offline & get faster loading</div>
        </div>
        <button id="pwa-install-button" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 8px 20px;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
        ">Install</button>
        <button id="pwa-dismiss-button" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Install button handler
    document.getElementById('pwa-install-button').addEventListener('click', async () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

      // Clear the deferredPrompt
      deferredPrompt = null;

      // Hide the promotion
      hideInstallPromotion();
    });

    // Dismiss button handler
    document.getElementById('pwa-dismiss-button').addEventListener('click', () => {
      hideInstallPromotion();

      // Remember user dismissed (don't show again for 7 days)
      localStorage.setItem('pwa-install-dismissed', Date.now());
    });

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      hideInstallPromotion();
    }
  }

  function hideInstallPromotion() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => banner.remove(), 300);
    }
  }

  // Show update notification
  function showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideDown 0.3s ease-out;
      ">
        <span>✨ New version available!</span>
        <button id="pwa-update-button" style="
          background: white;
          color: #f5576c;
          border: none;
          padding: 6px 15px;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
        ">Refresh</button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Refresh button handler
    document.getElementById('pwa-update-button').addEventListener('click', () => {
      // Tell the service worker to skip waiting
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page
      window.location.reload();
    });
  }

  // Check for updates on visibility change
  function checkForUpdates() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    });
  }

  // Track installation for analytics
  function trackInstallation() {
    // Send installation event to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA Installation'
      });
    }

    console.log('✓ PWA installation tracked');
  }

  // Expose API for manual cache management
  window.SkyrimPWA = {
    // Clear all caches
    clearCache: async function() {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        console.log('Cache cleared');
        return true;
      }
      return false;
    },

    // Cache specific URLs
    cacheUrls: async function(urls) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_URLS',
          urls: urls
        });
        console.log('URLs cached:', urls);
        return true;
      }
      return false;
    },

    // Check if running as PWA
    isPWA: function() {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    },

    // Get install status
    canInstall: function() {
      return deferredPrompt !== null;
    }
  };

  console.log('✓ PWA features initialized');
})();
