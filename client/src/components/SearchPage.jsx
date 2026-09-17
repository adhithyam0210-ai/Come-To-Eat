import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Star, Plus, Check, UtensilsCrossed, X, Sparkles } from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

export function SearchPage({
  foods = [],
  onOpenItemDetail,
  onAddToCart,
  initialQuery = ''
}) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [vegFilter, setVegFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [addedItemIds, setAddedItemIds] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
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
  }, [foods, vegFilter, searchTerm, sortBy]);

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
      {/* Search Header Banner */}
      <div style={{
        position: 'relative',
        backgroundColor: '#1E251B',
        color: '#FFFFFF',
        padding: 'clamp(24px, 4vw, 36px) 0 clamp(28px, 4vw, 42px)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #1E251B 0%, #2B3727 70%, #FAF8F5 100%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '720px' }}>
          {/* Search Box Input */}
          <div style={{
            position: 'relative',
            maxWidth: '620px',
            margin: '0 auto',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
            borderRadius: '9999px'
          }}>
            <Search
              size={20}
              color="#85926B"
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={searchInputRef}
              id="food-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search burgers, momos, pizzas, boba, shakes..."
              style={{
                width: '100%',
                padding: '16px 50px 16px 54px',
                borderRadius: '9999px',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                fontSize: '1.05rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#1F241C',
                fontWeight: 500
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="container" style={{ marginTop: '30px' }}>
        {/* Filters and Counters Bar */}
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
          {/* Diet Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#6A785E', fontWeight: 600 }}>Filter:</span>
            {[
              { id: 'all', label: 'All Foods' },
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

          {/* Results Match Counter & Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.86rem', color: '#6A785E', fontWeight: 600 }}>
              {filteredFoods.length} {filteredFoods.length === 1 ? 'dish found' : 'dishes found'}
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

        {/* Results Grid */}
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
              No dishes found for "{searchTerm}"
            </h4>
            <p style={{ color: '#6A785E', fontSize: '0.9rem', marginBottom: '16px' }}>
              Try searching with different keywords, or clear your search to explore all dishes.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setVegFilter('all'); }}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
