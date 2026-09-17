import React from 'react';
import { Star, Clock, Plus, Sparkles } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function SpecialHighlights({ items = [], onOpenItemDetail, onAddToCart }) {
  const featured = items.filter((item) => item.is_featured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section style={{ padding: '60px 0 80px', backgroundColor: '#FAF8F5' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="font-cursive" style={{ fontSize: '1.8rem', color: '#85926B' }}>
            Chef's Recommendations
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            color: '#1F241C',
            fontWeight: 700
          }}>
            Signature Café Highlights
          </h2>
          <div style={{
            width: '50px',
            height: '3px',
            backgroundColor: '#85926B',
            borderRadius: '2px',
            margin: '12px auto 0'
          }} />
        </div>

        {/* 3-Column Highlights Grid (Inspired by Image 1) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {featured.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                border: '1px solid rgba(133, 146, 107, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(133, 146, 107, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.05)';
              }}
            >
              {/* Image Section */}
              <div
                onClick={() => onOpenItemDetail(item)}
                style={{
                  height: '210px',
                  width: '100%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#85926B',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  {item.category_name?.toUpperCase() || 'SIGNATURE'}
                </div>
              </div>

              {/* Body (Image 1 Style: Centered Title, subtle meta, quick action) */}
              <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <DietaryBadge isVeg={item.is_veg} showText={true} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '0.86rem', fontWeight: 700 }}>
                    <Star size={15} fill="#F59E0B" color="#F59E0B" />
                    <span>{item.rating}</span>
                    <span style={{ color: '#8C9776', fontWeight: 400 }}>({item.rating_count})</span>
                  </div>
                </div>

                <h3
                  onClick={() => onOpenItemDetail(item)}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#1F241C',
                    cursor: 'pointer',
                    lineHeight: 1.3,
                    marginBottom: '8px'
                  }}
                >
                  {item.name}
                </h3>

                <p style={{
                  fontSize: '0.88rem',
                  color: '#65705C',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  flex: 1
                }}>
                  {item.description}
                </p>

                {/* Footer Price & Add to Cart */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid #F0F4E8'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8C9776', fontWeight: 600 }}>PRICE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2A3324' }}>
                        ₹{item.discount_price || item.price}
                      </span>
                      {item.discount_price && (
                        <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#A0A997' }}>
                          ₹{item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(item)}
                    disabled={!item.is_available}
                    style={{
                      backgroundColor: item.is_available ? '#85926B' : '#CBD4C0',
                      color: '#FFFFFF',
                      padding: '10px 20px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: item.is_available ? 'pointer' : 'not-allowed',
                      boxShadow: item.is_available ? '0 4px 12px rgba(133, 146, 107, 0.3)' : 'none'
                    }}
                  >
                    <Plus size={16} />
                    <span>{item.is_available ? 'Add' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
