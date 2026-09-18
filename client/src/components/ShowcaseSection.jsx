import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export function ShowcaseSection({ onExploreJuices }) {
  return (
    <section 
      id="fresh-juices"
      style={{
        padding: 'clamp(44px, 6vw, 90px) 0',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Background Watermark Text */}
      <div 
        className="desktop-only"
        style={{
          position: 'absolute',
          top: '50%',
          left: '5%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(6rem, 15vw, 14rem)',
          fontFamily: "'Caveat', cursive",
          fontWeight: 700,
          color: '#FAF6EE',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        yummy
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="showcase-grid">
          {/* Left Column: Juice bottles showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.08)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&w=900&q=80"
                alt="Fresh Fruit Juices and Coolers"
                loading="lazy"
                style={{
                  width: '100%',
                  height: 'clamp(240px, 40vw, 420px)',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              
              {/* Badge overlay */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2A3324',
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <Sparkles size={14} color="#85926B" /> 100% Real Fruit Pulp
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Typography matching Image 4 */}
          <div className="showcase-text-box" style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
            {/* Script subtitle */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: '#85926B',
              marginBottom: '6px',
              letterSpacing: '0.5px'
            }}>
              Drink for Health
            </div>

            {/* Bold Headline */}
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.7rem, 3.6vw, 2.8rem)',
              fontWeight: 700,
              color: '#2A3324',
              lineHeight: 1.2,
              marginBottom: '12px'
            }}>
              Fresh Fruit Juices & Coolers
            </h2>

            {/* Ornament Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto 18px' }}>
              <div style={{ width: '36px', height: '1px', backgroundColor: '#CBD4C0' }} />
              <Sparkles size={14} color="#85926B" />
              <div style={{ width: '36px', height: '1px', backgroundColor: '#CBD4C0' }} />
            </div>

            <p style={{
              color: '#5C6553',
              fontSize: '0.94rem',
              lineHeight: 1.65,
              marginBottom: '24px'
            }}>
              Cold-pressed fresh daily with zero artificial sweeteners. Sip on farm-picked Valencia oranges, sweet Alphonso mangoes, crushed garden mint, and invigorating watermelon coolers packed with natural vitamins.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={onExploreJuices}
                style={{
                  backgroundColor: '#E76F51',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 20px rgba(231, 111, 81, 0.35)',
                  transition: 'all 0.25s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>Explore Coolers & Beverages</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
