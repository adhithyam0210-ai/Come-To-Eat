import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

export function MenuPage({
  categories = [],
  foods = [],
  onSelectCategory,
  onNavigateToHome
}) {
  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Menu Header Banner */}
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
          background: 'linear-gradient(180deg, #1E251B 0%, #293525 70%, #FAF8F5 100%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '720px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(133, 146, 107, 0.3)',
            border: '1px solid rgba(133, 146, 107, 0.5)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#E8EFE1',
            marginBottom: '14px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Full Culinary Catalog
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.18,
            color: '#FFFFFF',
            margin: '0 0 14px'
          }}>
            Handcrafted Café Menu
          </h1>

          <p style={{
            color: '#D4DEC8',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            lineHeight: 1.6,
            margin: 0
          }}>
            Explore our curated culinary categories below. Click on any category to view its dedicated selection of dishes.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '20px' }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Home', onClick: onNavigateToHome },
            { label: 'Menu Categories' }
          ]}
        />

        {/* Category Discovery Cards Grid */}
        <div style={{ marginTop: '10px', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#1F241C', margin: 0 }}>
                Menu Categories
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#6A785E', margin: '4px 0 0' }}>
                Select a category to view its complete collection of dishes on its own dedicated page
              </p>
            </div>
          </div>

          <div className="card-grid-responsive">
            {categories.map((cat) => {
              const count = foods.filter((f) => f.category_id === cat.id || f.category_slug === cat.slug).length;
              return (
                <div
                  key={cat.id || cat.slug}
                  onClick={() => onSelectCategory(cat)}
                  className="food-card-responsive"
                  style={{
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="food-card-img-box category-card-img-box" style={{ backgroundColor: '#F0F4E8' }}>
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(30, 37, 27, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFF',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {count} {count === 1 ? 'Dish' : 'Dishes'}
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4
                        className="category-card-title-text"
                        style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F241C', margin: '0 0 2px' }}
                      >
                        {cat.name}
                      </h4>
                      <div style={{ fontSize: '0.76rem', color: '#85926B', fontWeight: 600 }}>
                        Explore category →
                      </div>
                    </div>

                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#EBF0E4',
                      color: '#85926B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
