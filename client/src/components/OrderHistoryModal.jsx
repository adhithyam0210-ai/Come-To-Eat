import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Eye, RotateCw, Star, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';

export function OrderHistoryModal({ isOpen, onClose, onTrackOrder }) {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewFoodItem, setReviewFoodItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/user');
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    for (const it of order.items) {
      addToCart(
        {
          id: it.food_id,
          name: it.food_name,
          price: it.unit_price,
          discount_price: null,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          is_veg: 1
        },
        it.quantity,
        it.selected_addons || []
      );
    }
    onClose();
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderNumber}?`)) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason: 'Cancelled by customer before preparation' });
      if (res.success) {
        alert('Order cancelled successfully.');
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewFoodItem) return;

    try {
      const res = await api.post('/reviews', {
        food_id: reviewFoodItem.food_id,
        rating,
        comment
      });
      if (res.success) {
        setReviewSuccess('Thank you for rating your meal!');
        setTimeout(() => {
          setReviewSuccess('');
          setReviewFoodItem(null);
          setComment('');
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.jpg"
              alt="Come To Eat"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #85926B',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                Your Order History
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#7E8775' }}>
                View past receipts, track active orders, or reorder favorites
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#475234', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F0F4E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7E8775' }}>
              Loading your previous orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#F3F6EE',
                color: '#85926B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#1F241C', marginBottom: '6px' }}>
                No past orders found
              </h4>
              <p style={{ color: '#7E8775', fontSize: '0.88rem' }}>
                Your order receipts and live status updates will appear here once you place an order.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {orders.map((ord) => {
                const isActive = !['Delivered', 'Cancelled'].includes(ord.order_status);
                return (
                  <div
                    key={ord.id}
                    style={{
                      border: isActive ? '2px solid #85926B' : '1px solid #ECE7DE',
                      borderRadius: '18px',
                      padding: '18px',
                      backgroundColor: isActive ? '#FAFBF9' : '#FFFFFF',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Top Row: Order #, Date, Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1F241C' }}>
                          Order #{ord.order_number}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#7E8775' }}>
                          {new Date(ord.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {ord.delivery_type === 'pickup' ? 'Takeaway' : 'Delivery'}
                        </div>
                      </div>

                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: ord.order_status === 'Delivered' ? '#E8F5E9' : ord.order_status === 'Cancelled' ? '#FFEBEE' : '#EBF0E4',
                        color: ord.order_status === 'Delivered' ? '#2E7D32' : ord.order_status === 'Cancelled' ? '#C62828' : '#394625',
                        border: '1px solid currentColor'
                      }}>
                        {ord.order_status}
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{
                      backgroundColor: '#FAF8F5',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      marginBottom: '14px'
                    }}>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                          <span><strong>{it.quantity}x</strong> {it.food_name}</span>
                          <span style={{ fontWeight: 600 }}>₹{it.subtotal}</span>
                        </div>
                      ))}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px dashed #CBD4C0',
                        fontWeight: 800,
                        color: '#1F241C'
                      }}>
                        <span>Total Paid</span>
                        <span>₹{ord.final_amount}</span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Track Status: ONLY shown while order is active (NOT delivered and NOT cancelled) */}
                        {ord.order_status !== 'Delivered' && ord.order_status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              onClose();
                              onTrackOrder(ord.id);
                            }}
                            className="btn-outline"
                            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                          >
                            <Eye size={14} /> Track Status
                          </button>
                        )}

                        {/* Reorder: ONLY shown after order is delivered */}
                        {ord.order_status === 'Delivered' && (
                          <button
                            onClick={() => handleReorder(ord)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              border: '1px solid #DCE3D4',
                              backgroundColor: '#FFFFFF',
                              color: '#475234',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <RotateCw size={13} /> Reorder
                          </button>
                        )}

                        {/* Cancel Order: ONLY allowed before preparing stage ('Order Placed', 'Confirmed') */}
                        {['Order Placed', 'Confirmed'].includes(ord.order_status) && (
                          <button
                            onClick={() => handleCancelOrder(ord.id, ord.order_number)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '9999px',
                              border: '1px solid #FFCDD2',
                              backgroundColor: '#FFF5F5',
                              color: '#C62828',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={13} /> Cancel Order
                          </button>
                        )}
                      </div>

                      {/* Review Buttons for Delivered Items */}
                      {ord.order_status === 'Delivered' && ord.items && ord.items.length > 0 && (
                        <button
                          onClick={() => setReviewFoodItem(ord.items[0])}
                          style={{
                            color: '#D97706',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Star size={14} fill="#F59E0B" /> Rate Food
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rate & Review Modal Form */}
          {reviewFoodItem && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1F241C' }}>
                    Rate {reviewFoodItem.food_name}
                  </h4>
                  <button onClick={() => setReviewFoodItem(null)} style={{ color: '#7E8775' }}>
                    <X size={18} />
                  </button>
                </div>

                {reviewSuccess ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#2E7D32', fontWeight: 700 }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 8px' }} />
                    {reviewSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.82rem', color: '#7E8775', marginBottom: '8px' }}>
                        Tap stars to score (1 to 5)
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            style={{ color: rating >= star ? '#F59E0B' : '#DCE3D4' }}
                          >
                            <Star size={28} fill={rating >= star ? '#F59E0B' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                        Your Review
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How was the taste, packaging, and temperature?"
                        className="form-input"
                        style={{ fontSize: '0.88rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px', fontSize: '0.92rem' }}
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
