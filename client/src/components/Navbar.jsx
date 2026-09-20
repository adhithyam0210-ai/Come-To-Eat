import React, { useState } from 'react';
import { ShoppingBag, User, Search, Shield, LogOut, ChevronDown, Menu, X, Clock, MapPin, UtensilsCrossed, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar({
  currentPage = 'home',
  onNavigate = () => {},
  onOpenAuth,
  onOpenOrders,
  onOpenProfile,
  onOpenSearch,
  activePortal,
  setActivePortal,
  settings,
  branches = [],
  selectedBranch,
  onSelectBranch
}) {
  const { user, isAdmin, isEmployee, isStaff, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'search', label: 'Search' },
    { id: 'offers', label: 'Offers' },
    { id: 'reviews', label: 'Reviews' }
  ];

  const handleNavClick = (pageId) => {
    if (activePortal !== 'user' && activePortal !== 'landing') {
      setActivePortal('user');
    }
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'linear-gradient(90deg, #6B0007 0%, #8D0A13 50%, #4D0005 100%)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    }}>
      {/* Single Unified Header Bar (per Notebook Drawing) */}
      <div className="navbar-header-bar">
        {/* Left: Brand Logo & Name + Branch Dropdown in Same Line */}
        <div className="navbar-brand-col">
          <div 
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            <img
              src="/logo.jpg"
              alt="Come To Eat"
              className="navbar-brand-logo"
              style={{ border: '2px solid #FFB800' }}
            />
            <div>
              <div className="navbar-brand-name" style={{ color: '#FFFFFF' }}>
                Come To Eat
              </div>
              <div style={{
                fontSize: '0.64rem',
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
                color: '#FFB800',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}>
                DYNAMIC CAFÉ
              </div>
            </div>
          </div>

          {/* Branch selector directly beside shop name */}
          <div className="desktop-only" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '5px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.22)'
          }}>
            <MapPin size={13} color="#FFB800" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)' }}>Branch:</span>
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const bId = Number(e.target.value);
                const found = branches.find((b) => b.id === bId);
                if (found && onSelectBranch) onSelectBranch(found);
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                paddingRight: '4px'
              }}
              title="Select branch"
            >
              {branches && branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id} style={{ color: '#1F241C', backgroundColor: '#FFFFFF' }}>
                    {b.name}
                  </option>
                ))
              ) : (
                <option value={1} style={{ color: '#1F241C', backgroundColor: '#FFFFFF' }}>
                  Indiranagar (Flagship)
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Center: Navigation Links (Home, Menu, Search, Offers, Reviews) */}
        {(activePortal === 'user' || activePortal === 'landing') && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '26px' }} className="desktop-nav">
            {navItems.map((item) => {
              const isActive = (currentPage === item.id) || (item.id === 'menu' && currentPage === 'category');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? '#FFB800' : 'rgba(255, 255, 255, 0.92)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '1.02rem',
                    padding: '8px 4px',
                    position: 'relative',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: '#FFB800',
                      borderRadius: '2px'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Corner: Quick Search, Cart, Profile / Login */}
        <div className="navbar-actions-col">
          {(activePortal === 'user' || activePortal === 'landing') && (
            <button
              onClick={onOpenSearch}
              title="Search food items"
              className="navbar-icon-btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.25)'
              }}
            >
              <Search size={18} />
            </button>
          )}

          {(activePortal === 'user' || activePortal === 'landing') && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="navbar-cart-btn"
              title="View Bag"
              style={{
                backgroundColor: '#FFB800',
                color: '#000000',
                boxShadow: '0 4px 14px rgba(255, 184, 0, 0.4)'
              }}
            >
              <ShoppingBag size={18} color="#000000" />
              <span className="desktop-only" style={{ fontWeight: 800, fontSize: '0.94rem', color: '#000000' }}>Cart</span>
              {totalCount > 0 && (
                <span className="navbar-cart-badge" style={{ backgroundColor: '#8D0A13', color: '#FFFFFF', borderColor: '#FFB800' }}>
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* User profile dropdown button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="navbar-icon-btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: user.role === 'admin' ? '#FFB800' : (user.role === 'employee' ? '#FFB800' : '#8D0A13'),
                  color: user.role === 'admin' || user.role === 'employee' ? '#8D0A13' : '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {userDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '240px',
                  backgroundColor: '#161616',
                  borderRadius: '16px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,184,0,0.2)',
                  padding: '10px',
                  zIndex: 200,
                  color: '#FFFFFF'
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFFFFF' }}>{user.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#FFB800' }}>{user.email}</div>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActivePortal(activePortal === 'admin' ? 'user' : 'admin');
                        setUserDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#FFB800',
                        fontWeight: 800,
                        fontSize: '0.94rem',
                        borderRadius: '10px'
                      }}
                    >
                      <Shield size={18} color="#FFB800" /> {activePortal === 'admin' ? 'Switch to Customer View' : 'Manager Admin Portal'}
                    </button>
                  )}

                  {user.role === 'employee' && (
                    <button
                      onClick={() => {
                        setActivePortal(activePortal === 'employee' ? 'user' : 'employee');
                        setUserDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#FFB800',
                        fontWeight: 800,
                        fontSize: '0.94rem',
                        borderRadius: '10px'
                      }}
                    >
                      <UtensilsCrossed size={18} color="#FFB800" /> {activePortal === 'employee' ? 'Switch to Customer View' : 'Go to Employee Portal'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenOrders();
                      setUserDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.94rem',
                      borderRadius: '10px'
                    }}
                  >
                    <ShoppingBag size={18} color="#FFB800" /> Order History & Tracking
                  </button>

                  <button
                    onClick={() => {
                      onOpenProfile();
                      setUserDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.94rem',
                      borderRadius: '10px'
                    }}
                  >
                    <User size={18} color="#FFB800" /> Profile & Addresses
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#FF4D4D',
                      fontWeight: 700,
                      fontSize: '0.94rem',
                      borderRadius: '10px'
                    }}
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="navbar-login-btn"
              style={{
                backgroundColor: '#FFB800',
                color: '#8D0A13',
                padding: '8px 22px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 184, 0, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                marginLeft: '6px'
              }}
            >
              <User size={16} color="#8D0A13" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="navbar-icon-btn mobile-toggle"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#161616',
          borderTop: '1px solid rgba(255, 184, 0, 0.2)',
          padding: '18px 22px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
          color: '#FFFFFF'
        }}>
          {/* Mobile Branch Selector */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFB800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} /> Outlet Branch:
            </span>
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const bId = Number(e.target.value);
                const found = branches.find((b) => b.id === bId);
                if (found && onSelectBranch) onSelectBranch(found);
              }}
              style={{
                backgroundColor: '#262626',
                color: '#FFFFFF',
                border: '1.5px solid #FFB800',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '6px 12px'
              }}
            >
              {branches && branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              ) : (
                <option value={1}>Indiranagar (Flagship)</option>
              )}
            </select>
          </div>
          {(activePortal === 'user' || activePortal === 'landing') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map((item) => {
                const isActive = (currentPage === item.id) || (item.id === 'menu' && currentPage === 'category');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavClick(item.id);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      background: isActive ? '#8D0A13' : 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: isActive ? '#FFB800' : '#FFFFFF',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '1.08rem',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              <>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {user.name}
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActivePortal(activePortal === 'admin' ? 'user' : 'admin');
                      setMobileMenuOpen(false);
                    }}
                    style={{ textAlign: 'left', padding: '10px 4px', color: '#FFB800', fontWeight: 800, fontSize: '1rem' }}
                  >
                    {activePortal === 'admin' ? 'Switch to Customer View' : 'Manager Admin Dashboard'}
                  </button>
                )}
                {user.role === 'employee' && (
                  <button
                    onClick={() => {
                      setActivePortal(activePortal === 'employee' ? 'user' : 'employee');
                      setMobileMenuOpen(false);
                    }}
                    style={{ textAlign: 'left', padding: '10px 4px', color: '#FFB800', fontWeight: 800, fontSize: '1rem' }}
                  >
                    {activePortal === 'employee' ? 'Switch to Customer View' : 'Employee Live Kitchen Portal'}
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenOrders();
                    setMobileMenuOpen(false);
                  }}
                  style={{ textAlign: 'left', padding: '10px 4px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.98rem' }}
                >
                  My Orders & Live Tracking
                </button>
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  style={{ textAlign: 'left', padding: '10px 4px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.98rem' }}
                >
                  My Addresses & Profile
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to sign out of Come To Eat?')) {
                      logout();
                      setMobileMenuOpen(false);
                      setActivePortal('user');
                    }
                  }}
                  style={{ textAlign: 'left', padding: '10px 4px', color: '#C62828', fontWeight: 800, fontSize: '0.98rem' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
              >
                <User size={18} /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
