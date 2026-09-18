import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight, Check, AlertCircle, Truck, Package, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DietaryBadge } from './DietaryBadge';
import { api } from '../utils/api';

export function CartDrawer({ onProceedToCheckout }) {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryType,
    setDeliveryType,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    priceBreakdown
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    if (isCartOpen) {
      api.get('/coupons/active')
        .then((res) => {
          if (res.success && res.coupons) {
            setAvailableCoupons(res.coupons);
          }
        })
        .catch(() => {});
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e, codeToApply) => {
    if (e) e.preventDefault();
    const code = codeToApply || couponInput;
    if (!code || !code.trim()) return;
    setIsApplying(true);
    await applyCoupon(code);
    setIsApplying(false);
    if (!codeToApply) setCouponInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 33, 23, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ECE7DE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FAF8F5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.jpg"
              alt="Come To Eat"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #85926B',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1F241C' }}>
                Your Order
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#7E8775' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in bag
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                style={{ fontSize: '0.78rem', color: '#A0A997', fontWeight: 600, padding: '4px 8px' }}
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#F0F4E8',
                color: '#475234',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center'
          }}>
            <ShoppingBag size={48} color="#85926B" style={{ margin: '0 auto 16px', strokeWidth: 1.5 }} />
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#1F241C', marginBottom: '8px' }}>
              Your bag is hungry
            </h4>
            <p style={{ color: '#7E8775', fontSize: '0.92rem', marginBottom: '24px', maxWidth: '280px' }}>
              Explore our menu to add fresh burgers, momos, and refreshing beverages!
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="btn-primary"
              style={{ padding: '12px 28px' }}
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <>
            {/* Delivery vs Pickup Selector */}
            <div style={{ padding: '14px 20px', backgroundColor: '#F4F7F0', borderBottom: '1px solid #ECE7DE' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: '#E2E8DC',
                padding: '4px',
                borderRadius: '9999px'
              }}>
                <button
                  onClick={() => setDeliveryType('delivery')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    backgroundColor: deliveryType === 'delivery' ? '#85926B' : 'transparent',
                    color: deliveryType === 'delivery' ? '#FFF' : '#475234',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Truck size={16} /> Delivery (30 min)
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    backgroundColor: deliveryType === 'pickup' ? '#85926B' : 'transparent',
                    color: deliveryType === 'pickup' ? '#FFF' : '#475234',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Package size={16} /> Takeaway (Pickup)
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      padding: '14px',
                      backgroundColor: '#FAF8F5',
                      borderRadius: '16px',
                      border: '1px solid #EAE5DC'
                    }}
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '12px',
                        objectFit: 'cover'
                      }}
                    />

                    {/* Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DietaryBadge isVeg={item.is_veg} />
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1F241C' }}>
                              {item.name}
                            </span>
                          </div>

                          {/* Selected Addons */}
                          {item.selected_addons && item.selected_addons.length > 0 && (
                            <div style={{ fontSize: '0.82rem', color: '#7E8775', marginTop: '4px' }}>
                              {item.selected_addons.map((a) => a.name).join(', ')}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          style={{ color: '#C62828', padding: '4px', opacity: 0.8, cursor: 'pointer', border: 'none', background: 'none' }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: '10px'
                      }}>
                        <div style={{ fontWeight: 800, color: '#2A3324', fontSize: '1.08rem' }}>
                          ₹{item.subtotal}
                        </div>

                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '9999px',
                          border: '1.5px solid #DCE3D4',
                          padding: '3px 6px'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <Minus size={15} color="#475234" />
                          </button>
                          <span style={{ minWidth: '26px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#1F241C' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <Plus size={15} color="#475234" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div style={{
                marginTop: '22px',
                padding: '16px',
                backgroundColor: '#FAF8F5',
                borderRadius: '16px',
                border: '1px solid #ECE7DE'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 700, color: '#475234' }}>
                    <Tag size={17} color="#85926B" /> Have a Promo Coupon?
                  </div>
                  {appliedCoupon && (
                    <span style={{ fontSize: '0.78rem', color: '#2E7D32', fontWeight: 700, backgroundColor: '#E8F5E9', padding: '2px 8px', borderRadius: '12px' }}>
                      Active
                    </span>
                  )}
                </div>

                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#EBF0E4',
                    border: '1.5px dashed #85926B',
                    padding: '12px 14px',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#324022', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={16} /> '{appliedCoupon.code}' APPLIED
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#556149', marginTop: '2px' }}>
                        You saved ₹{priceBreakdown.discountAmount} on this order!
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{ fontSize: '0.86rem', color: '#C62828', fontWeight: 800, border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={(e) => handleApplyCoupon(e)} style={{ display: 'flex', gap: '8px', marginBottom: availableCoupons.length > 0 ? '12px' : '0' }}>
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME50, FEAST100"
                        className="form-input"
                        style={{ padding: '10px 14px', fontSize: '0.94rem', textTransform: 'uppercase', flex: 1, fontFamily: 'monospace', fontWeight: 600 }}
                      />
                      <button
                        type="submit"
                        disabled={isApplying || !couponInput.trim()}
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '0.92rem' }}
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </form>

                    {/* Quick Available Coupon Chips */}
                    {availableCoupons.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7E8775', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Available Promo Codes:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {availableCoupons.slice(0, 3).map((cp) => (
                            <button
                              key={cp.id || cp.code}
                              type="button"
                              onClick={() => handleApplyCoupon(null, cp.code)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #DCE3D4',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#475234',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Apply ${cp.code} (${cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} OFF`})`}
                            >
                              <span style={{ fontFamily: 'monospace', color: '#85926B' }}>{cp.code}</span>
                              <span style={{ fontSize: '0.72rem', color: '#E76F51' }}>
                                {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {couponError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C62828', fontSize: '0.82rem', marginTop: '10px' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} /> {couponError}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Details & Checkout Bar */}
            <div style={{
              padding: '22px 24px',
              borderTop: '1px solid #ECE7DE',
              backgroundColor: '#FAF8F5'
            }}>
              {/* Detailed Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.94rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#65705C' }}>
                  <span>Item Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#1F241C' }}>₹{priceBreakdown.itemTotal}</span>
                </div>

                {priceBreakdown.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', fontWeight: 700 }}>
                    <span>Coupon Discount</span>
                    <span>-₹{priceBreakdown.discountAmount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#65705C' }}>
                  <span>Taxes & Restaurant GST (5%)</span>
                  <span>₹{priceBreakdown.taxes}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#65705C' }}>
                  <span>Delivery Fee</span>
                  <span>
                    {priceBreakdown.deliveryFee === 0 ? (
                      <strong style={{ color: '#2E7D32', fontWeight: 800 }}>FREE</strong>
                    ) : (
                      `₹${priceBreakdown.deliveryFee}`
                    )}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  marginTop: '4px',
                  borderTop: '1.5px dashed #CBD4C0',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#1F241C'
                }}>
                  <span>To Pay</span>
                  <span style={{ color: '#85926B' }}>₹{priceBreakdown.finalAmount}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="btn-accent"
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 800, justifyContent: 'center' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
