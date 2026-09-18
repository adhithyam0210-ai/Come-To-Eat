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
                  border: isSelected ? '2.5px solid #85926B' : '1px solid rgba(133, 146, 107, 0.16)',
                  boxShadow: isSelected
                    ? '0 12px 30px rgba(133, 146, 107, 0.3)'
                    : '0 4px 16px rgba(0, 0, 0, 0.03)'
                }}
              >
                {/* Food Photograph */}
                <div
                  className="food-card-img-box category-card-img-box"
                  style={{
                    backgroundColor: '#F3F5EE'
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
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475234',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* Category Title */}
                <div style={{
                  padding: '12px 14px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3
                    className="category-card-title-text"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: isSelected ? '#85926B' : '#1F241C',
                      textTransform: 'capitalize',
                      letterSpacing: '-0.2px',
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
