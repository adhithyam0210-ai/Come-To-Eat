import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
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
  const [slides, setSlides] = useState(slidesProp && slidesProp.length > 0 ? slidesProp : DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sync with prop slides or fetch
  useEffect(() => {
    if (slidesProp && slidesProp.length > 0) {
      setSlides(slidesProp);
    } else {
      api.get('/hero-slides')
        .then((res) => {
          if (res.success && res.slides && res.slides.length > 0) {
            setSlides(res.slides);
          }
        })
        .catch(() => {});
    }
  }, [slidesProp]);

  // Auto slide timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

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
      style={{
        position: 'relative',
        backgroundColor: slide.bg_color || '#85926B',
        color: '#FFFFFF',
        overflow: 'hidden',
        transition: 'background-color 0.8s ease',
        padding: 'clamp(28px, 3.5vw, 42px) 0 clamp(30px, 4vw, 46px)',
        borderBottomLeftRadius: 'clamp(24px, 4vw, 36px)',
        borderBottomRightRadius: 'clamp(24px, 4vw, 36px)'
      }}
    >
      {/* Ambient Lighting Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '10%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 245, 215, 0.28) 0%, transparent 65%)',
        filter: 'blur(35px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '8%',
        left: '5%',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 0, 0, 0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: 'clamp(24px, 4vw, 56px)'
        }}>
          {/* Left Column: Typography & CTAs */}
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '14px',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={13} /> {slide.tag}
            </div>

            {/* Cursive script headline */}
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              color: '#F4F8EC',
              lineHeight: 1.05,
              marginBottom: '6px',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              {slide.script}
            </div>

            {/* Bold serif title */}
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.9rem, 4.5vw, 3.2rem)',
              fontWeight: 700,
              lineHeight: 1.16,
              letterSpacing: '-0.5px',
              color: '#FFFFFF',
              marginBottom: '14px'
            }}>
              {slide.title}
            </h1>

            <p style={{
              fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
              lineHeight: 1.6,
              color: '#F0F4E8',
              opacity: 0.95,
              marginBottom: '28px'
            }}>
              {slide.desc}
            </p>

            {/* CTA & Slide Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={handleButtonClick}
                style={{
                  backgroundColor: '#E76F51',
                  color: '#FFFFFF',
                  padding: '13px 30px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(231, 111, 81, 0.45)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>{slide.button_text || 'Order Now'}</span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase (Image-Adaptive Card) */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            order: window.innerWidth < 640 ? -1 : 0
          }}>
            <div style={{
              position: 'relative',
              width: 'fit-content',
              maxWidth: 'min(100%, 680px)',
              margin: '0 auto',
              borderRadius: 'clamp(18px, 3.2vw, 26px)',
              overflow: 'hidden',
              boxShadow: '0 16px 44px rgba(20, 28, 16, 0.38)',
              border: '2.5px solid rgba(255, 255, 255, 0.65)',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={slide.image_url || slide.image}
                alt={slide.title}
                style={{
                  width: 'auto',
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: 'clamp(280px, 58vh, 540px)',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 'clamp(16px, 3vw, 24px)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
