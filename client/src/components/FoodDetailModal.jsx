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
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '0.76rem', color: '#85926B', fontWeight: 700, textTransform: 'uppercase' }}>
                {item.category_name}
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#1F241C',
                lineHeight: 1.25
              }}>
                {item.name}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '0.92rem', fontWeight: 700 }}>
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <span>{item.rating}</span>
              <span style={{ color: '#97A38C', fontWeight: 400 }}>({item.rating_count})</span>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#65705C', lineHeight: 1.6, marginBottom: '20px' }}>
            {item.description}
          </p>

          {/* Add-ons / Customizations */}
          {item.addons && item.addons.length > 0 && (
            <div style={{
              marginBottom: '20px',
              backgroundColor: '#FAF8F5',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #ECE7DE'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2A3324', marginBottom: '12px' }}>
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
                        backgroundColor: isChecked ? '#EBF0E4' : '#FFFFFF',
                        border: isChecked ? '1.5px solid #85926B' : '1px solid #E6EADF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '1.5px solid #9AA590',
                          backgroundColor: isChecked ? '#85926B' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF'
                        }}>
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#2A3324' }}>
                          {addon.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475234' }}>
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '6px' }}>
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
            borderTop: '1px solid #F0F4E8'
          }}>
            {/* Quantity Adjuster */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#F3F6EE',
              borderRadius: '9999px',
              padding: '4px',
              border: '1.5px solid #DCE3D4'
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
                  color: '#475234'
                }}
              >
                <Minus size={15} />
              </button>
              <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.98rem', color: '#1F241C' }}>
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
                  color: '#475234'
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
