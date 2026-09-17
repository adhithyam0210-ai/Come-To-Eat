import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Mail, Home, Briefcase, ArrowRight, ShieldCheck, Truck, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export function CheckoutModal({
  isOpen,
  onClose,
  onProceedToPayment,
  branches = [],
  selectedBranch,
  onSelectBranch
}) {
  const { cartItems, deliveryType, setDeliveryType, priceBreakdown, appliedCoupon } = useCart();
  const { user } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Address inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [error, setError] = useState('');

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      api.get('/auth/addresses')
        .then((res) => {
          if (res.success && res.addresses && res.addresses.length > 0) {
            setSavedAddresses(res.addresses);
            const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setStreet(defaultAddr.street);
            setCity(defaultAddr.city);
            setLandmark(defaultAddr.landmark || '');
            if (defaultAddr.phone) setPhone(defaultAddr.phone);
          }
        })
        .catch(() => {});
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setCity(addr.city);
    setLandmark(addr.landmark || '');
    if (addr.phone) setPhone(addr.phone);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Please provide your name, phone number, and email.');
      return;
    }

    if (deliveryType === 'delivery' && !street.trim()) {
      setError('Please provide your complete delivery street address.');
      return;
    }

    const orderData = {
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      delivery_type: deliveryType,
      address: deliveryType === 'delivery' ? { street, city, landmark, phone } : null,
      branch_id: selectedBranch?.id || 1,
      branch_name: selectedBranch?.name || 'Indiranagar (Flagship)'
    };

    onProceedToPayment(orderData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', maxHeight: '92vh' }}
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
              <div style={{ fontSize: '0.78rem', color: '#85926B', fontWeight: 700, textTransform: 'uppercase' }}>
                Step 1 of 2
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                Delivery & Contact Details
              </h3>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#475234', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F0F4E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Fulfilling Kitchen Branch */}
          <div style={{ marginBottom: '20px', backgroundColor: '#F9FAF7', padding: '14px', borderRadius: '14px', border: '1px solid #E4EBDC' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', fontWeight: 700, color: '#475234', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#85926B" /> Fulfilling Kitchen Station (Branch)
              </span>
              <span style={{ fontSize: '0.72rem', color: '#7E8775', fontWeight: 600 }}>Food will be prepared here</span>
            </label>
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const bId = Number(e.target.value);
                const found = branches.find((b) => b.id === bId);
                if (found && onSelectBranch) onSelectBranch(found);
              }}
              className="form-select"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontWeight: 600,
                fontSize: '0.88rem',
                borderRadius: '10px',
                border: '1.5px solid #85926B',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              {branches && branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.address}
                  </option>
                ))
              ) : (
                <option value={1}>Indiranagar (Flagship) — 100 Feet Rd</option>
              )}
            </select>
            {selectedBranch && (
              <div style={{ fontSize: '0.74rem', color: '#687755', marginTop: '8px', lineHeight: 1.4 }}>
                📍 <strong>{selectedBranch.name}</strong> • {selectedBranch.address} {selectedBranch.phone ? `• Call: ${selectedBranch.phone}` : ''}
              </div>
            )}
          </div>

          {/* Delivery or Pickup Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475234', marginBottom: '8px' }}>
              Order Preference
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div
                onClick={() => setDeliveryType('delivery')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: deliveryType === 'delivery' ? '2px solid #85926B' : '1.5px solid #DCE3D4',
                  backgroundColor: deliveryType === 'delivery' ? '#F4F7F0' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: deliveryType === 'delivery' ? '#85926B' : '#EBF0E4',
                  color: deliveryType === 'delivery' ? '#FFFFFF' : '#475234',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F241C' }}>Home Delivery</div>
                  <div style={{ fontSize: '0.74rem', color: '#7E8775' }}>Est. 30–35 min arrival</div>
                </div>
              </div>

              <div
                onClick={() => setDeliveryType('pickup')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: deliveryType === 'pickup' ? '2px solid #85926B' : '1.5px solid #DCE3D4',
                  backgroundColor: deliveryType === 'pickup' ? '#F4F7F0' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: deliveryType === 'pickup' ? '#85926B' : '#EBF0E4',
                  color: deliveryType === 'pickup' ? '#FFFFFF' : '#475234',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F241C' }}>Café Takeaway</div>
                  <div style={{ fontSize: '0.74rem', color: '#7E8775' }}>Ready in 15 min • No fee</div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Addresses (if logged in user) */}
          {deliveryType === 'delivery' && savedAddresses.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475234', marginBottom: '8px' }}>
                Select Saved Address
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #85926B' : '1px solid #DCE3D4',
                        backgroundColor: isSelected ? '#EBF0E4' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#2A3324' }}>
                        {addr.label === 'Home' ? <Home size={14} /> : <Briefcase size={14} />}
                        <span>{addr.label}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#556149', marginTop: '4px', lineHeight: 1.3 }}>
                        {addr.street}, {addr.city}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Address Inputs (Delivery Only) */}
          {deliveryType === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '4px' }}>
                  Street Address / Flat / Building *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Flat 304, Palm Grove Apartments, 12th Main Rd"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '4px' }}>
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near metro / park"
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '4px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div style={{ borderTop: '1px solid #F0F4E8', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2A3324', marginBottom: '12px' }}>
              Contact Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '4px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '4px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#556149', marginBottom: '4px' }}>
                Email Address (for order receipts) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>
          </div>

          {/* Order Summary Recap */}
          <div style={{
            backgroundColor: '#FAF8F5',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid #ECE7DE',
            marginBottom: '20px'
          }}>
            {priceBreakdown.discountAmount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px dashed #CBD4C0',
                fontSize: '0.84rem',
                color: '#2E7D32',
                fontWeight: 700
              }}>
                <span>Coupon ({appliedCoupon?.code}) Applied</span>
                <span>- ₹{priceBreakdown.discountAmount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#7E8775', fontWeight: 600 }}>Total Payable</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2A3324' }}>
                  ₹{priceBreakdown.finalAmount}
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#85926B', fontWeight: 700 }}>
                {cartItems.length} items • All taxes included
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-accent"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
          >
            <span>Proceed to Payment</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
