import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, Clock, Plus, Check, AlertCircle, UtensilsCrossed, X, Sparkles } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function MenuExplorer({
  foods = [],
  categories = [],
  selectedCategory,
  onSelectCategory,
  onOpenItemDetail,
  onAddToCart
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_low', 'price_high', 'rating'

  // Filter and sort items
  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      // Category Filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (item.category_slug !== selectedCategory && String(item.category_id) !== String(selectedCategory)) {
          return false;
        }
      }

      // Veg / Non-Veg Filter
      if (vegFilter === 'veg' && item.is_veg !== 1) return false;
      if (vegFilter === 'nonveg' && item.is_veg !== 0) return false;

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesCat = item.category_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discount_price || a.price;
      const priceB = b.discount_price || b.price;

      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [foods, selectedCategory, vegFilter, searchTerm, sortBy]);

  const quickSearchTags = ['Smash Burger', 'Momos', 'Boba Tea', 'Pizza', 'Pasta', 'Fries'];

  return (
    <>
      {/* 1. DEDICATED SEARCH SECTION (#search) */}
      <section id="search" style={{ padding: '70px 0 50px', backgroundColor: '#FAF8F5' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <div className="font-cursive" style={{ fontSize: '1.8rem', color: '#85926B', marginBottom: '4px' }}>
              Find Your Cravings
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
              color: '#1F241C',
              fontWeight: 700,
              margin: '0 0 10px'
            }}>
              Search Dishes & Dietary Filters
            </h2>
            <div style={{ width: '50px', height: '3px', backgroundColor: '#85926B', borderRadius: '2px', margin: '0 auto 12px' }} />
            <p style={{ color: '#6A785E', fontSize: '0.94rem', margin: 0 }}>
              Instant live search across burgers, momos, stone-baked pizzas, boba tea, pasta, and desserts
            </p>
          </div>

          {/* Search Box & Filter Controls Bar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            border: '1px solid rgba(133, 146, 107, 0.18)',
            maxWidth: '960px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Main Search Input */}
              <div style={{
                position: 'relative',
                flex: '1 1 280px',
                minWidth: '220px'
              }}>
                <Search
                  size={18}
                  color="#8C9776"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="food-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type a dish, flavor, or ingredient (e.g. burger, momos, boba)..."
                  className="form-input"
                  style={{ paddingLeft: '44px', paddingRight: searchTerm ? '40px' : '16px', borderRadius: '9999px', fontSize: '0.94rem' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#8C9776',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Diet Switch & Sort Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Veg Toggle */}
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: '#F3F6EE',
                  padding: '4px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(133, 146, 107, 0.2)'
                }}>
                  <button
                    onClick={() => setVegFilter('all')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: vegFilter === 'all' ? '#85926B' : 'transparent',
                      color: vegFilter === 'all' ? '#FFF' : '#556149',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setVegFilter('veg')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: vegFilter === 'veg' ? '#E8F5E9' : 'transparent',
                      color: vegFilter === 'veg' ? '#2E7D32' : '#556149',
                      border: vegFilter === 'veg' ? '1px solid #2E7D32' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Veg
                  </button>
                  <button
                    onClick={() => setVegFilter('nonveg')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: vegFilter === 'nonveg' ? '#FFEBEE' : 'transparent',
                      color: vegFilter === 'nonveg' ? '#C62828' : '#556149',
                      border: vegFilter === 'nonveg' ? '1px solid #C62828' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Non-Veg
                  </button>
                </div>

                {/* Sort By Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#7E8775', fontWeight: 600 }}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.84rem',
                      width: 'auto',
                      fontWeight: 500
                    }}
                  >
                    <option value="popular">Bestsellers First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Top Customer Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Keyword Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F0F4E8' }}>
              <span style={{ fontSize: '0.78rem', color: '#7E8775', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="#85926B" /> Popular Searches:
              </span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchTerm(tag)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: searchTerm.toLowerCase() === tag.toLowerCase() ? '#85926B' : '#F3F6EE',
                    color: searchTerm.toLowerCase() === tag.toLowerCase() ? '#FFFFFF' : '#475234',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid rgba(133, 146, 107, 0.15)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Live Search Results Summary */}
            {(searchTerm || vegFilter !== 'all') && (
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#EBF1E4',
                color: '#3A4530',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>
                  Showing <strong>{filteredFoods.length}</strong> matching dishes for {searchTerm ? `"${searchTerm}"` : 'selected filters'}
                </span>
                <button
                  onClick={() => { setSearchTerm(''); setVegFilter('all'); }}
                  style={{ color: '#C62828', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Clear Filters <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. DEDICATED COMPLETE MENU SECTION (#menu) */}
      <section id="menu" style={{ padding: '60px 0 100px', backgroundColor: '#FFFFFF', borderTop: '1px solid #ECE7DE' }}>
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <div className="font-cursive" style={{ fontSize: '1.8rem', color: '#85926B', marginBottom: '4px' }}>
              Café Favorites Selection
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              color: '#1F241C',
              fontWeight: 700,
              margin: '0 0 10px'
            }}>
              Our Complete Menu
            </h2>
            <div style={{ width: '50px', height: '3px', backgroundColor: '#85926B', borderRadius: '2px', margin: '0 auto 12px' }} />
            <p style={{ color: '#6A785E', fontSize: '0.94rem', margin: 0 }}>
              Browse dishes by category or select all to view everything crafted fresh in our kitchen
            </p>
          </div>

          {/* Horizontal Category Chips Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '14px',
            marginBottom: '28px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            <button
              onClick={() => onSelectCategory('all')}
              style={{
                padding: '9px 20px',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                backgroundColor: !selectedCategory || selectedCategory === 'all' ? '#2A3324' : '#F3F6EE',
                color: !selectedCategory || selectedCategory === 'all' ? '#FFFFFF' : '#475234',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: !selectedCategory || selectedCategory === 'all' ? '0 4px 12px rgba(42, 51, 36, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              All Items ({foods.length})
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    backgroundColor: active ? '#85926B' : '#F3F6EE',
                    color: active ? '#FFFFFF' : '#475234',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: active ? '0 4px 12px rgba(133, 146, 107, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

        {/* Items Count & Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          color: '#65705C',
          fontSize: '0.9rem'
        }}>
          <div>
            Showing <strong style={{ color: '#2A3324' }}>{filteredFoods.length}</strong> delicious dishes
          </div>
          {selectedCategory && selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              style={{
                color: '#85926B',
                fontWeight: 700,
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Clear Category Filter <X size={13} />
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredFoods.length === 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px dashed #CBD4C0'
          }}>
            <UtensilsCrossed size={42} color="#85926B" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#2A3324', marginBottom: '8px' }}>
              No dishes found
            </h3>
            <p style={{ color: '#7E8775', fontSize: '0.92rem', marginBottom: '20px' }}>
              We couldn't find any food items matching your search or filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setVegFilter('all'); onSelectCategory('all'); }}
              className="btn-outline"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Food Items Grid */}
        <div className="card-grid-responsive">
          {filteredFoods.map((item) => {
            const hasAddons = item.addons && item.addons.length > 0;
            const isSoldOut = !item.is_available;

            return (
              <div
                key={item.id}
                className="food-card-responsive"
                style={{
                  opacity: isSoldOut ? 0.75 : 1
                }}
              >
                {/* Food Image Container */}
                <div
                  onClick={() => onOpenItemDetail(item)}
                  className="food-card-img-box"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'; }}
                    style={{
                      filter: isSoldOut ? 'grayscale(80%)' : 'none'
                    }}
                  />

                  {/* Top Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}>
                      <DietaryBadge isVeg={item.is_veg} showText={true} size={11} />
                    </div>
                    {item.discount_price && !isSoldOut && (
                      <span style={{
                        backgroundColor: '#E76F51',
                        color: '#FFF',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 800
                      }}>
                        SAVE ₹{item.price - item.discount_price}
                      </span>
                    )}
                  </div>

                  {/* Availability Sold Out Ribbon */}
                  {isSoldOut && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(30, 36, 26, 0.65)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <AlertCircle size={20} color="#FFCDD2" />
                      <span style={{ fontWeight: 800, fontSize: '0.8rem', marginTop: '4px', letterSpacing: '0.5px' }}>
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  {/* Prep Time */}
                  {!isSoldOut && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(4px)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#475234',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Clock size={11} /> {item.prep_time}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="food-card-body-box">
                  <div>
                    {/* Category Name & Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#85926B',
                        fontWeight: 700
                      }}>
                        {item.category_name}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontSize: '0.78rem', fontWeight: 700 }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />
                        <span>{item.rating || '4.8'}</span>
                      </div>
                    </div>

                    {/* Food Name */}
                    <h4
                      onClick={() => onOpenItemDetail(item)}
                      className="food-card-title-text"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.08rem',
                        fontWeight: 700,
                        color: '#1F241C',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        lineHeight: 1.25
                      }}
                    >
                      {item.name}
                    </h4>

                    {/* Short Description */}
                    <p
                      className="food-card-desc-text"
                      style={{
                        fontSize: '0.8rem',
                        color: '#65705C',
                        lineHeight: '1.38',
                        marginBottom: '10px'
                      }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #F3F6EE',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                        <span className="food-card-price-text" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2A3324' }}>
                          ₹{item.discount_price !== null && item.discount_price !== undefined ? item.discount_price : item.price}
                        </span>
                        {item.discount_price !== null && item.discount_price !== undefined && (
                          <span style={{ fontSize: '0.76rem', textDecoration: 'line-through', color: '#9AA590' }}>
                            ₹{item.price}
                          </span>
                        )}
                      </div>
                      {hasAddons && (
                        <div style={{ fontSize: '0.64rem', color: '#85926B', fontWeight: 600 }}>
                          + Options
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (hasAddons) {
                          onOpenItemDetail(item);
                        } else {
                          onAddToCart(item);
                        }
                      }}
                      disabled={isSoldOut}
                      className="food-card-add-btn"
                      style={{
                        backgroundColor: isSoldOut ? '#CBD4C0' : '#85926B',
                        color: '#FFFFFF',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        boxShadow: isSoldOut ? 'none' : '0 2px 8px rgba(133, 146, 107, 0.25)'
                      }}
                    >
                      <Plus size={14} />
                      <span>{isSoldOut ? 'Out' : hasAddons ? 'Customize' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  </>
  );
}
