/**
 * Performance utility functions for optimizing the application
 */

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - The function to throttle
 * @param {number} limit - Minimum time between executions in ms
 * @returns {Function} - The throttled function
 */
export function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Animate a value change using requestAnimationFrame
 * @param {Object} options - Animation options
 * @param {number} options.from - Starting value
 * @param {number} options.to - Ending value
 * @param {number} options.duration - Duration in milliseconds
 * @param {Function} options.onUpdate - Callback with current value
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {Function} options.easing - Easing function (default: linear)
 * @returns {Function} - Cancel function to stop animation
 */
export function animateValue(options) {
    const {
        from,
        to,
        duration = 1000,
        onUpdate,
        onComplete,
        easing = (t) => t // linear easing by default
    } = options;

    const startTime = performance.now();
    let cancelled = false;

    function update(currentTime) {
        if (cancelled) return;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        const currentValue = from + (to - from) * easedProgress;

        onUpdate(currentValue);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else if (onComplete) {
            onComplete();
        }
    }

    requestAnimationFrame(update);

    // Return cancel function
    return () => {
        cancelled = true;
    };
}

/**
 * Fade element opacity using requestAnimationFrame
 * @param {HTMLElement|Object} element - DOM element or object with traverse method (Three.js)
 * @param {number} fromOpacity - Starting opacity (0-1)
 * @param {number} toOpacity - Target opacity (0-1)
 * @param {number} duration - Duration in milliseconds
 * @param {boolean} isThreeJSObject - Whether element is a Three.js object
 * @returns {Promise<void>} - Resolves when fade completes
 */
export function fadeElement(element, fromOpacity, toOpacity, duration = 300, isThreeJSObject = false) {
    return new Promise((resolve) => {
        animateValue({
            from: fromOpacity,
            to: toOpacity,
            duration,
            onUpdate: (opacity) => {
                if (isThreeJSObject) {
                    // Three.js object with materials
                    element.traverse(child => {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.transparent = true;
                                    mat.opacity = opacity;
                                });
                            } else {
                                child.material.transparent = true;
                                child.material.opacity = opacity;
                            }
                        }
                    });
                } else {
                    // Regular DOM element
                    element.style.opacity = opacity;
                }
            },
            onComplete: resolve
        });
    });
}

/**
 * Event delegation helper
 * @param {HTMLElement} parent - Parent element to attach listener to
 * @param {string} selector - CSS selector for target elements
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {Function} handler - Event handler function
 */
export function delegate(parent, selector, eventType, handler) {
    parent.addEventListener(eventType, (event) => {
        const targetElement = event.target.closest(selector);
        if (targetElement && parent.contains(targetElement)) {
            handler.call(targetElement, event, targetElement);
        }
    });
}

/**
 * Cache DOM queries
 * @returns {Object} - Object with get method for cached queries
 */
export function createDOMCache() {
    const cache = new Map();

    return {
        get(selector) {
            if (!cache.has(selector)) {
                cache.set(selector, document.querySelector(selector));
            }
            return cache.get(selector);
        },
        getAll(selector) {
            if (!cache.has(selector)) {
                cache.set(selector, document.querySelectorAll(selector));
            }
            return cache.get(selector);
        },
        clear() {
            cache.clear();
        }
    };
}

/**
 * Pause/resume animation based on visibility
 * @param {Function} animationCallback - The animation function to control
 * @returns {Object} - Object with start/stop methods
 */
export function createVisibilityControlledAnimation(animationCallback) {
    let animationId = null;
    let isRunning = false;

    function animate() {
        if (!isRunning) return;
        animationCallback();
        animationId = requestAnimationFrame(animate);
    }

    function handleVisibilityChange() {
        if (document.hidden && isRunning) {
            stop();
        } else if (!document.hidden && !isRunning) {
            start();
        }
    }

    function start() {
        if (!isRunning) {
            isRunning = true;
            animate();
        }
    }

    function stop() {
        if (isRunning) {
            isRunning = false;
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    }

    // Auto-pause when page is hidden
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return { start, stop, isRunning: () => isRunning };
}

/**
 * Easing functions for animations
 */
export const easings = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};
