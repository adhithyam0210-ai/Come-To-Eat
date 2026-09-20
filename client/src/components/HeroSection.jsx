import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_HERO_SLIDES = [
  {
    id: 'default-1',
    title: 'BURGERS',
    script: 'Gourmet Burgers',
    subtitle: '5 Burger At 199',
    desc: '5 Burger At 199',
    description: '5 Burger At 199',
    tag: 'CHEF SIGNATURE',
    button_text: 'order now',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    target_category: 'Burgers and Sandwiches'
  }
];

export function HeroSection({ slides: slidesProp = [], onSelectCategory, onActionClick }) {
  const [slides, setSlides] = useState(() => {
    if (slidesProp && slidesProp.length > 0) return slidesProp;
    try {
      const raw = localStorage.getItem('cte_cached_hero_slides');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_HERO_SLIDES;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (slidesProp && slidesProp.length > 0) {
      setSlides(slidesProp);
      setCurrentSlide((prev) => (prev >= slidesProp.length ? 0 : prev));
    } else {
      api.get('/hero-slides')
        .then((res) => {
          if (res.success && res.slides && res.slides.length > 0) {
            setSlides(res.slides);
            localStorage.setItem('cte_cached_hero_slides', JSON.stringify(res.slides));
            setCurrentSlide((prev) => (prev >= res.slides.length ? 0 : prev));
          }
        })
        .catch(() => {});
    }
  }, [slidesProp]);

  useEffect(() => {
    const handleLiveSlidesUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setSlides(e.detail);
        localStorage.setItem('cte_cached_hero_slides', JSON.stringify(e.detail));
        setCurrentSlide(0);
      } else {
        api.get('/hero-slides')
          .then((res) => {
            if (res.success && res.slides && res.slides.length > 0) {
              setSlides(res.slides);
              localStorage.setItem('cte_cached_hero_slides', JSON.stringify(res.slides));
              setCurrentSlide(0);
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('cte:hero_slides_updated', handleLiveSlidesUpdate);
    return () => window.removeEventListener('cte:hero_slides_updated', handleLiveSlidesUpdate);
  }, []);

  const nextSlide = () => {
    const activeSlides = (slides && slides.length > 0) ? slides : DEFAULT_HERO_SLIDES;
    if (isTransitioning || activeSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    const activeSlides = (slides && slides.length > 0) ? slides : DEFAULT_HERO_SLIDES;
    if (isTransitioning || activeSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    const activeSlides = (slides && slides.length > 0) ? slides : DEFAULT_HERO_SLIDES;
    if (isPaused || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, currentSlide]);

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

  const activeSlides = (slides && slides.length > 0) ? slides : DEFAULT_HERO_SLIDES;
  const slide = activeSlides[currentSlide] || activeSlides[0] || DEFAULT_HERO_SLIDES[0];
  if (!slide) return null;

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
        background: 'radial-gradient(circle at 65% 45%, #A80D1A 0%, #680008 60%, #450005 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '48px 0 52px'
      }}
    >
      {/* Radial glow overlays */}
      <div 
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,184,0,0.15) 0%, rgba(255,184,0,0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-grid-responsive" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Text Content */}
          <div className="hero-text-col" style={{
            gridColumn: 'span 6',
            opacity: isTransitioning ? 0.4 : 1,
            transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.4s ease, transform 0.4s ease'
          }}>
            {/* Tag Badge */}
            {slide.tag && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 184, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 184, 0, 0.4)',
                color: '#FFB800',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '1.2px',
                marginBottom: '16px',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={14} color="#FFB800" />
                <span>{slide.tag}</span>
              </div>
            )}

            {/* Script Text (Golden Yellow) */}
            <div 
              className="font-cursive hero-script-text" 
              style={{ 
                fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', 
                color: '#FFB800',
                marginBottom: '4px',
                fontWeight: 700
              }}
            >
              {slide.script || 'Taste the Difference in Every Bite'}
            </div>

            {/* Main Title */}
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.08,
              letterSpacing: '-1px',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              {slide.title}
            </h1>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6,
              maxWidth: '540px',
              margin: '0 0 28px 0',
              fontWeight: 400
            }}>
              {slide.desc || slide.desc_text || slide.subtitle || slide.description}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={handleButtonClick}
                style={{
                  backgroundColor: '#FFB800',
                  color: '#000000',
                  border: 'none',
                  padding: '14px 36px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="hero-cta-btn"
              >
                <span>{slide.button_text || 'Order Now'}</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={handleButtonClick}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  padding: '13px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <span>View Menu</span>
              </button>
            </div>
          </div>

          {/* Image Showcase Section with Promo Badges */}
          <div className="hero-img-col" style={{
            gridColumn: 'span 6',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div 
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '580px',
                height: '380px',
                borderRadius: '24px',
                padding: '4px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 184, 0, 0.4)',
                opacity: isTransitioning ? 0.3 : 1,
                transform: isTransitioning ? 'scale(0.97)' : 'scale(1)',
                transition: 'opacity 0.4s ease, transform 0.4s ease'
              }}
            >
              <img
                src={slide.image_url}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '20px',
                  objectFit: 'cover'
                }}
              />

              {/* Top Floating Promo Banner */}
              <div 
                className="desktop-only"
                style={{
                  position: 'absolute',
                  top: '6%',
                  right: '-6%',
                  backgroundColor: '#8D0A13',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '2px solid #FFB800',
                  textAlign: 'center',
                  zIndex: 3
                }}
              >
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#FFB800', fontWeight: 800 }}>
                  SPECIAL COMBOS
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1 }}>
                  FROM <span style={{ color: '#FFB800' }}>₹199</span>
                </div>
              </div>

              {/* Bottom Floating Delivery Badge */}
              <div 
                className="desktop-only"
                style={{
                  position: 'absolute',
                  bottom: '6%',
                  right: '-4%',
                  backgroundColor: '#FFB800',
                  color: '#000000',
                  padding: '10px 18px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  letterSpacing: '0.3px',
                  zIndex: 3
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🛵</span>
                <div>
                  <div style={{ lineHeight: 1.1 }}>FAST DELIVERY</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.85 }}>ACROSS YOUR CITY</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        {slides.length > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '35px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            {/* Slide Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: idx === currentSlide ? '34px' : '10px',
                    height: '10px',
                    borderRadius: '9999px',
                    backgroundColor: idx === currentSlide ? '#FFB800' : 'rgba(255, 255, 255, 0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={prevSlide}
                aria-label="Previous Slide"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={nextSlide}
                aria-label="Next Slide"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
