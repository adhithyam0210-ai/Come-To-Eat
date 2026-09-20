import React from 'react';
import { HeroSection } from './HeroSection';
import { SpecialHighlights } from './SpecialHighlights';
import { ShieldCheck, Zap, Sparkles, ArrowRight, Tag, Star, CheckCircle2, MessageSquare } from 'lucide-react';

export function HomePage({
  heroSlides = [],
  foods = [],
  onNavigateToMenu,
  onNavigateToOffers,
  onNavigateToReviews,
  onSelectCategory,
  onOpenItemDetail,
  onAddToCart
}) {
  return (
    <div>
      {/* 1. Dynamic Hero Banner Blended Seamlessly into the Page */}
      <HeroSection
        slides={heroSlides}
        onActionClick={onNavigateToMenu}
        onSelectCategory={onSelectCategory}
      />

      {/* 2. Chef's Special Highlights / Signature Dishes */}
      <SpecialHighlights
        items={foods}
        onOpenItemDetail={onOpenItemDetail}
        onAddToCart={onAddToCart}
      />

      {/* 3. Brand Promise Section ("WHY CHOOSE US?") matching reference UI */}
      <section style={{ padding: 'clamp(44px, 6vw, 72px) 0', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto clamp(28px, 4vw, 44px)' }}>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 1.9rem)', color: '#8D0A13', fontWeight: 700, marginBottom: '2px' }}>
              Crafted With Passion
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: '#1A1D20', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              WHY CHOOSE US?
            </h2>
            <div style={{ width: '48px', height: '3.5px', backgroundColor: '#8D0A13', borderRadius: '2px', margin: '10px auto 0' }} />
          </div>

          <div className="promise-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="promise-card" style={{ backgroundColor: '#FFFFFF', padding: '24px 20px', borderRadius: '18px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
              <div className="promise-card-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#161616', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <Sparkles size={22} color="#FFB800" />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1A1D20', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.3px' }}>PREMIUM QUALITY</h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626A', lineHeight: 1.45, margin: 0 }}>
                  100% fresh ingredients crafted to perfection with zero preservatives.
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FFFFFF', padding: '24px 20px', borderRadius: '18px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
              <div className="promise-card-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#161616', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <Zap size={22} color="#FFB800" />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1A1D20', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.3px' }}>FAST & HOT DELIVERY</h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626A', lineHeight: 1.45, margin: 0 }}>
                  Lightning-fast delivery across your city in insulated thermal bags.
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FFFFFF', padding: '24px 20px', borderRadius: '18px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
              <div className="promise-card-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#161616', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <Tag size={22} color="#FFB800" />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1A1D20', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.3px' }}>BEST VALUE COMBOS</h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626A', lineHeight: 1.45, margin: 0 }}>
                  Delicious meal combos that fit your pocket with unbeatable value.
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FFFFFF', padding: '24px 20px', borderRadius: '18px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
              <div className="promise-card-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#161616', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <ShieldCheck size={22} color="#FFB800" />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1A1D20', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.3px' }}>MADE WITH PASSION</h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626A', lineHeight: 1.45, margin: 0 }}>
                  Passion in every bite, happiness every time you dine with us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customer Reviews Section matching reference UI */}
      <section style={{ padding: 'clamp(44px, 6vw, 72px) 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto clamp(28px, 4vw, 44px)' }}>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2rem)', color: '#8D0A13', fontWeight: 700, marginBottom: '4px' }}>
              Loved By Foodies
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#1A1D20', fontWeight: 900, textTransform: 'uppercase' }}>
              WHAT OUR CUSTOMERS SAY
            </h2>
            <div style={{ width: '48px', height: '3.5px', backgroundColor: '#8D0A13', borderRadius: '2px', margin: '10px auto 14px' }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
            marginBottom: '36px'
          }}>
            {[
              {
                name: 'Ahmed R.',
                dish: 'Classic Gourmet Smash Burger',
                rating: 5,
                text: 'The best burgers in town! Juiciness, flavor and always delivered hot. Love it!',
                verified: true
              },
              {
                name: 'Sara K.',
                dish: 'Loaded Fries & Boba Combo',
                rating: 5,
                text: 'Super fast delivery and amazing taste. My go-to burger place!',
                verified: true
              },
              {
                name: 'Jason D.',
                dish: 'District Double Beef Burger',
                rating: 5,
                text: 'Great combos, great prices and even better quality. Highly recommend!',
                verified: true
              },
              {
                name: 'Pooja H.',
                dish: 'Spicy Crunch Chicken Burger',
                rating: 5,
                text: 'Crispy chicken patty with bold spicy sauce. Absolute perfection every single time.',
                verified: true
              }
            ].map((rev, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FAF7F2',
                  borderRadius: '18px',
                  padding: '22px',
                  border: '1px solid #ECE7DE',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="#FFB800" color="#FFB800" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#8D0A13',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}>
                    {rev.dish}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#3A4149', lineHeight: 1.55, margin: '0 0 16px', fontWeight: 500 }}>
                    "{rev.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #EBE4D8', paddingTop: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#8D0A13',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1A1D20' }}>— {rev.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6E7781' }}>Verified Foodie</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onNavigateToReviews}
              style={{
                backgroundColor: '#8D0A13',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '9999px',
                fontSize: '0.94rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(141, 10, 19, 0.3)'
              }}
            >
              <MessageSquare size={16} />
              <span>View All Reviews</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Dark Delivery Highlight Banner matching reference UI */}
      <section style={{ padding: '36px 0', backgroundColor: '#121417', color: '#FFFFFF' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>🛵</span>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.5px', color: '#FFFFFF' }}>FAST DELIVERY</div>
                <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 700 }}>30-45 MINS</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={22} color="#FFB800" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.5px', color: '#FFFFFF' }}>LIVE TRACKING</div>
                <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 700 }}>TRACK YOUR ORDER</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="#FFB800" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.5px', color: '#FFFFFF' }}>SAFE & SECURE</div>
                <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 700 }}>CONTACTLESS DELIVERY</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={22} color="#FFB800" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.5px', color: '#FFFFFF' }}>WIDE COVERAGE</div>
                <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 700 }}>ACROSS YOUR CITY</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Promotional Banner Callout */}
      <section style={{ padding: '60px 0', background: 'radial-gradient(circle, #A80D1A 0%, #680008 100%)', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,184,0,0.2)', color: '#FFB800', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '16px', border: '1px solid rgba(255,184,0,0.4)' }}>
            <Tag size={15} color="#FFB800" /> EXCLUSIVE WELCOME OFFER
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: '14px', textTransform: 'uppercase' }}>
            Get 50% OFF Your First Order
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, marginBottom: '28px' }}>
            Use coupon code <strong style={{ color: '#FFB800' }}>WELCOME50</strong> at checkout to unlock flat 50% discount on your first meal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onNavigateToMenu}
              style={{
                backgroundColor: '#FFB800',
                color: '#000000',
                padding: '14px 34px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 800,
                border: 'none',
                boxShadow: '0 8px 24px rgba(255,184,0,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>Order Now</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onNavigateToOffers}
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.5)',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View All Offers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
