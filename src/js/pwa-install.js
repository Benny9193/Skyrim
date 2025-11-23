// PWA Install Prompt Handler
// Manages app installation prompts and PWA functionality

let deferredPrompt = null;
let installButton = null;

// Initialize PWA install functionality
export function initPWAInstall() {
    console.log('[PWA] Initializing install prompt handler');

    // Create install button
    createInstallButton();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] beforeinstallprompt event fired');

        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show install button
        showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App successfully installed');
        deferredPrompt = null;
        hideInstallButton();

        // Show success notification
        showNotification('App installed! Launch from your home screen.', 'success');
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        console.log('[PWA] App is running in standalone mode');
        hideInstallButton();
    }

    // Register service worker
    registerServiceWorker();
}

// Create floating install button
function createInstallButton() {
    // Check if button already exists
    if (document.getElementById('pwa-install-btn')) return;

    installButton = document.createElement('button');
    installButton.id = 'pwa-install-btn';
    installButton.className = 'pwa-install-button hidden';
    installButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Install App</span>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .pwa-install-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            animation: slideInUp 0.5s ease;
        }

        .pwa-install-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .pwa-install-button:active {
            transform: translateY(0);
        }

        .pwa-install-button.hidden {
            display: none;
        }

        .pwa-install-button svg {
            flex-shrink: 0;
        }

        @keyframes slideInUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            .pwa-install-button {
                bottom: 80px; /* Space for mobile bottom nav if present */
                right: 16px;
                left: 16px;
                justify-content: center;
            }
        }

        .pwa-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            color: #333;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        }

        .pwa-notification.success {
            border-left: 4px solid #10b981;
        }

        .pwa-notification.error {
            border-left: 4px solid #ef4444;
        }

        .pwa-notification.info {
            border-left: 4px solid #3b82f6;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(400px);
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(installButton);

    // Add click handler
    installButton.addEventListener('click', handleInstallClick);
}

// Show install button
function showInstallButton() {
    if (installButton) {
        installButton.classList.remove('hidden');
    }
}

// Hide install button
function hideInstallButton() {
    if (installButton) {
        installButton.classList.add('hidden');
    }
}

// Handle install button click
async function handleInstallClick() {
    if (!deferredPrompt) {
        console.log('[PWA] No install prompt available');
        return;
    }

    console.log('[PWA] Showing install prompt');

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
        showNotification('Installing app...', 'info');
    } else {
        showNotification('Installation cancelled', 'info');
    }

    // Clear the deferredPrompt
    deferredPrompt = null;
    hideInstallButton();
}

// Register service worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            console.log('[PWA] Registering service worker');

            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('[PWA] Service worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[PWA] New service worker found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'activated') {
                        console.log('[PWA] New service worker activated');
                        showUpdateNotification();
                    }
                });
            });

            // Check for updates every hour
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000);

        } catch (error) {
            console.error('[PWA] Service worker registration failed:', error);
        }
    } else {
        console.log('[PWA] Service workers not supported');
    }
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-notification info';
    notification.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
        </svg>
        <div>
            <strong>Update Available</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Reload to get the latest version</p>
        </div>
        <button onclick="window.location.reload()" style="margin-left: auto; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
            Reload
        </button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pwa-notification ${type}`;

    const icons = {
        success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    notification.innerHTML = `
        ${icons[type]}
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Check if app should prompt for installation
export function checkInstallPrompt() {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return false;
    }

    // Don't show if user dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);

        // Show again after 7 days
        if (daysSinceDismissed < 7) {
            return false;
        }
    }

    return true;
}

// Mark install prompt as dismissed
export function dismissInstallPrompt() {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    hideInstallButton();
}

// Get PWA display mode
export function getPWADisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
    }
    return 'browser';
}

// Check if running as PWA
export function isPWA() {
    return getPWADisplayMode() !== 'browser';
}

// Export for global access
if (typeof window !== 'undefined') {
    window.PWAInstall = {
        init: initPWAInstall,
        checkInstallPrompt,
        dismissInstallPrompt,
        getPWADisplayMode,
        isPWA
    };
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWAInstall);
} else {
    initPWAInstall();
}

export default {
    init: initPWAInstall,
    checkInstallPrompt,
    dismissInstallPrompt,
    getPWADisplayMode,
    isPWA
};
