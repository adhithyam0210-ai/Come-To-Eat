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
    <section id="categories" style={{ padding: '80px 0 60px', backgroundColor: '#FAF8F5' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <div className="font-cursive" style={{ fontSize: '1.9rem', color: '#85926B', marginBottom: '6px' }}>
            Taste The Variety
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: '#1F241C',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            Explore Our Categories
          </h2>
          <div style={{
            width: '60px',
            height: '3px',
            backgroundColor: '#85926B',
            borderRadius: '2px',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6A7463', fontSize: '0.98rem' }}>
            From crispy gourmet burgers to steaming momos, bubble tea, and stone-baked pizzas — pick your craving.
          </p>
        </div>

        {/* Tall Rounded Category Cards Grid (Inspired by Image 2, Customized to User Categories in Image 5) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <div
                key={cat.id || cat.slug}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? '0 16px 36px rgba(133, 146, 107, 0.35)'
                    : '0 8px 20px rgba(0, 0, 0, 0.04)',
                  border: isSelected ? '2.5px solid #85926B' : '1.5px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(133, 146, 107, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = isSelected ? 'translateY(-2px)' : 'translateY(0)';
                  e.currentTarget.style.boxShadow = isSelected
                    ? '0 16px 36px rgba(133, 146, 107, 0.35)'
                    : '0 8px 20px rgba(0, 0, 0, 0.04)';
                }}
              >
                {/* Tall Food Photograph (Image 2 style) */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  overflow: 'hidden',
                  backgroundColor: '#F3F5EE'
                }}>
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Corner Redirect Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475234',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                {/* Category Title (Without item counts, as strictly requested by user) */}
                <div style={{
                  padding: '16px 18px 20px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    color: isSelected ? '#85926B' : '#1F241C',
                    textTransform: 'capitalize',
                    letterSpacing: '-0.2px',
                    marginBottom: '4px'
                  }}>
                    {cat.name}
                  </h3>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#85926B',
                    fontWeight: 600
                  }}>
                    View Dishes →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
