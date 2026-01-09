
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');
let currentIndex = 0;
let autoSlideTimer;

const updateSlide = (index) => {
    track.style.transform = `translateX(-${index * 100}%)`;
};

// Funcție care resetează și pornește cronometrul
const startAutoSlide = () => {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
    
    autoSlideTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlide(currentIndex);
    }, 10000); // 10 secunde
};

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide(currentIndex);
    startAutoSlide(); // Reset cronometru la click
});

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide(currentIndex);
    startAutoSlide(); // Reset cronometru la click
});

// Pornire inițială
startAutoSlide();