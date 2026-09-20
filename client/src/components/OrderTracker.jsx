import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Truck, ChefHat, Package, AlertCircle, Phone, RefreshCw, MapPin, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { subscribeToLiveOrders } from '../utils/supabase';

const ORDER_STEPS = [
  { key: 'Order Placed', label: 'Order Placed', icon: Clock, desc: 'Your order was received by the café.' },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Kitchen accepted and verified payment.' },
  { key: 'Preparing', label: 'Preparing', icon: ChefHat, desc: 'Chef is preparing your fresh meal.' },
  { key: 'Ready', label: 'Ready', icon: Package, desc: 'Food is packed and ready for dispatch.' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, desc: 'Rider is on the way with your order.' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle, desc: 'Delivered. Enjoy your hot meal!' }
];

export function OrderTracker({ orderId, onClose, onRefreshList }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to fetch order tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const unsubRealtime = subscribeToLiveOrders((updatedOrder) => {
      if (updatedOrder && (String(updatedOrder.id) === String(orderId) || updatedOrder.order_number === orderId)) {
        setOrder(prev => ({ ...prev, ...updatedOrder }));
        if (onRefreshList) onRefreshList();
      }
    });

    const interval = setInterval(fetchOrder, 10000);
    return () => {
      unsubRealtime();
      clearInterval(interval);
    };
  }, [orderId]);

  if (!order && loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={32} color="#85926B" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ marginTop: '14px', color: '#65705C', fontWeight: 600 }}>Fetching real-time tracking details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.order_status === 'Cancelled';
  const isPickup = order.delivery_type === 'pickup';

  // Find index of current status
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.order_status);

  const canCancel = ['Order Placed', 'Confirmed'].includes(order.order_status);

  const handleCancelOrder = async () => {
    setActionError('');
    try {
      const res = await api.post(`/orders/${order.id}/cancel`, { reason: cancelReason || 'Cancelled by customer' });
      if (res.success && res.order) {
        setOrder(res.order);
        setShowCancelModal(false);
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to cancel order.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#161616',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.jpg"
              alt="Come To Eat"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #FFB800',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  LIVE ORDER TRACKER
                </span>
                <button
                  onClick={fetchOrder}
                  title="Refresh order status"
                  style={{ color: '#FFB800', display: 'flex', alignItems: 'center' }}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                Order #{order.order_number}
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#FAF7F2' }}>
          {/* Cancelled Banner */}
          {isCancelled ? (
            <div style={{
              backgroundColor: '#FFEBEE',
              border: '1.5px solid #FFCDD2',
              padding: '16px',
              borderRadius: '16px',
              color: '#D32F2F',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={24} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>Order Cancelled</div>
                <div style={{ fontSize: '0.82rem' }}>
                  {order.cancellation_reason || 'This order was cancelled and any debited payment has been refunded.'}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ETA Banner */}
              <div style={{
                backgroundColor: '#161616',
                border: '1.5px solid #FFB800',
                borderRadius: '18px',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isPickup ? 'Takeaway Status' : 'Estimated Delivery'}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    {order.order_status === 'Delivered'
                      ? 'Meal Delivered'
                      : isPickup
                      ? 'Ready in ~15 minutes'
                      : `Arriving in ~${order.estimated_delivery_minutes || 30} mins`}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#8D0A13',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(141,10,19,0.4)'
                }}>
                  {isPickup ? <Package size={22} /> : <Truck size={22} />}
                </div>
              </div>

              {/* Visual Status Progress Timeline */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#141414', marginBottom: '16px' }}>
                  Order Status Progress
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  {ORDER_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                        {/* Connecting Line */}
                        {idx < ORDER_STEPS.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '17px',
                            top: '32px',
                            bottom: '-12px',
                            width: '2px',
                            backgroundColor: currentStepIndex > idx ? '#8D0A13' : '#EAE5DD'
                          }} />
                        )}

                        {/* Step Circle */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? '#8D0A13' : isCompleted ? '#FFF4D6' : '#FFFFFF',
                          border: isCurrent ? '2px solid #8D0A13' : isCompleted ? '2px solid #FFB800' : '2px solid #EAE5DD',
                          color: isCurrent ? '#FFFFFF' : isCompleted ? '#8D0A13' : '#999999',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(141, 10, 19, 0.2)' : 'none',
                          transition: 'all 0.3s ease'
                        }}>
                          <StepIcon size={18} />
                        </div>

                        {/* Step Details */}
                        <div style={{ flex: 1, paddingTop: '4px' }}>
                          <div style={{
                            fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                            fontSize: '0.92rem',
                            color: isCurrent ? '#8D0A13' : isCompleted ? '#141414' : '#888888'
                          }}>
                            {step.label} {isCurrent && ' (Current)'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: isCompleted ? '#555555' : '#999999', marginTop: '2px' }}>
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Partner Details (if delivery) */}
              {order.delivery && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #EAE5DD',
                  marginBottom: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8D0A13', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Delivery Partner Integration
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#141414' }}>
                        {order.delivery.driver_name || 'Rohan Sharma'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#666666' }}>
                        {order.delivery.provider} • Code: {order.delivery.tracking_code}
                      </div>
                    </div>
                    {order.delivery.driver_phone && (
                      <a
                        href={`tel:${order.delivery.driver_phone}`}
                        style={{
                          backgroundColor: '#8D0A13',
                          color: '#FFFFFF',
                          padding: '8px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={13} /> Call Rider
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Itemized Order Recap */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid #EAE5DD',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#141414', marginBottom: '10px' }}>
              Ordered Items
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.items?.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: '#444444' }}>
                    <strong>{it.quantity}x</strong> {it.food_name}
                  </span>
                  <span style={{ fontWeight: 800, color: '#141414' }}>₹{it.subtotal}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px dashed #FFB800',
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#8D0A13'
            }}>
              <span>Total Paid ({order.payment_method})</span>
              <span>₹{order.final_amount}</span>
            </div>
          </div>

          {/* Actions: Cancel Order (if permitted) */}
          {canCancel && !isCancelled && (
            <div style={{ textAlign: 'center' }}>
              {showCancelModal ? (
                <div style={{
                  backgroundColor: '#FFF3E0',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid #FFE0B2',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E65100', marginBottom: '6px' }}>
                    Confirm Cancellation
                  </div>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancelling..."
                    className="form-input"
                    style={{ fontSize: '0.85rem', marginBottom: '10px' }}
                  />
                  {actionError && (
                    <div style={{ color: '#C62828', fontSize: '0.78rem', marginBottom: '8px' }}>
                      {actionError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCancelOrder}
                      style={{
                        backgroundColor: '#C62828',
                        color: '#FFF',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem'
                      }}
                    >
                      Yes, Cancel Order
                    </button>
                    <button
                      onClick={() => setShowCancelModal(false)}
                      style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    color: '#C62828',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  Need to cancel this order?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
