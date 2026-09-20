import React from 'react';
import { HeroSection } from './HeroSection';
import { CategoryGrid } from './CategoryGrid';
import { SpecialHighlights } from './SpecialHighlights';
import { ShieldCheck, Clock, Zap, Heart, Star, ArrowRight, Sparkles, Tag, UtensilsCrossed } from 'lucide-react';

export function LandingPage({
  heroSlides = [],
  categories = [],
  foods = [],
  settings = {},
  onOpenAuth,
  onOpenFoodDetail,
  onAddToCart,
  onNavigateToMenu,
  onSelectCategory
}) {
  return (
    <div style={{ backgroundColor: '#FAF7F2' }}>
      {/* 1. Dynamic Hero Banner */}
      <HeroSection
        slides={heroSlides}
        onActionClick={onNavigateToMenu}
        onSelectCategory={onSelectCategory}
      />

      {/* 2. Chef's Signature Recommendations / Special Highlights */}
      <SpecialHighlights
        items={foods}
        onOpenItemDetail={onOpenFoodDetail}
        onAddToCart={onAddToCart}
      />

      {/* 5. Brand Elevation: Why Come To Eat */}
      <section style={{ padding: 'clamp(42px, 6vw, 68px) 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #EAE5DD', borderBottom: '1px solid #EAE5DD' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto clamp(28px, 4vw, 44px)' }}>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 1.9rem)', color: '#8D0A13', marginBottom: '4px' }}>
              {settings?.crafted_subtitle || 'Crafted With Passion'}
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: '#141414', fontWeight: 800 }}>
              {settings?.crafted_title || 'The Come To Eat Promise'}
            </h2>
            <div style={{ width: '48px', height: '4px', backgroundColor: '#FFB800', borderRadius: '2px', margin: '10px auto 0' }} />
          </div>

          <div className="promise-grid">
            <div className="promise-card" style={{ backgroundColor: '#FAF7F2', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #EAE5DD', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFF4D6', color: '#8D0A13', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.02rem', color: '#141414', marginBottom: '6px' }}>
                  {settings?.card1_title || 'Farm-Fresh Ingredients'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.45, margin: 0 }}>
                  {settings?.card1_desc || '100% daily-procured farm produce, organic whole dairy, and authentic slow-simmered spices with zero preservatives.'}
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FAF7F2', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #EAE5DD', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFF4D6', color: '#8D0A13', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Zap size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.02rem', color: '#141414', marginBottom: '6px' }}>
                  {settings?.card2_title || 'Fresh Café Preparation'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.45, margin: 0 }}>
                  {settings?.card2_desc || 'Crafted fresh on order, insulated packaging keeps burgers crispy and hot coolers iced right to your table.'}
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FAF7F2', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #EAE5DD', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFF4D6', color: '#8D0A13', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.02rem', color: '#141414', marginBottom: '6px' }}>
                  {settings?.card3_title || 'Hygienic Café'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.45, margin: 0 }}>
                  {settings?.card3_desc || 'Strict 5-star hygiene benchmarks, temperature-controlled food stations, and contactless café protocols.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Promotional Offer Banner (Welcome Coupon) */}
      <section id="offers" style={{ padding: '60px 0', background: 'linear-gradient(135deg, #6B0007 0%, #8D0A13 100%)', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,184,0,0.2)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.4)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '16px' }}>
            <Tag size={15} /> EXCLUSIVE WELCOME OFFER
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '14px' }}>
            Get 50% OFF Your First Order
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#FAF7F2', lineHeight: 1.6, marginBottom: '28px' }}>
            Create your account today and unlock coupon code <strong style={{ color: '#FFB800' }}>WELCOME50</strong>. Browse our full café menu, customize add-ons, and track real-time delivery.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth('register')}
              style={{
                backgroundColor: '#FFB800',
                color: '#8D0A13',
                padding: '14px 34px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.6)',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 800
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews Social Proof */}
      <section id="reviews" style={{ padding: '70px 0', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            <div className="font-cursive" style={{ fontSize: '1.8rem', color: '#8D0A13' }}>
              Loved by Foodies
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2.2rem', color: '#141414', fontWeight: 800 }}>
              What Our Guests Say
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              {
                name: 'Ananya Deshmukh',
                dish: 'Classic Gourmet Smash Burger',
                comment: 'The crust on the smashed patty was phenomenal! Brioche was warm and buttery. Arrived in just 22 minutes!',
                rating: 5
              },
              {
                name: 'Karan Mehra',
                dish: 'Brown Sugar Tiger Milk Boba',
                comment: 'Legit Taiwanese boba texture — warm and chewy pearls with dark caramel swirls. Come To Eat is our new daily obsession.',
                rating: 5
              },
              {
                name: 'Pooja Hegde',
                dish: 'Steamed Darjeeling Veg Momos',
                comment: 'Thin delicate wrappers, juicy filling, and the fiery garlic chutney has the perfect kick. 10/10 recommend!',
                rating: 5
              }
            ].map((rev, idx) => (
              <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #EAE5DD', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#333333', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
                <div style={{ borderTop: '1px solid #EAE5DD', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#141414' }}>{rev.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#8D0A13', fontWeight: 600 }}>Ordered: {rev.dish}</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFF4D6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8D0A13' }}>
                    <Heart size={14} fill="#8D0A13" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
