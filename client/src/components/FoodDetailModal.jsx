import React, { useState } from 'react';
import { X, Star, Clock, Check, Plus, Minus, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DietaryBadge } from './DietaryBadge';

export function FoodDetailModal({ item, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const basePrice = item.discount_price !== null ? item.discount_price : item.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleToggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedAddons, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header Image */}
        <div style={{ position: 'relative', height: '260px', width: '100%', backgroundColor: '#F0F4E8' }}>
          <img
            src={item.image_url}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            display: 'flex',
            gap: '8px'
          }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
              <DietaryBadge isVeg={item.is_veg} showText={true} />
            </div>
            <span style={{
              backgroundColor: '#FFFFFF',
              color: '#475234',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <Clock size={12} /> {item.prep_time}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', backgroundColor: '#FAF7F2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '0.76rem', color: '#8D0A13', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.category_name}
              </div>
              <h3 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#141414',
                lineHeight: 1.25
              }}>
                {item.name}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8D0A13', fontSize: '0.92rem', fontWeight: 800 }}>
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <span>{item.rating}</span>
              <span style={{ color: '#888888', fontWeight: 500 }}>({item.rating_count})</span>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#555555', lineHeight: 1.6, marginBottom: '20px' }}>
            {item.description}
          </p>

          {/* Add-ons / Customizations */}
          {item.addons && item.addons.length > 0 && (
            <div style={{
              marginBottom: '20px',
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #EAE5DD',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#141414', marginBottom: '12px' }}>
                Customizations & Add-ons
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <div
                      key={addon.id || addon.name}
                      onClick={() => handleToggleAddon(addon)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: isChecked ? '#FFF4D6' : '#FAF7F2',
                        border: isChecked ? '1.5px solid #FFB800' : '1px solid #EAE5DD',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '1.5px solid #CCCCCC',
                          backgroundColor: isChecked ? '#8D0A13' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}>
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#141414' }}>
                          {addon.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#8D0A13' }}>
                        +₹{addon.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking Instructions Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#141414', marginBottom: '6px' }}>
              Special Cooking Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less spicy, dressing on side, extra napkins..."
              className="form-input"
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {/* Quantity and Add Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #EAE5DD'
          }}>
            {/* Quantity Adjuster */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '9999px',
              padding: '4px',
              border: '1.5px solid #EAE5DD'
            }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8D0A13'
                }}
              >
                <Minus size={15} />
              </button>
              <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.98rem', color: '#141414' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8D0A13'
                }}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Add Button with Total */}
            <button
              onClick={handleAddToCart}
              className="btn-primary"
              style={{ flex: 1, padding: '13px 20px', fontSize: '0.95rem' }}
            >
              <span>Add to Cart</span>
              <span>•</span>
              <span>₹{totalPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
