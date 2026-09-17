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
    <div style={{ backgroundColor: '#FAF8F5' }}>
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
      <section style={{ padding: 'clamp(42px, 6vw, 68px) 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #ECE7DE', borderBottom: '1px solid #ECE7DE' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto clamp(28px, 4vw, 44px)' }}>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 1.9rem)', color: '#85926B', marginBottom: '4px' }}>
              {settings?.crafted_subtitle || 'Crafted With Passion'}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: '#1F241C', fontWeight: 700 }}>
              {settings?.crafted_title || 'The Come To Eat Promise'}
            </h2>
            <div style={{ width: '48px', height: '3px', backgroundColor: '#85926B', borderRadius: '2px', margin: '10px auto 0' }} />
          </div>

          <div className="promise-grid">
            <div className="promise-card" style={{ backgroundColor: '#FAF8F5', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#EBF0E4', color: '#475234', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1F241C', marginBottom: '6px' }}>
                  {settings?.card1_title || 'Farm-Fresh Ingredients'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.45, margin: 0 }}>
                  {settings?.card1_desc || '100% daily-procured farm produce, organic whole dairy, and authentic slow-simmered spices with zero preservatives.'}
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FAF8F5', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#EBF0E4', color: '#475234', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Zap size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1F241C', marginBottom: '6px' }}>
                  {settings?.card2_title || 'Fresh Café Preparation'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.45, margin: 0 }}>
                  {settings?.card2_desc || 'Crafted fresh on order, insulated packaging keeps burgers crispy and hot coolers iced right to your table.'}
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FAF8F5', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#EBF0E4', color: '#475234', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1F241C', marginBottom: '6px' }}>
                  {settings?.card3_title || 'Hygienic Café'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.45, margin: 0 }}>
                  {settings?.card3_desc || 'Strict 5-star hygiene benchmarks, temperature-controlled food stations, and contactless café protocols.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Promotional Offer Banner (Welcome Coupon) */}
      <section id="offers" style={{ padding: '60px 0', backgroundColor: '#85926B', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '16px' }}>
            <Tag size={15} /> EXCLUSIVE WELCOME OFFER
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '14px' }}>
            Get 50% OFF Your First Order
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#F2F6ED', lineHeight: 1.6, marginBottom: '28px' }}>
            Create your account today and unlock coupon code <strong>WELCOME50</strong>. Browse our full 29-dish café menu, customize add-ons, and track real-time delivery.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth('register')}
              style={{
                backgroundColor: '#E76F51',
                color: '#FFFFFF',
                padding: '14px 34px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
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
                fontWeight: 700
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews Social Proof */}
      <section id="reviews" style={{ padding: '70px 0', backgroundColor: '#FAF8F5' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            <div className="font-cursive" style={{ fontSize: '1.8rem', color: '#85926B' }}>
              Loved by Foodies
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#1F241C', fontWeight: 700 }}>
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
              <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #ECE7DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4A5538', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
                <div style={{ borderTop: '1px solid #F0EFEB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F241C' }}>{rev.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#85926B' }}>Ordered: {rev.dish}</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EBF0E4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#85926B' }}>
                    <Heart size={14} fill="#85926B" />
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
