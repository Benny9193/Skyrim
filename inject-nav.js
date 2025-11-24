/**
 * Navigation Injection Script
 * Automatically loads navigation, theme, and favorites systems on all pages
 * 
 * Usage: Add this script to the end of <body> tag:
 * <script src="inject-nav.js"></script>
 */

(function() {
    'use strict';
    
    // Check if navigation is already loaded
    if (document.getElementById('skyrimNav')) {
        console.log('Navigation already loaded');
        return;
    }
    
    // Load CSS files
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-nav-system', 'true');
        document.head.appendChild(link);
    }
    
    // Load JavaScript files
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    
    // Initialize the system
    async function init() {
        try {
            // Load CSS files if not already present
            if (!document.querySelector('link[data-nav-system][href*="nav.css"]')) {
                loadCSS('nav.css');
            }
            if (!document.querySelector('link[data-nav-system][href*="theme.css"]')) {
                loadCSS('theme.css');
            }
            if (!document.querySelector('link[data-nav-system][href*="loading.css"]')) {
                loadCSS('loading.css');
            }
            
            // Load JavaScript modules
            if (!window.favoritesManager) {
                await loadScript('favorites.js');
            }
            if (!window.skyrimNav) {
                await loadScript('nav.js');
            }
            
            console.log('Skyrim navigation system loaded successfully');
        } catch (error) {
            console.error('Error loading navigation system:', error);
        }
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
