import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Plus, Trash2, Home, Briefcase, Phone, Mail, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export function UserProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New address form state
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/addresses');
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAddresses();
      if (user.phone) setPhone(user.phone);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    if (!street.trim() || !city.trim() || !phone.trim()) {
      setError('Street, city, and phone are required.');
      return;
    }

    try {
      const res = await api.post('/auth/addresses', {
        label,
        street,
        city,
        landmark,
        phone,
        is_default: isDefault
      });
      if (res.success) {
        setShowAddForm(false);
        setStreet('');
        setLandmark('');
        fetchAddresses();
      }
    } catch (err) {
      setError(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      fetchAddresses();
    } catch (e) {}
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FFB800',
              color: '#8D0A13',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {user.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 600 }}>
                Customer Account Profile
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#FAF7F2' }}>
          {/* Contact Details Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid #EAE5DD',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#141414' }}>
              <Mail size={16} color="#8D0A13" /> <strong>Email:</strong> {user.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#141414' }}>
              <Phone size={16} color="#8D0A13" /> <strong>Phone:</strong> {user.phone || 'Not set'}
            </div>
          </div>

          {/* Saved Addresses Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#141414' }}>
              Saved Delivery Addresses
            </h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                color: '#8D0A13',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={15} /> {showAddForm ? 'Cancel' : 'Add New Address'}
            </button>
          </div>

          {/* Add Address Form */}
          {showAddForm && (
            <form onSubmit={handleAddAddress} style={{
              backgroundColor: '#FFFFFF',
              padding: '18px',
              borderRadius: '16px',
              border: '1px solid #EAE5DD',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
            }}>
              {error && <div style={{ color: '#D32F2F', fontSize: '0.8rem', fontWeight: 700 }}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px' }}>
                {['Home', 'Work', 'Other'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLabel(l)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: label === l ? '#8D0A13' : '#F5F5F5',
                      color: label === l ? '#FFFFFF' : '#444444',
                      border: '1px solid #EAE5DD'
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street Address, House / Flat No."
                className="form-input"
                style={{ fontSize: '0.86rem' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Landmark"
                  className="form-input"
                  style={{ fontSize: '0.86rem' }}
                />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.86rem' }}
                />
              </div>

              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact Phone Number"
                className="form-input"
                style={{ fontSize: '0.86rem' }}
              />

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px', fontSize: '0.88rem' }}
              >
                Save Address
              </button>
            </form>
          )}

          {/* Address Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE5DD',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#141414', fontSize: '0.9rem' }}>
                    {addr.label === 'Home' ? <Home size={15} color="#8D0A13" /> : <Briefcase size={15} color="#8D0A13" />}
                    <span>{addr.label}</span>
                    {addr.is_default === 1 && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FFF4D6', color: '#8D0A13', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#555555', marginTop: '4px', lineHeight: 1.4 }}>
                    {addr.street}, {addr.city} {addr.landmark ? `(Near: ${addr.landmark})` : ''}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888888', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={12} /> {addr.phone}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  style={{ color: '#D32F2F', padding: '4px', opacity: 0.8 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
