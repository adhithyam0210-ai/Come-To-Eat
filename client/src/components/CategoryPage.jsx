import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, Clock, Plus, Check, SlidersHorizontal, Sparkles, UtensilsCrossed } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function CategoryPage({
  category,
  allCategories = [],
  foods = [],
  onBackToMenu,
  onSelectCategory,
  onOpenItemDetail,
  onAddToCart
}) {
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_low', 'price_high', 'rating'
  const [addedItemIds, setAddedItemIds] = useState([]);

  // Category matching
  const categoryFoods = useMemo(() => {
    if (!category) return [];
    return foods.filter((item) => {
      // Match by category id, slug, or name
      if (category.id && item.category_id === category.id) return true;
      if (category.slug && item.category_slug === category.slug) return true;
      if (category.name && item.category_name?.toLowerCase() === category.name?.toLowerCase()) return true;
      return false;
    });
  }, [foods, category]);

  // Filtered & sorted category items
  const filteredFoods = useMemo(() => {
    return categoryFoods.filter((item) => {
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
  }, [categoryFoods, vegFilter, sortBy]);

  const handleQuickAdd = (food, e) => {
    e.stopPropagation();
    if (!food.is_available) return;
    onAddToCart(food);
    setAddedItemIds((prev) => [...prev, food.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== food.id));
    }, 1200);
  };

  if (!category) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <p>No category selected.</p>
        <button onClick={onBackToMenu} className="btn-primary" style={{ marginTop: '14px' }}>
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Category Hero Banner with organic ambient backdrop */}
      <div style={{
        position: 'relative',
        backgroundColor: '#1E251B',
        color: '#FFFFFF',
        padding: 'clamp(36px, 5vw, 64px) 0 clamp(44px, 6vw, 76px)',
        overflow: 'hidden'
      }}>
        {/* Background Image / Ambient Blur */}
        {category.image_url && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${category.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.22,
            filter: 'blur(8px)',
            transform: 'scale(1.08)'
          }} />
        )}

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(30,37,27,0.7) 0%, rgba(30,37,27,0.92) 80%, #FAF8F5 100%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb & Back Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={onBackToMenu}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)')}
            >
              <ArrowLeft size={15} /> Back to Full Menu
            </button>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>/</span>
            <span style={{ color: '#EBF0E4', fontSize: '0.85rem', fontWeight: 600 }}>{category.name}</span>
          </div>

          {/* Banner Main Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'center',
            gap: '32px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(133, 146, 107, 0.35)',
                border: '1px solid rgba(133, 146, 107, 0.5)',
                color: '#E8EFE1',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                <Sparkles size={13} /> Chef's Selection
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.15,
                margin: '0 0 12px'
              }}>
                {category.name}
              </h1>

              <p style={{
                color: '#D2DCD0',
                fontSize: 'clamp(0.92rem, 1.8vw, 1.05rem)',
                lineHeight: 1.6,
                maxWidth: '560px',
                margin: '0 0 18px'
              }}>
                {category.description || `Explore our hand-crafted, freshly prepared selection of authentic ${category.name}.`}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '0.84rem',
                color: '#FFF',
                fontWeight: 600
              }}>
                <UtensilsCrossed size={14} color="#85926B" />
                <span>{categoryFoods.length} {categoryFoods.length === 1 ? 'Dish Available' : 'Dishes Available'}</span>
              </div>
            </div>

            {/* Category Banner Card Image */}
            {category.image_url && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '380px',
                  height: '240px',
                  borderRadius: '22px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                  border: '3px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <img
                    src={category.image_url}
                    alt={category.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '30px' }}>
        {/* Category Switcher Pill Bar */}
        {allCategories.length > 1 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '0.78rem', color: '#6A785E', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Switch Category
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none'
            }}>
              {allCategories.map((cat) => {
                const isCurrent = (cat.id && category.id && cat.id === category.id) || cat.slug === category.slug;
                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => onSelectCategory(cat)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '24px',
                      border: isCurrent ? '2px solid #85926B' : '1px solid #DCE3D4',
                      backgroundColor: isCurrent ? '#85926B' : '#FFFFFF',
                      color: isCurrent ? '#FFFFFF' : '#3D4636',
                      fontWeight: isCurrent ? 700 : 600,
                      fontSize: '0.86rem',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: isCurrent ? '0 4px 14px rgba(133, 146, 107, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat.image_url && (
                      <img
                        src={cat.image_url}
                        alt=""
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter and Sorting Controls */}
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
            <span style={{ fontSize: '0.82rem', color: '#6A785E', fontWeight: 600, marginRight: '4px' }}>Diet:</span>
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

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <option value="popular">Featured / Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredFoods.length > 0 ? (
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
                  {/* Food Image & Badges */}
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

                    {/* Veg / Non-Veg Indicator */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      <DietaryBadge isVeg={item.is_veg} />
                    </div>

                    {/* Rating Badge */}
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

                    {/* Sold out overlay */}
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

                  {/* Card Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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

                    {/* Price and Add to Cart */}
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
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #ECE7DE'
          }}>
            <UtensilsCrossed size={40} color="#85926B" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', marginBottom: '8px' }}>
              No dishes match your filter
            </h4>
            <p style={{ color: '#6A785E', fontSize: '0.9rem', marginBottom: '16px' }}>
              Try switching your dietary filter back to "All Items".
            </p>
            <button
              onClick={() => setVegFilter('all')}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
