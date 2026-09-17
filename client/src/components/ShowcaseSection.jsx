import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export function ShowcaseSection({ onExploreJuices }) {
  return (
    <section 
      id="fresh-juices"
      style={{
        padding: '90px 0',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Background Watermark Text inspired by Image 4 ("yummy") */}
      <div style={{
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
      }}>
        yummy
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          alignItems: 'center',
          gap: 'clamp(24px, 4vw, 50px)'
        }}>
          {/* Left Column: Authentic bottles of juice visual matching Image 4 */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&w=900&q=80"
                alt="Fresh Fruit Juices and Coolers"
                loading="lazy"
                style={{
                  width: '100%',
                  height: 'clamp(280px, 45vw, 420px)',
                  objectFit: 'cover'
                }}
              />
              
              {/* Badge overlay */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2A3324',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <Sparkles size={15} color="#85926B" /> 100% Real Fruit Pulp
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Typography matching Image 4 */}
          <div style={{ maxWidth: '520px' }}>
            {/* Script subtitle matching Image 4 ("Drink for Health") */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: '#85926B',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              Drink for Health
            </div>

            {/* Bold Headline matching Image 4 */}
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#2A3324',
              lineHeight: 1.15,
              marginBottom: '14px'
            }}>
              Fresh Fruit Juices & Coolers
            </h2>

            {/* Ornament Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#CBD4C0' }} />
              <Sparkles size={15} color="#85926B" />
              <div style={{ width: '40px', height: '1px', backgroundColor: '#CBD4C0' }} />
            </div>

            <p style={{
              color: '#5C6553',
              fontSize: '1.02rem',
              lineHeight: 1.7,
              marginBottom: '32px'
            }}>
              Cold-pressed fresh daily with zero artificial sweeteners. Sip on farm-picked Valencia oranges, sweet Alphonso mangoes, crushed garden mint, and invigorating watermelon coolers packed with natural vitamins.
            </p>

            <button
              onClick={onExploreJuices}
              style={{
                backgroundColor: '#E76F51',
                color: '#FFFFFF',
                padding: '14px 32px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.98rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 20px rgba(231, 111, 81, 0.35)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Explore Coolers & Beverages</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
