// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleNavbarScroll);

// ========== MOBILE MENU ==========
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    document.querySelectorAll('.nav-link, .nav-btn').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========== CAROUSEL ==========
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const slides = track.children;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayInterval;

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    const dots = dotsContainer ? dotsContainer.children : [];

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
        resetAutoPlay();
    }

    function updateDots() {
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === currentSlide);
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlide);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Pause on hover
    const carouselContainer = track.closest('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    startAutoPlay();
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== LAZY LOAD IMAGES ==========
function initLazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ========== TESTIMONIALS CAROUSEL (optional) ==========
function initTestimonialCarousel() {
    const container = document.querySelector('.testimonials-carousel');
    if (!container) return;

    const track = container.querySelector('.testimonials-track');
    const cards = track ? track.children : [];
    if (cards.length <= 1) return;

    let currentIndex = 0;

    function showTestimonial(index) {
        if (!track) return;
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    // Auto-rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % cards.length;
        showTestimonial(currentIndex);
    }, 6000);
}


// ========== PRODUCT SLIDER with Browser History ==========
function initProductSlider() {
    const slider = document.querySelector('.products-slider');
    if (!slider) return;

    const track = slider.querySelector('.products-track');
    const slides = track ? track.children : [];
    if (!slides.length) return;

    const prevBtn = slider.querySelector('.slider-prev');
    const nextBtn = slider.querySelector('.slider-next');
    const dotsContainer = slider.querySelector('.slider-dots');
    const counter = slider.querySelector('.slider-counter');

    let currentSlide = 0;
    const totalSlides = slides.length;
    const pageId = slider.dataset.page || 'shop';

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Pagina ' + (i + 1));
            dot.addEventListener('click', () => goToSlide(i, true));
            dotsContainer.appendChild(dot);
        }
    }

    const dots = dotsContainer ? dotsContainer.children : [];

    function updateNav() {
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
        if (counter) counter.textContent = (currentSlide + 1) + ' / ' + totalSlides;

        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === currentSlide);
        }

        // Update URL hash for direct linking
        if (currentSlide > 0) {
            window.history.replaceState({ slide: currentSlide, page: pageId }, '', '#slide-' + (currentSlide + 1));
        } else {
            window.history.replaceState({ slide: 0, page: pageId }, '', window.location.pathname + window.location.search);
        }
    }

    function goToSlide(index, pushHistory) {
        currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        updateNav();

        // Push state to browser history so back/forward buttons work
        if (pushHistory && currentSlide > 0) {
            window.history.pushState({ slide: currentSlide, page: pageId }, '', '#slide-' + (currentSlide + 1));
        }
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1, true);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1, true);
        }
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page === pageId) {
            currentSlide = e.state.slide || 0;
            track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
            updateNav();
        }
    });

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(e.changedTouches[0].screenY - touchStartY);

        // Only trigger if horizontal swipe is greater than vertical
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
            if (diffX > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Check URL hash on load
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
        const slideNum = parseInt(hash.replace('#slide-', '')) - 1;
        if (slideNum >= 0 && slideNum < totalSlides) {
            currentSlide = slideNum;
            window.history.replaceState({ slide: currentSlide, page: pageId }, '', hash);
        }
    }

    updateNav();
}


// ========== INITIALIZE ALL ==========
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initScrollAnimations();
    initLazyLoad();
    initTestimonialCarousel();
    initProductSlider();
    handleNavbarScroll();
});

// Re-init on dynamic content load (if needed)
window.reinitAnimations = function() {
    initScrollAnimations();
};
