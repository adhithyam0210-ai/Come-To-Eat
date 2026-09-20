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
      <section id="search" style={{ padding: '60px 0 45px', backgroundColor: '#FAF7F2' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
            <div className="font-cursive" style={{ fontSize: '1.9rem', color: '#8D0A13', fontWeight: 700, marginBottom: '2px' }}>
              Find Your Cravings
            </div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
              color: '#1A1D20',
              fontWeight: 900,
              textTransform: 'uppercase',
              margin: '0 0 8px'
            }}>
              SEARCH DISHES & DIETARY FILTERS
            </h2>
            <div style={{ width: '50px', height: '3.5px', backgroundColor: '#8D0A13', borderRadius: '2px', margin: '0 auto 12px' }} />
          </div>

          {/* Search Box & Filter Controls Bar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '22px',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid #ECE7DE',
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
                  color="#8D0A13"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="food-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type a dish, burger, momos, pizza, boba..."
                  className="form-input"
                  style={{ paddingLeft: '44px', paddingRight: searchTerm ? '40px' : '16px', borderRadius: '9999px', fontSize: '0.94rem', border: '1.5px solid #ECE7DE' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6E7781',
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
                  backgroundColor: '#FAF7F2',
                  padding: '4px',
                  borderRadius: '9999px',
                  border: '1px solid #ECE7DE'
                }}>
                  <button
                    onClick={() => setVegFilter('all')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      backgroundColor: vegFilter === 'all' ? '#8D0A13' : 'transparent',
                      color: vegFilter === 'all' ? '#FFF' : '#3A4149',
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
                      fontWeight: 800,
                      backgroundColor: vegFilter === 'veg' ? '#E8F5E9' : 'transparent',
                      color: vegFilter === 'veg' ? '#2E7D32' : '#3A4149',
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
                      fontWeight: 800,
                      backgroundColor: vegFilter === 'nonveg' ? '#FFEBEE' : 'transparent',
                      color: vegFilter === 'nonveg' ? '#C8102E' : '#3A4149',
                      border: vegFilter === 'nonveg' ? '1px solid #C8102E' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Non-Veg
                  </button>
                </div>

                {/* Sort By Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#6E7781', fontWeight: 700 }}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.84rem',
                      width: 'auto',
                      fontWeight: 600,
                      borderColor: '#ECE7DE'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #ECE7DE' }}>
              <span style={{ fontSize: '0.78rem', color: '#6E7781', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="#FFB800" /> Popular Searches:
              </span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchTerm(tag)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: searchTerm.toLowerCase() === tag.toLowerCase() ? '#8D0A13' : '#FAF7F2',
                    color: searchTerm.toLowerCase() === tag.toLowerCase() ? '#FFFFFF' : '#1A1D20',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid #ECE7DE',
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
                backgroundColor: '#FFF8E6',
                color: '#1A1D20',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid #FFE699',
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
                  style={{ color: '#8D0A13', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Clear Filters <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. DEDICATED COMPLETE MENU SECTION (#menu) */}
      <section id="menu" style={{ padding: '50px 0 90px', backgroundColor: '#FFFFFF', borderTop: '1px solid #ECE7DE' }}>
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
            <div className="font-cursive" style={{ fontSize: '1.9rem', color: '#8D0A13', fontWeight: 700, marginBottom: '2px' }}>
              Selection
            </div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: '#1A1D20',
              fontWeight: 900,
              textTransform: 'uppercase',
              margin: '0 0 8px'
            }}>
              OUR COMPLETE MENU
            </h2>
            <div style={{ width: '50px', height: '3.5px', backgroundColor: '#8D0A13', borderRadius: '2px', margin: '0 auto 12px' }} />
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
                padding: '9px 22px',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                backgroundColor: !selectedCategory || selectedCategory === 'all' ? '#8D0A13' : '#FAF7F2',
                color: !selectedCategory || selectedCategory === 'all' ? '#FFFFFF' : '#1A1D20',
                border: '1px solid #ECE7DE',
                boxShadow: !selectedCategory || selectedCategory === 'all' ? '0 4px 14px rgba(141, 10, 19, 0.3)' : 'none',
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
                    padding: '9px 22px',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    backgroundColor: active ? '#8D0A13' : '#FAF7F2',
                    color: active ? '#FFFFFF' : '#1A1D20',
                    border: '1px solid #ECE7DE',
                    boxShadow: active ? '0 4px 14px rgba(141, 10, 19, 0.3)' : 'none',
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
          color: '#5A626A',
          fontSize: '0.9rem'
        }}>
          <div>
            Showing <strong style={{ color: '#1A1D20' }}>{filteredFoods.length}</strong> delicious dishes
          </div>
          {selectedCategory && selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              style={{
                color: '#8D0A13',
                fontWeight: 800,
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
            border: '1px dashed #ECE7DE'
          }}>
            <UtensilsCrossed size={42} color="#8D0A13" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.4rem', color: '#1A1D20', marginBottom: '8px', fontWeight: 800 }}>
              No dishes found
            </h3>
            <p style={{ color: '#6E7781', fontSize: '0.92rem', marginBottom: '20px' }}>
              We couldn't find any food items matching your search or filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setVegFilter('all'); onSelectCategory('all'); }}
              className="btn-accent"
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
                  opacity: isSoldOut ? 0.75 : 1,
                  border: '1px solid #ECE7DE',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
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
                        backgroundColor: '#FFB800',
                        color: '#000000',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 900
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
                      backgroundColor: 'rgba(20, 20, 20, 0.75)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <AlertCircle size={20} color="#FFD7D7" />
                      <span style={{ fontWeight: 900, fontSize: '0.8rem', marginTop: '4px', letterSpacing: '0.5px' }}>
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
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#1A1D20',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Clock size={11} color="#8D0A13" /> {item.prep_time}
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
                        color: '#8D0A13',
                        fontWeight: 800
                      }}>
                        {item.category_name}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontSize: '0.78rem', fontWeight: 800 }}>
                        <Star size={13} fill="#FFB800" color="#FFB800" />
                        <span style={{ color: '#1A1D20' }}>{item.rating || '4.8'}</span>
                      </div>
                    </div>

                    {/* Food Name */}
                    <h4
                      onClick={() => onOpenItemDetail(item)}
                      className="food-card-title-text"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '1.08rem',
                        fontWeight: 700,
                        color: '#1A1D20',
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
                        color: '#5A626A',
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
                    borderTop: '1px solid #FAF7F2',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                        <span className="food-card-price-text" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#8D0A13' }}>
                          ₹{item.discount_price !== null && item.discount_price !== undefined ? item.discount_price : item.price}
                        </span>
                        {item.discount_price !== null && item.discount_price !== undefined && (
                          <span style={{ fontSize: '0.76rem', textDecoration: 'line-through', color: '#A1A8B0' }}>
                            ₹{item.price}
                          </span>
                        )}
                      </div>
                      {hasAddons && (
                        <div style={{ fontSize: '0.64rem', color: '#8D0A13', fontWeight: 700 }}>
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
                        backgroundColor: isSoldOut ? '#CBD4C0' : '#8D0A13',
                        color: '#FFFFFF',
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        boxShadow: isSoldOut ? 'none' : '0 3px 10px rgba(141, 10, 19, 0.35)'
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
