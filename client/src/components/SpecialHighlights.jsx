import React from 'react';
import { Star, Clock, Plus, Sparkles } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function SpecialHighlights({ items = [], onOpenItemDetail, onAddToCart }) {
  const featured = items.filter((item) => item.is_featured === 1 || item.is_featured === true || item.is_featured === '1');
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

        {/* Highlights Grid with Dynamic Middle Centering */}
        <div className={`highlights-container-dynamic ${featured.length === 1 ? 'count-1' : featured.length === 2 ? 'count-2' : 'count-many'}`}>
          {featured.map((item) => (
            <div
              key={item.id}
              className="food-card-responsive"
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
                  backgroundColor: '#85926B',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  {item.category_name?.toUpperCase() || 'SIGNATURE'}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span>{item.rating || '4.8'}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onOpenItemDetail(item)}
                    className="food-card-title-text"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.18rem',
                      fontWeight: 700,
                      color: '#1F241C',
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
                      color: '#65705C',
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
                    <div style={{ fontSize: '0.66rem', color: '#8C9776', fontWeight: 700, letterSpacing: '0.5px' }}>PRICE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span className="food-card-price-text" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2A3324' }}>
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
                      backgroundColor: item.is_available ? '#85926B' : '#CBD4C0',
                      color: '#FFFFFF',
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: item.is_available ? 'pointer' : 'not-allowed',
                      boxShadow: item.is_available ? '0 3px 10px rgba(133, 146, 107, 0.3)' : 'none'
                    }}
                  >
                    <Plus size={15} />
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
