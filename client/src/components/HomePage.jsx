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

      {/* 3. Brand Promise Section ("Why Come To Eat") */}
      <section style={{ padding: 'clamp(42px, 6vw, 68px) 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #ECE7DE', borderBottom: '1px solid #ECE7DE' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto clamp(28px, 4vw, 44px)' }}>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 1.9rem)', color: '#85926B', marginBottom: '4px' }}>
              Crafted With Passion
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: '#1F241C', fontWeight: 700 }}>
              The Come To Eat Promise
            </h2>
            <div style={{ width: '48px', height: '3px', backgroundColor: '#85926B', borderRadius: '2px', margin: '10px auto 0' }} />
          </div>

          <div className="promise-grid">
            <div className="promise-card" style={{ backgroundColor: '#FAF8F5', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#EBF0E4', color: '#475234', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1F241C', marginBottom: '6px' }}>Farm-Fresh Ingredients</h4>
                <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.45, margin: 0 }}>
                  100% daily-procured farm produce, organic whole dairy, and authentic slow-simmered spices with zero preservatives.
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FAF8F5', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#EBF0E4', color: '#475234', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Zap size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1F241C', marginBottom: '6px' }}>Fresh Café Preparation</h4>
                <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.45, margin: 0 }}>
                  Crafted fresh on order, insulated packaging keeps burgers crispy and hot coolers iced right to your table.
                </p>
              </div>
            </div>

            <div className="promise-card" style={{ backgroundColor: '#FAF8F5', padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '16px', textAlign: 'center', border: '1px solid #ECE7DE', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="promise-card-icon" style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#EBF0E4', color: '#475234', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: '#1F241C', marginBottom: '6px' }}>Hygienic Café</h4>
                <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.45, margin: 0 }}>
                  Strict 5-star hygiene benchmarks, temperature-controlled food stations, and contactless café protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customer Reviews & Community Feedback Section */}
      <section style={{ padding: 'clamp(44px, 6vw, 72px) 0', backgroundColor: '#FAF8F5' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto clamp(28px, 4vw, 44px)' }}>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2rem)', color: '#85926B', marginBottom: '4px' }}>
              Loved By Foodies
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#1F241C', fontWeight: 700 }}>
              Customer Reviews & Experiences
            </h2>
            <div style={{ width: '48px', height: '3px', backgroundColor: '#85926B', borderRadius: '2px', margin: '10px auto 14px' }} />
            <p style={{ color: '#6A7463', fontSize: '0.94rem' }}>
              Real feedback from customers who enjoy our fresh smash burgers, steaming momos, stone-baked pizzas, and boba teas.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
            marginBottom: '36px'
          }}>
            {[
              {
                name: 'Alex Rivera',
                dish: 'Classic Gourmet Smash Burger',
                rating: 5,
                text: 'One of the juiciest smash burgers in town! The crust on the patty was crispy and seasoned to perfection. Bun was soft, buttery, and arrived steaming hot.',
                verified: true
              },
              {
                name: 'Meera Kapoor',
                dish: 'Brown Sugar Tiger Milk Boba',
                rating: 5,
                text: 'Warm chewy brown sugar pearls and rich organic milk. Way better than generic franchise bubble tea. You can taste the real slow-simmered caramel!',
                verified: true
              },
              {
                name: 'David Chen',
                dish: 'Steamed Darjeeling Veg Momos',
                rating: 5,
                text: 'Thin delicate skin and packed with fresh herbs. The spicy roasted tomato chutney is fiery and addictive! Ordered 3 times this week.',
                verified: true
              },
              {
                name: 'Pooja Hegde',
                dish: 'Classic Margherita Pizza',
                rating: 5,
                text: 'Stone-baked with blistering leopard crust. Sweet San Marzano sauce and gooey fresh mozzarella. Authentic Italian taste in every bite.',
                verified: true
              }
            ].map((rev, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
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
                        <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> Verified Order
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#85926B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                  }}>
                    {rev.dish}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#475234', lineHeight: 1.55, margin: '0 0 16px' }}>
                    "{rev.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #F0F4E8', paddingTop: '12px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#85926B',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F241C' }}>{rev.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#7E8775' }}>Verified Customer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onNavigateToReviews}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#475234',
                border: '1.5px solid #85926B',
                padding: '12px 28px',
                borderRadius: '9999px',
                fontSize: '0.94rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(133, 146, 107, 0.15)'
              }}
            >
              <MessageSquare size={16} />
              <span>Read All Customer Reviews</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Promotional Banner Callout */}
      <section style={{ padding: '60px 0', backgroundColor: '#85926B', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '16px' }}>
            <Tag size={15} /> EXCLUSIVE WELCOME OFFER
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '14px' }}>
            Get 50% OFF Your First Order
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#F2F6ED', lineHeight: 1.6, marginBottom: '28px' }}>
            Use coupon code <strong>WELCOME50</strong> at checkout to unlock flat 50% discount on your first meal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onNavigateToMenu}
              style={{
                backgroundColor: '#E76F51',
                color: '#FFFFFF',
                padding: '14px 34px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>Explore Café Menu</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onNavigateToOffers}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.6)',
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
