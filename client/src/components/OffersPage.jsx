import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Tag, ExternalLink, Gift, Building } from 'lucide-react';
import { api } from '../utils/api';

export function OffersPage({ onNavigateToMenu, onSelectCategory, selectedBranch }) {
  const [offerBanners, setOfferBanners] = useState([
    {
      id: 1,
      title: 'Flat 50% OFF First Order',
      tag: 'WELCOME SPECIAL',
      description: 'Unlock 50% discount on gourmet smash burgers, momos, and fresh coolers prepared live.',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      button_text: 'Order Burgers Now',
      target_category: 'Burgers and Sandwiches',
      bg_color: '#85926B'
    },
    {
      id: 2,
      title: 'Free Boba Topping & Drink Upgrade',
      tag: 'BOBA FESTIVAL',
      description: 'Buy any signature Brown Sugar Tiger Boba and receive a complimentary cheese foam top layer.',
      image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&auto=format&fit=crop&q=80',
      button_text: 'Explore Boba Drinks',
      target_category: 'Boba Tea',
      bg_color: '#3D4636'
    },
    {
      id: 3,
      title: 'Darjeeling Momo Platter Combo',
      tag: 'SNACKING BUNDLE',
      description: 'Order 2 Momo plates & get 1 fresh Lime Mojito completely free with rapid table delivery.',
      image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80',
      button_text: 'View Momo Combos',
      target_category: 'Momos',
      bg_color: '#E76F51'
    }
  ]);
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const branchParam = selectedBranch?.id ? `?branch_id=${selectedBranch.id}` : '';
    Promise.all([
      api.get(`/offers${branchParam}`).catch(() => ({ success: false })),
      api.get('/coupons/active').catch(() => ({ success: false }))
    ]).then(([offersRes, couponsRes]) => {
      if (offersRes && offersRes.success && offersRes.offers && offersRes.offers.length > 0) {
        setOfferBanners(offersRes.offers);
      }
      if (couponsRes && couponsRes.success && couponsRes.coupons) {
        setCoupons(couponsRes.coupons);
      }
    }).finally(() => setLoading(false));
  }, [selectedBranch]);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const handleBannerAction = (banner) => {
    if (banner.target_category && onSelectCategory) {
      onSelectCategory({ name: banner.target_category, slug: banner.target_category.toLowerCase().replace(/\s+/g, '-') });
    } else if (onNavigateToMenu) {
      onNavigateToMenu();
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* Offers Page Header */}
      <div style={{
        position: 'relative',
        backgroundColor: '#1E251B',
        color: '#FFFFFF',
        padding: 'clamp(44px, 6vw, 72px) 0 clamp(44px, 6vw, 80px)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #1E251B 0%, #2A3626 70%, #FAF8F5 100%)',
          pointerEvents: 'none'
        }} />

        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231, 111, 81, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '720px' }}>
          {selectedBranch && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#D4E2C7',
              marginBottom: '12px'
            }}>
              <Building size={14} /> Branch Offers: {selectedBranch.name}
            </div>
          )}

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(231, 111, 81, 0.25)',
            border: '1px solid rgba(231, 111, 81, 0.4)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#FFBFA8',
            marginBottom: '14px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Exclusive Promotions & Culinary Deals
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 700,
            lineHeight: 1.18,
            color: '#FFFFFF',
            margin: '0 0 14px'
          }}>
            Featured Café Offers
          </h1>

          <p style={{
            color: '#D4DEC8',
            fontSize: 'clamp(0.95rem, 2vw, 1.12rem)',
            lineHeight: 1.6,
            margin: '0 0 24px'
          }}>
            Explore live promotional banners and special café discounts available at {selectedBranch ? selectedBranch.name : 'our outlets'}. Click any offer to jump straight into the menu!
          </p>

          <button
            onClick={onNavigateToMenu}
            style={{
              backgroundColor: '#E76F51',
              color: '#FFFFFF',
              border: 'none',
              padding: '13px 30px',
              borderRadius: '24px',
              fontSize: '0.96rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(231, 111, 81, 0.4)'
            }}
          >
            <span>Browse Full Menu</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Visual Hero Banner Style Offer Cards */}
      <div className="container" style={{ marginTop: '36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {offerBanners.map((banner) => (
            <div
              key={banner.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #ECE7DE',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
              className="offer-card-hover"
            >
              <div>
                {/* Banner Image Container */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  backgroundColor: banner.bg_color || '#3D4636',
                  overflow: 'hidden'
                }}>
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <Gift size={48} opacity={0.4} />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)'
                  }} />

                  {/* Tag Badge */}
                  {banner.tag && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(231, 111, 81, 0.95)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '5px 14px',
                      borderRadius: '20px',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      {banner.tag}
                    </div>
                  )}
                </div>

                {/* Banner Text Content */}
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#1F241C',
                    marginBottom: '10px',
                    lineHeight: 1.25
                  }}>
                    {banner.title}
                  </h3>

                  <p style={{
                    fontSize: '0.9rem',
                    color: '#65705C',
                    lineHeight: 1.55,
                    margin: 0
                  }}>
                    {banner.description}
                  </p>
                </div>
              </div>

              {/* Redirect Link CTA Button */}
              <div style={{ padding: '0 24px 24px' }}>
                <button
                  onClick={() => handleBannerAction(banner)}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: '16px',
                    backgroundColor: '#85926B',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(133, 146, 107, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#74815A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#85926B')}
                >
                  <span>{banner.button_text || 'Claim Offer & Order'}</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Promo Codes Section */}
        {coupons.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EBF0E4',
                color: '#475234',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '10px'
              }}>
                <Tag size={14} color="#85926B" /> Instant Checkout Promos
              </div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: '#1F241C',
                fontWeight: 800,
                margin: 0
              }}>
                Available Café Coupons
              </h2>
              <p style={{ color: '#65705C', fontSize: '0.92rem', marginTop: '6px' }}>
                Copy any promo code below and apply it in your bag for immediate bill discounts
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {coupons.map((cp) => (
                <div
                  key={cp.id || cp.code}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1.5px dashed #85926B',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        backgroundColor: '#F3F6EE',
                        color: '#324022',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        letterSpacing: '1px'
                      }}>
                        {cp.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(cp.code)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '10px',
                          backgroundColor: copiedCode === cp.code ? '#2E7D32' : '#85926B',
                          color: '#FFFFFF',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {copiedCode === cp.code ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>

                    <div style={{
                      fontWeight: 800,
                      fontSize: '1.35rem',
                      color: '#E76F51',
                      marginBottom: '6px'
                    }}>
                      {cp.discount_type === 'percentage'
                        ? `Flat ${cp.discount_value}% OFF`
                        : `Flat ₹${cp.discount_value} OFF`}
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#65705C', margin: 0, lineHeight: 1.45 }}>
                      {cp.min_order_value > 0
                        ? `Valid on orders above ₹${cp.min_order_value}`
                        : 'Valid on all order amounts'}
                      {cp.max_discount > 0 && cp.discount_type === 'percentage'
                        ? ` (Max savings ₹${cp.max_discount})`
                        : ''}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid #F0F4E8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: '#7E8775'
                  }}>
                    <span>
                      {(cp.end_date || cp.expires_at)
                        ? `Expires: ${cp.end_date || cp.expires_at}`
                        : 'Limited Time Café Offer'}
                    </span>
                    <span style={{ color: '#2E7D32', fontWeight: 700 }}>● Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
