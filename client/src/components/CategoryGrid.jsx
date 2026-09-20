import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function CategoryGrid({ categories = [], selectedCategory, onSelectCategory }) {
  const handleCategoryClick = (category) => {
    onSelectCategory(category.slug);
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" style={{ padding: '60px 0 50px', backgroundColor: '#FAF7F2' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="font-cursive" style={{ fontSize: '1.8rem', color: '#8D0A13', fontWeight: 700, marginBottom: '2px' }}>
              Taste The Variety
            </div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              color: '#1A1D20',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.3px',
              margin: 0
            }}>
              POPULAR CATEGORIES
            </h2>
          </div>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#8D0A13',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>View All</span> →
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="card-grid-responsive">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <div
                key={cat.id || cat.slug}
                onClick={() => handleCategoryClick(cat)}
                className="food-card-responsive"
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#8D0A13' : '#161616',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #FFB800' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected
                    ? '0 10px 25px rgba(141, 10, 19, 0.4)'
                    : '0 6px 18px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Food Photograph */}
                <div
                  className="food-card-img-box category-card-img-box"
                  style={{
                    backgroundColor: '#1E1E1E'
                  }}
                >
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'; }}
                  />

                  {/* Corner Redirect Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFB800',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* Category Title */}
                <div style={{
                  padding: '12px 14px',
                  textAlign: 'center',
                  backgroundColor: isSelected ? '#8D0A13' : '#161616',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px'
                }}>
                  <h3
                    className="category-card-title-text"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '1rem',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: 0
                    }}
                  >
                    {cat.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
