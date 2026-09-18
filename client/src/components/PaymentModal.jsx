import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building, Wallet, Banknote, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';

export function PaymentModal({ isOpen, onClose, checkoutData, onOrderSuccess }) {
  const { cartItems, appliedCoupon, priceBreakdown, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiVpa, setUpiVpa] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8921 7843 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState(checkoutData?.customer_name || 'Cardholder Name');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (!isOpen) return null;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessing(true);

    try {
      // 1. Prepare items payload
      const orderPayload = {
        customer_name: checkoutData.customer_name,
        customer_email: checkoutData.customer_email,
        customer_phone: checkoutData.customer_phone,
        delivery_type: checkoutData.delivery_type,
        address: checkoutData.address,
        branch_id: checkoutData?.branch_id || 1,
        branch_name: checkoutData?.branch_name || 'Indiranagar (Flagship)',
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        total_amount: priceBreakdown.itemTotal,
        item_total: priceBreakdown.itemTotal,
        discount_amount: priceBreakdown.discountAmount || 0,
        tax_amount: priceBreakdown.taxes || 0,
        taxes: priceBreakdown.taxes || 0,
        delivery_fee: priceBreakdown.deliveryFee || 0,
        final_amount: priceBreakdown.finalAmount,
        payment_method: paymentMethod,
        payment_details: {
          vpa: paymentMethod === 'UPI' ? upiVpa : undefined,
          cardNumber: paymentMethod === 'Credit/Debit Card' ? cardNumber.slice(-4) : undefined,
          bankName: paymentMethod === 'Net Banking' ? selectedBank : undefined
        },
        items: cartItems.map((item) => ({
          food_id: item.food_id || item.id,
          name: item.name,
          price: item.price,
          unit_price: item.price,
          subtotal: item.subtotal,
          quantity: item.quantity,
          selected_addons: item.selected_addons || []
        }))
      };

      // 2. Call backend order placement endpoint
      const res = await api.post('/orders', orderPayload);

      if (res.success && res.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        clearCart();
        onClose();
        onOrderSuccess(res.order);
      } else {
        throw new Error(res.message || 'Payment authorization failed');
      }
    } catch (err) {
      console.error('Payment failure:', err);
      setPaymentError(err.message || 'Payment could not be processed. Please check your details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header with Security Badge */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2E7D32' }}>
                  <ShieldCheck size={14} /> 256-Bit SSL Encrypted
                </span>
                {checkoutData?.branch_name && (
                  <span style={{ backgroundColor: '#EAF0E2', color: '#475234', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
                    📍 {checkoutData.branch_name}
                  </span>
                )}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 700, color: '#1F241C', marginTop: '2px' }}>
                Choose Payment Method
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#475234', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F0F4E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {paymentError && (
          <div style={{
            margin: '16px 24px 0',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={16} /> {paymentError}
          </div>
        )}

        <form onSubmit={handlePayNow}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            minHeight: '340px'
          }}>
            {/* Left Method Tabs */}
            <div style={{
              backgroundColor: '#F7F9F4',
              borderRight: '1px solid #ECE7DE',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {[
                { id: 'UPI', label: 'UPI / QR', icon: <Smartphone size={16} /> },
                { id: 'Credit/Debit Card', label: 'Cards', icon: <CreditCard size={16} /> },
                { id: 'Net Banking', label: 'Net Banking', icon: <Building size={16} /> },
                { id: 'Wallets', label: 'Wallets', icon: <Wallet size={16} /> },
                { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: <Banknote size={16} /> }
              ].map((m) => {
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      backgroundColor: active ? '#FFFFFF' : 'transparent',
                      color: active ? '#85926B' : '#475234',
                      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      border: active ? '1px solid #E2E8DC' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Method Form Content */}
            <div style={{ padding: '24px' }}>
              {/* UPI Tab */}
              {paymentMethod === 'UPI' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    backgroundColor: '#FAF8F5',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px dashed #CBD4C0',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '8px' }}>
                      Scan QR Code using Google Pay / PhonePe / Paytm
                    </div>
                    {/* Simulated QR Code Canvas */}
                    <div style={{
                      width: '130px',
                      height: '130px',
                      margin: '0 auto 8px',
                      backgroundColor: '#FFFFFF',
                      padding: '8px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=cometoeat@okhdfcbank%26pn=ComeToEatCafe%26cu=INR"
                        alt="UPI Payment QR Code"
                        style={{ width: '100%', height: '100%', borderRadius: '6px' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#7E8775' }}>
                      Instant confirmation upon UPI payment
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Or Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      required
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="form-input"
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {paymentMethod === 'Credit/Debit Card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8921 7843 4242"
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#7E8775', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} /> We do not store your card number or CVV in our database.
                  </div>
                </div>
              )}

              {/* Net Banking Tab */}
              {paymentMethod === 'Net Banking' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475234', marginBottom: '8px' }}>
                    Choose Your Bank
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((b) => (
                      <div
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: selectedBank === b ? '2px solid #85926B' : '1px solid #DCE3D4',
                          backgroundColor: selectedBank === b ? '#EBF0E4' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#2A3324'
                        }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallets Tab */}
              {paymentMethod === 'Wallets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Paytm Wallet', 'Amazon Pay Balance', 'PhonePe Wallet'].map((w) => (
                    <label
                      key={w}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #ECE7DE',
                        cursor: 'pointer'
                      }}
                    >
                      <input type="radio" name="wallet" defaultChecked={w.includes('Paytm')} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2A3324' }}>{w}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Cash on Delivery Tab */}
              {paymentMethod === 'Cash on Delivery' && (
                <div style={{
                  padding: '24px 20px',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '16px',
                  border: '1px solid #ECE7DE',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#EBF0E4',
                    color: '#475234',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <Banknote size={24} />
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>Cash on Delivery</h4>
                  <p style={{ fontSize: '0.85rem', color: '#65705C', lineHeight: 1.5 }}>
                    Pay with exact cash or scan the delivery partner's QR code when your food arrives.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Pay Action */}
          <div style={{
            padding: '18px 24px',
            borderTop: '1px solid #ECE7DE',
            backgroundColor: '#FAF8F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#7E8775', fontWeight: 600 }}>Amount to Pay</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1F241C' }}>
                ₹{priceBreakdown.finalAmount}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn-accent"
              style={{
                padding: '13px 32px',
                fontSize: '1rem',
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? 'wait' : 'pointer'
              }}
            >
              {isProcessing ? 'Verifying Payment...' : `Pay ₹${priceBreakdown.finalAmount} Securely`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
