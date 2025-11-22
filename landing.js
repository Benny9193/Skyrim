// Landing Page JavaScript

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Update active link
                updateActiveLink(link);
            }
        }
    });
});

// Update active navigation link on scroll
function updateActiveLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.style.color = '';
    });
    if (activeLink) {
        activeLink.style.color = 'var(--color-primary)';
    }
}

// Highlight active section on scroll
document.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            link.style.color = 'var(--color-primary)';
        } else {
            link.style.color = '';
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and app cards
document.querySelectorAll('.feature-card, .app-card, .stat-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Button interactions
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
    });
});

// Add transition style to buttons
const style = document.createElement('style');
style.textContent = `
    .btn {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const hero = document.querySelector('.hero');
    const heroIcon = document.querySelector('.hero-icon');

    if (hero && scrollTop < window.innerHeight) {
        // Parallax background
        hero.style.transform = `translateY(${scrollTop * 0.5}px)`;

        // Parallax icon
        if (heroIcon) {
            heroIcon.style.transform = `translateY(${scrollTop * 0.3}px) rotate(${scrollTop * 0.05}deg)`;
        }
    }

    // Parallax for section icons
    const quickIcons = document.querySelectorAll('.quick-icon');
    quickIcons.forEach((icon, index) => {
        const rect = icon.getBoundingClientRect();
        const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
        if (scrollPercent > 0 && scrollPercent < 1) {
            icon.style.transform = `translateY(${-(scrollPercent * 20 - 10)}px)`;
        }
    });

    lastScrollTop = scrollTop;
}, { passive: true });

// Animated counter function
function animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 16);
}

// Intersection Observer for scroll-triggered animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;

            // Animate stat numbers
            if (target.classList.contains('stat-box') && !target.dataset.animated) {
                target.dataset.animated = 'true';
                const numberElement = target.querySelector('.stat-number');
                const text = numberElement.textContent.trim();

                // Handle different stat formats
                if (text === '∞') {
                    numberElement.style.opacity = '0';
                    numberElement.style.transform = 'scale(0.5)';
                    setTimeout(() => {
                        numberElement.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        numberElement.style.opacity = '1';
                        numberElement.style.transform = 'scale(1)';
                    }, 100);
                } else if (text.includes('%')) {
                    const num = parseInt(text);
                    numberElement.textContent = '0%';
                    setTimeout(() => animateCounter(numberElement, num, 1500, '%'), 200);
                } else if (text.includes('+')) {
                    const num = parseInt(text);
                    numberElement.textContent = '0+';
                    setTimeout(() => animateCounter(numberElement, num, 1500, '+'), 200);
                } else {
                    const num = parseInt(text);
                    if (!isNaN(num)) {
                        numberElement.textContent = '0';
                        setTimeout(() => animateCounter(numberElement, num, 1500), 200);
                    }
                }

                // Add scale-in animation
                target.style.transform = 'scale(1)';
            }

            // Staggered animation for feature cards
            if (target.classList.contains('features-grid')) {
                const cards = target.querySelectorAll('.feature-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }

            // Fade in sections
            if (target.classList.contains('animate-on-scroll')) {
                target.classList.add('visible');
            }
        }
    });
}, observerOptions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing page loaded');

    // Hide loader when page is ready
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelector('.page-loader')?.classList.add('hidden');
        }, 500);
    });

    // Add entrance animation to elements
    setTimeout(() => {
        document.querySelector('.hero-content')?.classList.add('animate-in');
        document.querySelector('.hero-visual')?.classList.add('animate-in');
    }, 600);

    // Observe stat boxes for animation
    document.querySelectorAll('.stat-box').forEach(box => {
        box.style.transform = 'scale(0.8)';
        box.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        animationObserver.observe(box);
    });

    // Observe features grid
    const featuresGrid = document.querySelector('.features-grid');
    if (featuresGrid) {
        animationObserver.observe(featuresGrid);
        // Pre-set cards for animation
        featuresGrid.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
        });
    }

    // Observe sections with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(section => {
        animationObserver.observe(section);
    });
});
