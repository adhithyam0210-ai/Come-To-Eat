import React, { useState, useMemo } from 'react';
import { Sparkles, SlidersHorizontal, Star, Plus, Check, UtensilsCrossed, ArrowRight, FolderTree } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function MenuPage({
  categories = [],
  foods = [],
  onSelectCategory,
  onOpenItemDetail,
  onAddToCart
}) {
  const [vegFilter, setVegFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [addedItemIds, setAddedItemIds] = useState([]);

  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      if (vegFilter === 'veg' && item.is_veg !== 1) return false;
      if (vegFilter === 'nonveg' && item.is_veg !== 0) return false;
      return true;
    }).sort((a, b) => {
      const priceA = a.discount_price || a.price;
      const priceB = b.discount_price || b.price;

      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [foods, vegFilter, sortBy]);

  const handleQuickAdd = (food, e) => {
    e.stopPropagation();
    if (!food.is_available) return;
    onAddToCart(food);
    setAddedItemIds((prev) => [...prev, food.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== food.id));
    }, 1200);
  };

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

      <div className="container" style={{ marginTop: '30px' }}>
        {/* 1. Category Discovery Cards Grid */}
        <div style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1F241C', margin: 0 }}>
                Menu Categories
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#6A785E', margin: '4px 0 0' }}>
                Select a category to view its complete collection of dishes on its own dedicated page
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {categories.map((cat) => {
              const count = foods.filter((f) => f.category_id === cat.id || f.category_slug === cat.slug).length;
              return (
                <div
                  key={cat.id || cat.slug}
                  onClick={() => onSelectCategory(cat)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid #ECE7DE',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.09)';
                    e.currentTarget.style.borderColor = '#85926B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = '#ECE7DE';
                  }}
                >
                  <div style={{ position: 'relative', height: '140px', width: '100%', backgroundColor: '#F0F4E8' }}>
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(30, 37, 27, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      {count} {count === 1 ? 'Dish' : 'Dishes'}
                    </div>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F241C', margin: '0 0 4px' }}>
                        {cat.name}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#85926B', fontWeight: 600 }}>
                        Click to explore category →
                      </div>
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#EBF0E4',
                      color: '#85926B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. All Dishes Collection Header & Filter Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '18px',
          border: '1px solid #ECE7DE',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          {/* Dietary Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#6A785E', fontWeight: 600 }}>Filter:</span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'veg', label: 'Pure Veg' },
              { id: 'nonveg', label: 'Non-Veg' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setVegFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: vegFilter === f.id ? '1.5px solid #85926B' : '1px solid #E0E6DA',
                  backgroundColor: vegFilter === f.id ? '#EBF0E4' : '#FFFFFF',
                  color: vegFilter === f.id ? '#3D4636' : '#6A785E',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Dishes Count and Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.86rem', color: '#6A785E', fontWeight: 600 }}>
              {filteredFoods.length} dishes in menu
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={14} color="#85926B" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px solid #DCE3D4',
                  fontSize: '0.84rem',
                  backgroundColor: '#FFFFFF',
                  color: '#2A3324',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* All Dishes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {filteredFoods.map((item) => {
            const hasDiscount = item.discount_price && item.discount_price < item.price;
            const isAdded = addedItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onOpenItemDetail(item)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid #ECE7DE',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#F0F4E8' }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: item.is_available ? 'none' : 'grayscale(80%)'
                    }}
                  />

                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <DietaryBadge isVeg={item.is_veg} />
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(6px)',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: '#2A3324',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{item.rating || '4.8'}</span>
                  </div>

                  {!item.is_available && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontWeight: 700,
                      fontSize: '0.88rem'
                    }}>
                      Sold Out Today
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.74rem', color: '#85926B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                    {item.category_name}
                  </div>

                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#1F241C',
                    margin: '0 0 6px',
                    lineHeight: 1.3
                  }}>
                    {item.name}
                  </h3>

                  <p style={{
                    fontSize: '0.82rem',
                    color: '#65705C',
                    lineHeight: 1.5,
                    margin: '0 0 16px',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F0EFEB',
                    paddingTop: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F241C' }}>
                          ₹{item.discount_price || item.price}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                            ₹{item.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      disabled={!item.is_available}
                      style={{
                        backgroundColor: isAdded ? '#2E7D32' : item.is_available ? '#85926B' : '#CCCCCC',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: item.is_available ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        boxShadow: item.is_available ? '0 3px 10px rgba(133, 146, 107, 0.3)' : 'none'
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
