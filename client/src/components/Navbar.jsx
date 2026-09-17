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
      backgroundColor: 'rgba(250, 248, 245, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(133, 146, 107, 0.18)',
      transition: 'all 0.3s ease'
    }}>
      {/* Single Unified Header Bar (per Notebook Drawing) */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px clamp(16px, 3.5vw, 44px)',
        gap: '16px'
      }}>
        {/* Left: Brand Logo & Name + Branch Dropdown in Same Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.8vw, 20px)', flexShrink: 0 }}>
          <div 
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
          >
            <img
              src="/logo.jpg"
              alt="Come To Eat"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #85926B',
                boxShadow: '0 3px 10px rgba(133, 146, 107, 0.3)',
                flexShrink: 0,
                backgroundColor: '#FFFFFF'
              }}
            />
            <div>
              <div style={{
                fontSize: 'clamp(1.15rem, 3.6vw, 1.45rem)',
                fontWeight: 800,
                color: '#2A3324',
                lineHeight: 1.1,
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap'
              }}>
                Come To Eat
              </div>
              <div style={{
                fontSize: '0.64rem',
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
                color: '#85926B',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}>
                CAFÉ
              </div>
            </div>
          </div>

          {/* Branch selector directly beside shop name */}
          <div className="desktop-only" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F0F4E8',
            padding: '5px 10px',
            borderRadius: '10px',
            border: '1px solid #D6E0CE'
          }}>
            <MapPin size={13} color="#65724F" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475234' }}>Branch:</span>
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const bId = Number(e.target.value);
                const found = branches.find((b) => b.id === bId);
                if (found && onSelectBranch) onSelectBranch(found);
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#2A3324',
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
          <nav style={{ display: 'flex', alignItems: 'center', gap: '22px' }} className="desktop-nav">
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
                    color: isActive ? '#85926B' : '#56604D',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.96rem',
                    padding: '6px 2px',
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
                      height: '2.5px',
                      backgroundColor: '#85926B',
                      borderRadius: '2px'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Corner: Quick Search, Cart, Profile / Login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

          {(activePortal === 'user' || activePortal === 'landing') && (
            <button
              onClick={onOpenSearch}
              title="Search food items"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4A5538',
                backgroundColor: '#F0F4E8'
              }}
            >
              <Search size={18} />
            </button>
          )}

          {(activePortal === 'user' || activePortal === 'landing') && (
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#85926B',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.88rem',
                boxShadow: '0 4px 12px rgba(133, 146, 107, 0.3)'
              }}
            >
              <ShoppingBag size={18} />
              <span className="desktop-only">Cart</span>
              {totalCount > 0 && (
                <span style={{
                  backgroundColor: '#E76F51',
                  color: '#FFF',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DCE3D4',
                  color: '#2A3324',
                  fontWeight: 600,
                  fontSize: '0.88rem'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: user.role === 'admin' ? '#E76F51' : user.role === 'employee' ? '#85926B' : '#556149',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="#7E8775" />
              </button>

              {userDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    padding: '8px',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #F0F4E8' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F241C' }}>{user.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#7E8775', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActivePortal(activePortal === 'admin' ? 'user' : 'admin');
                        setUserDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#475234',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        borderRadius: '8px'
                      }}
                    >
                      <Shield size={16} color="#E76F51" /> {activePortal === 'admin' ? 'Switch to Customer View' : 'Go to Admin Dashboard'}
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
                        padding: '10px 12px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#475234',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        borderRadius: '8px'
                      }}
                    >
                      <UtensilsCrossed size={16} color="#85926B" /> {activePortal === 'employee' ? 'Switch to Customer View' : 'Go to Employee Portal'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenOrders();
                      setUserDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#475234',
                      fontWeight: 500,
                      fontSize: '0.88rem',
                      borderRadius: '8px'
                    }}
                  >
                    <ShoppingBag size={16} color="#85926B" /> Order History & Tracking
                  </button>

                  <button
                    onClick={() => {
                      onOpenProfile();
                      setUserDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#475234',
                      fontWeight: 500,
                      fontSize: '0.88rem',
                      borderRadius: '8px'
                    }}
                  >
                    <User size={16} color="#85926B" /> Profile & Addresses
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to sign out of Come To Eat?')) {
                        logout();
                        setUserDropdown(false);
                        setActivePortal('user');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#C62828',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      borderRadius: '8px',
                      borderTop: '1px solid #F0F4E8',
                      marginTop: '4px'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-outline"
              style={{ padding: '7px 12px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Sign In / Register"
            >
              <User size={16} /> <span className="desktop-only">Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FAF8F5',
          borderTop: '1px solid rgba(133, 146, 107, 0.15)',
          padding: '16px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 12px 24px rgba(0,0,0,0.06)'
        }}>
          {/* Mobile Branch Selector */}
          <div style={{ backgroundColor: '#EBF0E4', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475234', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} /> Branch:
            </span>
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const bId = Number(e.target.value);
                const found = branches.find((b) => b.id === bId);
                if (found && onSelectBranch) onSelectBranch(found);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1F241C',
                border: '1px solid #C4D2B8',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '4px 8px'
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      background: isActive ? '#EBF0E4' : 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: isActive ? '#85926B' : '#475234',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.96rem',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: '1px solid #E8EDE0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {user ? (
              <>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F241C' }}>
                  {user.name}
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActivePortal(activePortal === 'admin' ? 'user' : 'admin');
                      setMobileMenuOpen(false);
                    }}
                    style={{ textAlign: 'left', padding: '6px 0', color: '#E76F51', fontWeight: 700, fontSize: '0.9rem' }}
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
                    style={{ textAlign: 'left', padding: '6px 0', color: '#85926B', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    {activePortal === 'employee' ? 'Switch to Customer View' : 'Employee Live Kitchen Portal'}
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenOrders();
                    setMobileMenuOpen(false);
                  }}
                  style={{ textAlign: 'left', padding: '6px 0', color: '#475234', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  My Orders & Live Tracking
                </button>
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  style={{ textAlign: 'left', padding: '6px 0', color: '#475234', fontWeight: 600, fontSize: '0.9rem' }}
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
                  style={{ textAlign: 'left', padding: '6px 0', color: '#C62828', fontWeight: 700, fontSize: '0.9rem' }}
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
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <User size={16} /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
