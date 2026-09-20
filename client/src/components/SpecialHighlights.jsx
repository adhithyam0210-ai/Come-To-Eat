import React from 'react';
import { Star, Clock, Plus, Sparkles } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function SpecialHighlights({ items = [], onOpenItemDetail, onAddToCart }) {
  const featured = items.filter((item) => item.is_featured === 1 || item.is_featured === true || item.is_featured === '1');
  if (featured.length === 0) return null;

  return (
    <section style={{ padding: '60px 0 80px', backgroundColor: '#FAF7F2' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="font-cursive" style={{ fontSize: '1.9rem', color: '#8D0A13', fontWeight: 700 }}>
            Chef's Recommendations
          </div>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            color: '#1A1D20',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.3px'
          }}>
            Signature Food Highlights
          </h2>
          <div style={{
            width: '50px',
            height: '3.5px',
            backgroundColor: '#8D0A13',
            borderRadius: '2px',
            margin: '12px auto 0'
          }} />
        </div>

        {/* Highlights Grid with Dynamic Middle Centering */}
        <div className={`highlights-container-dynamic ${featured.length === 1 ? 'count-1' : featured.length === 2 ? 'count-2' : 'count-many'}`}>
          {featured.map((item) => (
            <div
              key={item.id}
              className="food-card-responsive"
              style={{
                borderRadius: '18px',
                border: '1px solid #ECE7DE',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Image Section */}
              <div
                onClick={() => onOpenItemDetail(item)}
                className="food-card-img-box"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  loading="lazy"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'; }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#8D0A13',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}>
                  {item.category_name?.toUpperCase() || 'BEST SELLER'}
                </div>
              </div>

              {/* Body */}
              <div className="food-card-body-box">
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <DietaryBadge isVeg={item.is_veg} showText={true} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontSize: '0.8rem', fontWeight: 800 }}>
                      <Star size={14} fill="#FFB800" color="#FFB800" />
                      <span style={{ color: '#1A1D20' }}>{item.rating || '4.8'}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onOpenItemDetail(item)}
                    className="food-card-title-text"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '1.18rem',
                      fontWeight: 700,
                      color: '#1A1D20',
                      cursor: 'pointer',
                      lineHeight: 1.25,
                      marginBottom: '6px'
                    }}
                  >
                    {item.name}
                  </h3>

                  <p
                    className="food-card-desc-text"
                    style={{
                      fontSize: '0.84rem',
                      color: '#5A626A',
                      lineHeight: 1.45,
                      marginBottom: '12px'
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Footer Price & Add to Cart */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid #F0F4E8',
                  marginTop: 'auto'
                }}>
                  <div>
                    <div style={{ fontSize: '0.64rem', color: '#8D0A13', fontWeight: 800, letterSpacing: '0.5px' }}>PRICE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span className="food-card-price-text" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#8D0A13' }}>
                        ₹{item.discount_price || item.price}
                      </span>
                      {item.discount_price && (
                        <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: '#A0A997' }}>
                          ₹{item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(item)}
                    disabled={!item.is_available}
                    className="food-card-add-btn"
                    style={{
                      backgroundColor: item.is_available ? '#8D0A13' : '#CBD4C0',
                      color: '#FFFFFF',
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: item.is_available ? 'pointer' : 'not-allowed',
                      boxShadow: item.is_available ? '0 4px 14px rgba(141, 10, 19, 0.35)' : 'none'
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
