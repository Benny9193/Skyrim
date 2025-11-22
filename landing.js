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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing page loaded');
});
