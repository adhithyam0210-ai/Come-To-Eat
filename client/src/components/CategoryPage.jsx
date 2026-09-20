import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, Clock, Plus, Check, SlidersHorizontal, Sparkles, UtensilsCrossed } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';
import { Breadcrumbs } from './Breadcrumbs';

export function CategoryPage({
  category,
  allCategories = [],
  foods = [],
  onBackToMenu,
  onNavigateToHome,
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
      {/* Category Hero Banner with full background image & elegant dark overlay */}
      <div style={{
        position: 'relative',
        backgroundColor: '#450005',
        color: '#FFFFFF',
        padding: 'clamp(40px, 5.5vw, 68px) 0 clamp(48px, 6.5vw, 80px)',
        overflow: 'hidden'
      }}>
        {/* Full Category Background Image */}
        {category.image_url && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${category.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.55,
            transform: 'scale(1.02)',
            transition: 'opacity 0.3s ease'
          }} />
        )}

        {/* Gradient Overlay for Superior Text Legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(30, 0, 4, 0.72) 0%, rgba(69, 0, 5, 0.88) 75%, #FAF7F2 100%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb & Back Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <Breadcrumbs
              theme="dark"
              items={[
                { label: 'Home', onClick: onNavigateToHome },
                { label: 'Menu', onClick: onBackToMenu },
                { label: category.name }
              ]}
              style={{ padding: 0 }}
            />
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
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)')}
            >
              <ArrowLeft size={15} /> Back to Full Menu
            </button>
          </div>

          {/* Banner Main Content */}
          <div style={{ maxWidth: '720px' }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.12,
              margin: '0 0 12px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {category.name}
            </h1>

            <p style={{
              color: 'rgba(255, 255, 255, 0.92)',
              fontSize: 'clamp(0.98rem, 2vw, 1.12rem)',
              lineHeight: 1.6,
              maxWidth: '640px',
              margin: '0 0 20px',
              fontWeight: 400,
              textShadow: '0 1px 6px rgba(0,0,0,0.4)'
            }}>
              {category.description || `Explore our hand-crafted, freshly prepared selection of authentic ${category.name}.`}
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 184, 0, 0.22)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 184, 0, 0.4)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              color: '#FFB800',
              fontWeight: 800
            }}>
              <UtensilsCrossed size={15} color="#FFB800" />
              <span>{categoryFoods.length} {categoryFoods.length === 1 ? 'Dish Available' : 'Dishes Available'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '30px' }}>


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
          <div className={`highlights-container-dynamic ${filteredFoods.length === 1 ? 'count-1' : filteredFoods.length === 2 ? 'count-2' : 'count-many'}`}>
            {filteredFoods.map((item) => {
              const hasDiscount = item.discount_price && item.discount_price < item.price;
              const isAdded = addedItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenItemDetail(item)}
                  className="food-card-responsive"
                  style={{
                    cursor: 'pointer',
                    opacity: item.is_available ? 1 : 0.75
                  }}
                >
                  {/* Food Image & Badges */}
                  <div className="food-card-img-box">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'; }}
                      style={{
                        filter: item.is_available ? 'none' : 'grayscale(80%)'
                      }}
                    />

                    {/* Veg / Non-Veg Indicator */}
                    <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                      <DietaryBadge isVeg={item.is_veg} size={12} />
                    </div>

                    {/* Rating Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(6px)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: '#2A3324',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" />
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
                        fontSize: '0.8rem'
                      }}>
                        Sold Out
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="food-card-body-box">
                    <div>
                      <h3
                        className="food-card-title-text"
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#1F241C',
                          margin: '0 0 4px',
                          lineHeight: 1.25
                        }}
                      >
                        {item.name}
                      </h3>

                      <p
                        className="food-card-desc-text"
                        style={{
                          fontSize: '0.8rem',
                          color: '#65705C',
                          lineHeight: 1.4,
                          margin: '0 0 10px'
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Add to Cart */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #F0EFEB',
                      paddingTop: '8px',
                      marginTop: 'auto'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                          <span className="food-card-price-text" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F241C' }}>
                            ₹{item.discount_price || item.price}
                          </span>
                          {hasDiscount && (
                            <span style={{ fontSize: '0.76rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(item, e)}
                        disabled={!item.is_available}
                        className="food-card-add-btn"
                        style={{
                          backgroundColor: isAdded ? '#2E7D32' : item.is_available ? '#85926B' : '#CCCCCC',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: item.is_available ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease',
                          boxShadow: item.is_available ? '0 2px 8px rgba(133, 146, 107, 0.25)' : 'none'
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={13} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={13} /> Add
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
