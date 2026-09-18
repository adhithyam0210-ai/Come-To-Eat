import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: 'ORGANIC BLEND',
    script: 'Healthy Smoothie',
    title: 'Good Food. Good Mood. Come To Eat.',
    desc: 'Crafted with ripe hand-picked fruits, Greek yogurt, and pure mountain honey. Fuel your day with vibrant goodness and irresistible freshness.',
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
    button_text: 'Explore Menu',
    bg_color: '#949E7C',
    accent_text: 'Fresh Strawberries & Mint',
    target_category: 'Cold Beverages'
  },
  {
    id: 2,
    tag: 'CHEF SIGNATURE',
    script: 'Gourmet Burgers',
    title: 'Flame-Grilled Juicy Smash Burgers',
    desc: 'Double crisp-edged patties, molten aged cheddar, caramelized butter onions, and house secret sauce on warm toasted brioche buns.',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    button_text: 'Explore Burgers',
    bg_color: '#8B9474',
    accent_text: 'Melted Cheddar & Brioche',
    target_category: 'Burgers and Sandwiches'
  },
  {
    id: 3,
    tag: 'TAIWANESE AUTHENTIC',
    script: 'Tiger Milk Boba',
    title: 'Brown Sugar Tapioca Bubble Tea',
    desc: 'Slow-simmered dark caramel streaks, organic fresh dairy, and warm chewy tapioca pearls brewed fresh every single morning.',
    image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=900&q=80',
    button_text: 'Taste Boba',
    bg_color: '#969F82',
    accent_text: 'Warm Chewy Pearls',
    target_category: 'Boba Tea'
  }
];

export function HeroSection({ slides: slidesProp, onSelectCategory, onActionClick }) {
  const [slides, setSlides] = useState(() => {
    if (slidesProp && slidesProp.length > 0) return slidesProp;
    try {
      const saved = localStorage.getItem('cte_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SLIDES;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync with prop slides or fetch
  useEffect(() => {
    if (slidesProp && slidesProp.length > 0) {
      setSlides(slidesProp);
      setCurrentSlide((prev) => (prev >= slidesProp.length ? 0 : prev));
    } else {
      api.get('/hero-slides')
        .then((res) => {
          if (res.success && res.slides && res.slides.length > 0) {
            setSlides(res.slides);
            setCurrentSlide((prev) => (prev >= res.slides.length ? 0 : prev));
          }
        })
        .catch(() => {});
    }
  }, [slidesProp]);

  // Listen to global live updates for hero slides
  useEffect(() => {
    const handleLiveSlidesUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setSlides(e.detail);
        setCurrentSlide(0);
      } else {
        api.get('/hero-slides')
          .then((res) => {
            if (res.success && res.slides && res.slides.length > 0) {
              setSlides(res.slides);
              setCurrentSlide(0);
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('cte:hero_slides_updated', handleLiveSlidesUpdate);
    return () => window.removeEventListener('cte:hero_slides_updated', handleLiveSlidesUpdate);
  }, []);

  // Safe slide navigation
  const nextSlide = () => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  // Auto slide timer (pauses on user hover)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const slide = slides[currentSlide] || slides[0] || DEFAULT_SLIDES[0];

  const handleButtonClick = () => {
    if (onActionClick) {
      onActionClick(slide);
    } else if (onSelectCategory && slide.target_category) {
      onSelectCategory(slide.target_category);
    }
  };

  return (
    <section 
      id="home"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="hero-section-box"
      style={{
        backgroundColor: slide.bg_color || '#85926B',
        backgroundImage: `radial-gradient(circle at 90% 10%, rgba(255, 245, 215, 0.25) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(0, 0, 0, 0.14) 0%, transparent 50%)`,
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Decorative Botanical Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.08,
        backgroundImage: `radial-gradient(#FFFFFF 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-main-grid">
          {/* Left Column: Typography & CTAs */}
          <div 
            className="hero-text-container"
            style={{ 
              opacity: isTransitioning ? 0.75 : 1,
              transform: isTransitioning ? 'translateY(4px)' : 'translateY(0)',
              transition: 'opacity 0.35s ease, transform 0.35s ease'
            }}
          >
            {slide.tag && (
              <div className="hero-tag-badge">
                <Sparkles size={13} /> {slide.tag}
              </div>
            )}

            {/* Cursive script headline */}
            {slide.script && (
              <div className="hero-script-heading">
                {slide.script}
              </div>
            )}

            {/* Bold serif title */}
            <h1 className="hero-title-heading">
              {slide.title}
            </h1>

            {(slide.desc || slide.desc_text) && (
              <p className="hero-desc-para">
                {slide.desc || slide.desc_text}
              </p>
            )}

            {/* CTA & Slide Indicators */}
            <div className="hero-actions-container">
              <button
                onClick={handleButtonClick}
                style={{
                  backgroundColor: '#E76F51',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(231, 111, 81, 0.45)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  border: 'none',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>{slide.button_text || 'Order Now'}</span>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowRight size={13} />
                </div>
              </button>

              {/* Navigation Indicators & Prev/Next Arrows */}
              {slides.length > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {/* Prev Button */}
                  <button
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(6px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.38)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
                  >
                    <ChevronLeft size={17} />
                  </button>

                  {/* Bullet Dots */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {slides.map((s, idx) => (
                      <button
                        key={s.id || idx}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        style={{
                          width: currentSlide === idx ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '10px',
                          backgroundColor: currentSlide === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.35s ease',
                          padding: 0
                        }}
                      />
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(6px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.38)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="hero-img-container">
            <div 
              className="hero-img-wrapper"
              style={{
                opacity: isTransitioning ? 0.75 : 1,
                transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                transition: 'opacity 0.35s ease, transform 0.35s ease'
              }}
            >
              <img
                key={slide.id || currentSlide}
                src={slide.image_url || slide.image}
                alt={slide.title}
                loading="eager"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

