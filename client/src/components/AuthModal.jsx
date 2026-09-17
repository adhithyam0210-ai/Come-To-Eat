import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Shield, ShieldCheck, ArrowRight, CheckCircle, AlertCircle, UtensilsCrossed, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ isOpen, onClose, defaultTab = 'login', onAuthSuccess }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(defaultTab); // 'login' or 'register'

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const fillDemoCustomer = () => {
    setLoginEmail('alex@example.com');
    setLoginPassword('user123');
    setErrorMessage('');
  };

  const fillDemoEmployee = () => {
    setLoginEmail('chef@cometoeat.com');
    setLoginPassword('employee123');
    setErrorMessage('');
  };

  const fillDemoAdmin = () => {
    setLoginEmail('admin@cometoeat.com');
    setLoginPassword('admin123');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        onClose();
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });
      if (res.success) {
        setSuccessMessage('Account created! Welcome to Come To Eat.');
        setTimeout(() => {
          onClose();
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 800);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          textAlign: 'center',
          backgroundColor: '#FAF8F5',
          borderBottom: '1px solid #ECE7DE',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#F0F4E8',
              color: '#475234',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>

          <img
            src="/logo.jpg"
            alt="Come To Eat"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #85926B',
              margin: '0 auto 12px',
              display: 'block',
              boxShadow: '0 4px 14px rgba(133, 146, 107, 0.35)',
              backgroundColor: '#FFFFFF'
            }}
          />

          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1F241C',
            marginBottom: '4px'
          }}>
            Welcome to Come To Eat
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#6A7463' }}>
            {tab === 'login' ? 'Single login portal for customers & café staff' : 'Create an account to start ordering your favorites'}
          </p>

          {/* Unified Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#E6EADF',
            borderRadius: '9999px',
            padding: '3px',
            marginTop: '16px'
          }}>
            <button
              onClick={() => { setTab('login'); setErrorMessage(''); }}
              style={{
                padding: '8px',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: 700,
                backgroundColor: tab === 'login' ? '#85926B' : 'transparent',
                color: tab === 'login' ? '#FFFFFF' : '#475234',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMessage(''); }}
              style={{
                padding: '8px',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: 700,
                backgroundColor: tab === 'register' ? '#85926B' : 'transparent',
                color: tab === 'register' ? '#FFFFFF' : '#475234',
                transition: 'all 0.2s ease'
              }}
            >
              New Customer
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={15} /> {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle size={15} /> {successMessage}
            </div>
          )}

          {/* Quick Demo Credentials Fill (Super helpful for testers!) */}
          {tab === 'login' && (
            <div style={{
              marginBottom: '20px',
              backgroundColor: '#FAF8F5',
              padding: '12px',
              borderRadius: '14px',
              border: '1px dashed #CBD4C0'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                Quick Demo Access (One-Click)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '8px',
                    backgroundColor: '#EBF0E4',
                    color: '#3B4729',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: '1px solid #DCE3D4',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <User size={13} /> Customer
                </button>
                <button
                  type="button"
                  onClick={fillDemoEmployee}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '8px',
                    backgroundColor: '#E6F4EA',
                    color: '#137333',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: '1px solid #CEEAD6',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <ChefHat size={13} /> Employee Staff
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  style={{
                    padding: '8px 8px',
                    borderRadius: '8px',
                    backgroundColor: '#FDEEE9',
                    color: '#C85437',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: '1px solid #F8CCC0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <ShieldCheck size={13} /> Manager Admin
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#8C9776" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com or admin@cometoeat.com"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#8C9776" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '6px' }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#8C9776" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#8C9776" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#8C9776" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#8C9776" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-accent"
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '6px', justifyContent: 'center' }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
