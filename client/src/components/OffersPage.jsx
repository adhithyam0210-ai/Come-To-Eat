import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles, Clock, ArrowRight, Percent, Gift } from 'lucide-react';
import { api } from '../utils/api';

export function OffersPage({ onNavigateToMenu, onApplyCoupon }) {
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'WELCOME50',
      discount_type: 'percentage',
      discount_value: 50,
      min_order_value: 299,
      max_discount: 150,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      description: '50% OFF up to ₹150 on your very first order at Come To Eat'
    },
    {
      id: 2,
      code: 'COMEFREE',
      discount_type: 'free_delivery',
      discount_value: 40,
      min_order_value: 199,
      max_discount: 40,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      description: 'Zero delivery charge on orders above ₹199'
    },
    {
      id: 3,
      code: 'TASTY20',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_value: 399,
      max_discount: 100,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      description: '20% OFF up to ₹100 on weekend cravings'
    },
    {
      id: 4,
      code: 'BURGERFEST',
      discount_type: 'fixed',
      discount_value: 75,
      min_order_value: 449,
      max_discount: 75,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      description: 'Flat ₹75 OFF on all burger & sides combos'
    }
  ]);

  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    api.get('/coupons/active')
      .then((res) => {
        if (res.success && res.coupons && res.coupons.length > 0) {
          setCoupons(res.coupons);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Offers Page Header */}
      <div style={{
        position: 'relative',
        backgroundColor: '#1E251B',
        color: '#FFFFFF',
        padding: 'clamp(40px, 6vw, 70px) 0 clamp(44px, 6vw, 80px)',
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

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(231, 111, 81, 0.25)',
            border: '1px solid rgba(231, 111, 81, 0.4)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#FFBFA8',
            marginBottom: '14px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Exclusive Promotions & Discounts
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.18,
            color: '#FFFFFF',
            margin: '0 0 14px'
          }}>
            Offers, Coupons & Deals
          </h1>

          <p style={{
            color: '#D4DEC8',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            lineHeight: 1.6,
            margin: '0 0 24px'
          }}>
            Save big on your favorite smash burgers, authentic momos, Taiwanese boba, and stone-baked pizzas. Copy any coupon code below to apply at checkout.
          </p>

          <button
            onClick={onNavigateToMenu}
            style={{
              backgroundColor: '#E76F51',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '24px',
              fontSize: '0.94rem',
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

      {/* Coupons List */}
      <div className="container" style={{ marginTop: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {coupons.map((cp) => {
            const isCopied = copiedCode === cp.code;
            return (
              <div
                key={cp.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '22px',
                  border: '1.5px dashed #D2DDD0',
                  padding: '24px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Accent corner decorative pill */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: '#EBF0E4',
                  color: '#475234',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 14px',
                  borderBottomLeftRadius: '14px',
                  textTransform: 'uppercase'
                }}>
                  {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : cp.discount_type === 'free_delivery' ? 'FREE SHIP' : `₹${cp.discount_value} OFF`}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#F5F7F2',
                      color: '#85926B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Gift size={22} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 800, color: '#1F241C', letterSpacing: '1px' }}>
                        {cp.code}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#85926B', fontWeight: 700 }}>
                        {cp.discount_type === 'percentage' ? `Save up to ₹${cp.max_discount || 150}` : 'Special Promotion'}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#55604C', lineHeight: 1.5, marginBottom: '16px' }}>
                    {cp.description || `Valid on orders of ₹${cp.min_order_value || 0} or more.`}
                  </p>

                  <div style={{
                    backgroundColor: '#FAF8F5',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.76rem',
                    color: '#6F7B67',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '18px'
                  }}>
                    <span>Min Order: ₹{cp.min_order_value || 0}</span>
                    {cp.end_date && <span>Valid till: {cp.end_date}</span>}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(cp.code)}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '14px',
                    border: isCopied ? '1.5px solid #2E7D32' : '1.5px solid #85926B',
                    backgroundColor: isCopied ? '#E8F5E9' : '#FFFFFF',
                    color: isCopied ? '#2E7D32' : '#85926B',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} /> Code Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy Promo Code
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
