// Smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    import('smoothscroll-polyfill').then((smoothscroll) => {
        smoothscroll.polyfill();
    });
}

// Custom smooth scroll function as fallback
function smoothScrollTo(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function scrollAnimation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeInOutQuad = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutQuad);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(scrollAnimation);
        }
    }

    requestAnimationFrame(scrollAnimation);
}

// Apply smooth scroll to all anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's a # link
            if (href === '#') return;
            
            // Check if the target exists
            if (document.querySelector(href)) {
                e.preventDefault();
                
                // Use native smooth scroll if available
                if ('scrollBehavior' in document.documentElement.style) {
                    document.querySelector(href).scrollIntoView({
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback to custom smooth scroll
                    smoothScrollTo(href);
                }
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    location.hash = href;
                }
            }
        });
    });
});