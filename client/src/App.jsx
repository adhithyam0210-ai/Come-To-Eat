import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './utils/api';
import {
  subscribeToHeroSlides,
  subscribeToFoods,
  subscribeToCategories,
  subscribeToOffers,
  subscribeToCoupons,
  subscribeToBranches,
  subscribeToSettings
} from './utils/supabase';

// Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { SpecialHighlights } from './components/SpecialHighlights';
import { MenuExplorer } from './components/MenuExplorer';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { EmployeePortal } from './components/EmployeePortal';
import { LandingPage } from './components/LandingPage';
import { HomePage } from './components/HomePage';
import { MenuPage } from './components/MenuPage';
import { CategoryPage } from './components/CategoryPage';
import { SearchPage } from './components/SearchPage';
import { OffersPage } from './components/OffersPage';
import { ReviewsPage } from './components/ReviewsPage';
import { SplashScreen } from './components/SplashScreen';

import { MapPin, Phone, Mail, Clock, Heart, Star, ShieldCheck, UtensilsCrossed } from 'lucide-react';

function MainApp() {
  const { user, isAdmin, isEmployee, isStaff } = useAuth();
  const { addToCart } = useCart();

  // Active portal: 'landing', 'user', 'employee', 'admin'
  const [activePortal, setActivePortal] = useState(() => {
    return user ? (user.role === 'admin' ? 'admin' : user.role === 'employee' ? 'employee' : 'user') : 'landing';
  });

  // Current page for user / landing view: 'home', 'search', 'menu', 'category', 'offers', 'reviews'
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Synchronous fast cache initializers to eliminate flicker/glitch on page refresh
  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const raw = localStorage.getItem('cte_cached_hero_slides');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });

  // Sync portal when user logs in or out
  useEffect(() => {
    if (!user) {
      setActivePortal('landing');
    } else if (user.role === 'employee') {
      setActivePortal('employee');
    } else if (user.role === 'admin') {
      setActivePortal('admin');
    } else {
      setActivePortal('user');
    }
  }, [user]);

  // Master Data
  const [categories, setCategories] = useState(() => {
    try {
      const raw = localStorage.getItem('cte_cached_categories');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });

  const [foods, setFoods] = useState(() => {
    try {
      const raw = localStorage.getItem('cte_cached_foods');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });

  const [loading, setLoading] = useState(true);

  // Store Settings (Operating Hours, Delivery Info, Address, Contact)
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('cte_cached_settings');
      return raw ? JSON.parse(raw) : {
        timing_text: 'Open Daily: 10:00 AM – 11:30 PM',
        days_open: 'Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)',
        delivery_text: 'Express 30 Min Delivery',
        contact_address: '100 Feet Rd, Indiranagar, Bengaluru, 560038',
        contact_phone: '+91 98765 43210',
        contact_email: 'hello@cometoeat.com'
      };
    } catch (e) {
      return {
        timing_text: 'Open Daily: 10:00 AM – 11:30 PM',
        days_open: 'Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)',
        delivery_text: 'Express 30 Min Delivery',
        contact_address: '100 Feet Rd, Indiranagar, Bengaluru, 560038',
        contact_phone: '+91 98765 43210',
        contact_email: 'hello@cometoeat.com'
      };
    }
  });

  // Modals & UI States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [detailItem, setDetailItem] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Multi-branch state
  const [branches, setBranches] = useState(() => {
    try {
      const raw = localStorage.getItem('cte_cached_branches');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    if (branch?.id) {
      localStorage.setItem('cte_selected_branch_id', String(branch.id));
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, foodsRes, setRes, slidesRes, branchesRes] = await Promise.all([
        api.get('/categories'),
        api.get('/foods'),
        api.get('/settings').catch(() => null),
        api.get('/hero-slides').catch(() => null),
        api.get('/branches').catch(() => null)
      ]);
      if (catsRes?.success && catsRes.categories) {
        setCategories(catsRes.categories);
        try { localStorage.setItem('cte_cached_categories', JSON.stringify(catsRes.categories)); } catch (e) {}
      }
      if (foodsRes?.success && foodsRes.foods) {
        setFoods(foodsRes.foods);
        try { localStorage.setItem('cte_cached_foods', JSON.stringify(foodsRes.foods)); } catch (e) {}
      }
      if (setRes && setRes.success && setRes.settings) {
        setSettings(setRes.settings);
        try { localStorage.setItem('cte_cached_settings', JSON.stringify(setRes.settings)); } catch (e) {}
      }
      if (slidesRes && slidesRes.success && slidesRes.slides && slidesRes.slides.length > 0) {
        setHeroSlides(slidesRes.slides);
        try { localStorage.setItem('cte_cached_hero_slides', JSON.stringify(slidesRes.slides)); } catch (e) {}
      }
      if (branchesRes && branchesRes.success && branchesRes.branches?.length > 0) {
        setBranches(branchesRes.branches);
        try { localStorage.setItem('cte_cached_branches', JSON.stringify(branchesRes.branches)); } catch (e) {}
        const savedId = localStorage.getItem('cte_selected_branch_id');
        const matched = branchesRes.branches.find(b => b.id === Number(savedId)) || branchesRes.branches[0];
        setSelectedBranch(matched);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleHeroSlidesSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setHeroSlides(e.detail);
      } else {
        api.get('/hero-slides').then(res => {
          if (res.success && res.slides) setHeroSlides(res.slides);
        }).catch(() => {});
      }
    };

    const handleFoodsSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setFoods(e.detail);
      } else {
        api.get('/foods').then(res => {
          if (res.success && res.foods) setFoods(res.foods);
        }).catch(() => {});
      }
    };

    const handleCategoriesSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        api.get('/categories').then(res => {
          if (res.success && res.categories) setCategories(res.categories);
        }).catch(() => {});
      }
    };

    window.addEventListener('cte:hero_slides_updated', handleHeroSlidesSync);
    window.addEventListener('cte:foods_updated', handleFoodsSync);
    window.addEventListener('cte:categories_updated', handleCategoriesSync);

    // Supabase Realtime channel subscriptions across all tabs / devices
    const unsubRealtimeHero = subscribeToHeroSlides((liveSlides) => {
      if (liveSlides && Array.isArray(liveSlides)) {
        setHeroSlides(liveSlides);
      } else {
        api.get('/hero-slides').then(res => {
          if (res.success && res.slides) setHeroSlides(res.slides);
        }).catch(() => {});
      }
    });

    const unsubRealtimeFoods = subscribeToFoods((liveFoods) => {
      if (liveFoods && Array.isArray(liveFoods)) {
        setFoods(liveFoods);
      } else {
        api.get('/foods').then(res => {
          if (res.success && res.foods) setFoods(res.foods);
        }).catch(() => {});
      }
    });

    const unsubRealtimeCategories = subscribeToCategories((liveCats) => {
      if (liveCats && Array.isArray(liveCats)) {
        setCategories(liveCats);
      } else {
        api.get('/categories').then(res => {
          if (res.success && res.categories) setCategories(res.categories);
        }).catch(() => {});
      }
    });

    const unsubRealtimeOffers = subscribeToOffers((liveOffers) => {
      if (liveOffers && Array.isArray(liveOffers)) {
        setOffers(liveOffers);
      } else {
        api.get('/offers').then(res => {
          if (res.success && res.offers) setOffers(res.offers);
        }).catch(() => {});
      }
    });

    const unsubRealtimeCoupons = subscribeToCoupons((liveCoupons) => {
      if (liveCoupons && Array.isArray(liveCoupons)) {
        setCoupons(liveCoupons);
      } else {
        api.get('/coupons').then(res => {
          if (res.success && res.coupons) setCoupons(res.coupons);
        }).catch(() => {});
      }
    });

    const unsubRealtimeBranches = subscribeToBranches((liveBranches) => {
      if (liveBranches && Array.isArray(liveBranches) && liveBranches.length > 0) {
        setBranches(liveBranches);
      } else {
        api.get('/branches').then(res => {
          if (res.success && res.branches) setBranches(res.branches);
        }).catch(() => {});
      }
    });

    const unsubRealtimeSettings = subscribeToSettings((liveSettings) => {
      if (liveSettings && typeof liveSettings === 'object') {
        setSettings(liveSettings);
      } else {
        api.get('/settings').then(res => {
          if (res.success && res.settings) setSettings(res.settings);
        }).catch(() => {});
      }
    });

    return () => {
      window.removeEventListener('cte:hero_slides_updated', handleHeroSlidesSync);
      window.removeEventListener('cte:foods_updated', handleFoodsSync);
      window.removeEventListener('cte:categories_updated', handleCategoriesSync);
      unsubRealtimeHero();
      unsubRealtimeFoods();
      unsubRealtimeCategories();
      unsubRealtimeOffers();
      unsubRealtimeCoupons();
      unsubRealtimeBranches();
      unsubRealtimeSettings();
    };
  }, []);

  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  // When user logs in
  const handleAuthSuccess = (authUser) => {
    setAuthModalOpen(false);
    if (authUser?.role === 'employee') {
      setActivePortal('employee');
    } else if (authUser?.role === 'admin') {
      setActivePortal('admin');
    } else {
      setActivePortal('user');
      if (pendingCheckoutAfterAuth) {
        setPendingCheckoutAfterAuth(false);
        setCheckoutOpen(true);
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setPendingCheckoutAfterAuth(true);
      setAuthTab('login');
      setAuthModalOpen(true);
    } else {
      setCheckoutOpen(true);
    }
  };

  // Multi-page navigation handlers
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat) => {
    let targetCat = cat;
    if (typeof cat === 'string') {
      targetCat = categories.find((c) => c.name.toLowerCase().includes(cat.toLowerCase()) || c.slug === cat) || { name: cat, slug: cat };
    }
    setSelectedCategory(targetCat);
    setCurrentPage('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Checkout -> Payment -> Order Confirmed & Track
  const handleProceedToPayment = (data) => {
    setCheckoutData(data);
    setCheckoutOpen(false);
    setPaymentOpen(true);
  };

  const handleOrderSuccess = (placedOrder) => {
    setPaymentOpen(false);
    setTrackingOrderId(placedOrder.id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Animated Welcome Splash Screen */}
      {showSplash && (
        <SplashScreen
          isLoading={loading}
          onFinish={() => {
            setShowSplash(false);
          }}
        />
      )}

      {/* Top Navigation with Multi-Page routing */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => { setAuthTab('login'); setAuthModalOpen(true); }}
        onOpenOrders={() => setOrderHistoryOpen(true)}
        onOpenProfile={() => setUserProfileOpen(true)}
        onOpenSearch={() => handleNavigate('search')}
        activePortal={activePortal}
        setActivePortal={(portal) => {
          setActivePortal(portal);
          if (portal === 'user') fetchData();
        }}
        settings={settings}
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranch}
      />

      {/* Main Content: Admin View, Employee View, Guest Landing Page, or Authenticated Customer Home */}
      {activePortal === 'admin' ? (
        <AdminPortal
          onSwitchToUserView={() => {
            fetchData();
            setActivePortal('user');
            setCurrentPage('home');
          }}
          onSettingsUpdate={(newSettings) => setSettings(newSettings)}
          onDataUpdate={fetchData}
          branches={branches}
          selectedBranch={selectedBranch}
        />
      ) : activePortal === 'employee' ? (
        <EmployeePortal
          onSwitchToUserView={() => {
            fetchData();
            setActivePortal('user');
            setCurrentPage('home');
          }}
          onDataUpdate={fetchData}
          branches={branches}
          selectedBranch={selectedBranch}
          onSelectBranch={handleSelectBranch}
        />
      ) : activePortal === 'landing' && !user ? (
        <main style={{ flex: 1 }}>
          {currentPage === 'home' && (
            <LandingPage
              heroSlides={heroSlides}
              categories={categories}
              foods={foods}
              settings={settings}
              onOpenAuth={(tab = 'login') => { setAuthTab(tab); setAuthModalOpen(true); }}
              onOpenFoodDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item)}
              onNavigateToMenu={() => handleNavigate('menu')}
              onSelectCategory={handleSelectCategory}
            />
          )}
          {currentPage === 'search' && (
            <SearchPage
              foods={foods}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item)}
            />
          )}
          {currentPage === 'menu' && (
            <MenuPage
              categories={categories}
              foods={foods}
              onSelectCategory={handleSelectCategory}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item)}
            />
          )}
          {currentPage === 'category' && (
            <CategoryPage
              category={selectedCategory}
              allCategories={categories}
              foods={foods}
              onBackToMenu={() => handleNavigate('menu')}
              onSelectCategory={handleSelectCategory}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item)}
            />
          )}
          {currentPage === 'offers' && (
            <OffersPage onNavigateToMenu={() => handleNavigate('menu')} />
          )}
          {currentPage === 'reviews' && (
            <ReviewsPage onOpenAuth={(tab = 'login') => { setAuthTab(tab); setAuthModalOpen(true); }} onOpenOrders={() => setOrderHistoryOpen(true)} />
          )}
        </main>
      ) : (
        <main style={{ flex: 1 }}>
          {currentPage === 'home' && (
            <HomePage
              heroSlides={heroSlides}
              foods={foods}
              onNavigateToMenu={() => handleNavigate('menu')}
              onNavigateToOffers={() => handleNavigate('offers')}
              onNavigateToReviews={() => handleNavigate('reviews')}
              onSelectCategory={handleSelectCategory}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item, 1)}
            />
          )}
          {currentPage === 'search' && (
            <SearchPage
              foods={foods}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item, 1)}
            />
          )}
          {currentPage === 'menu' && (
            <MenuPage
              categories={categories}
              foods={foods}
              onSelectCategory={handleSelectCategory}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item, 1)}
            />
          )}
          {currentPage === 'category' && (
            <CategoryPage
              category={selectedCategory}
              allCategories={categories}
              foods={foods}
              onBackToMenu={() => handleNavigate('menu')}
              onSelectCategory={handleSelectCategory}
              onOpenItemDetail={(item) => setDetailItem(item)}
              onAddToCart={(item) => addToCart(item, 1)}
            />
          )}
          {currentPage === 'offers' && (
            <OffersPage
              onNavigateToMenu={() => handleNavigate('menu')}
              onSelectCategory={handleSelectCategory}
              selectedBranch={selectedBranch}
            />
          )}
          {currentPage === 'reviews' && (
            <ReviewsPage
              selectedBranch={selectedBranch}
              onOpenAuth={(tab = 'login') => { setAuthTab(tab); setAuthModalOpen(true); }}
              onOpenOrders={() => setOrderHistoryOpen(true)}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#1C231B', color: '#CBD4C0', padding: '50px 0 30px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '36px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <img
                  src="/logo.jpg"
                  alt="Come To Eat"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #85926B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.45rem', fontWeight: 700, color: '#FFF' }}>
                  Come To Eat
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#97A38C', lineHeight: 1.6 }}>
                Good Food. Good Mood. Café dedicated to delicious fresh food, authentic flavours, and quick service.
              </p>
            </div>

            <div>
              <h5 style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>Our Specialties</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <span>Gourmet Smash Burgers</span>
                <span>Himalayan Steamed & Tandoori Momos</span>
                <span>Taiwanese Bubble Teas & Boba</span>
                <span>Stone-Baked Neapolitan Pizzas</span>
                <span>Cold Pressed Fresh Fruit Juices</span>
              </div>
            </div>

            <div>
              <h5 style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>Portals & Access</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <button
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                  style={{ textAlign: 'left', color: '#85926B', fontWeight: 700 }}
                >
                  Unified Staff & Customer Login
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                  style={{ textAlign: 'left', color: '#CBD4C0' }}
                >
                  Create Customer Account
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActivePortal(activePortal === 'admin' ? 'user' : 'admin')}
                    style={{ textAlign: 'left', color: '#E76F51', fontWeight: 700 }}
                  >
                    {activePortal === 'admin' ? 'Exit to Customer Portal' : 'Open Admin Operations Dashboard'}
                  </button>
                )}
                {isEmployee && (
                  <button
                    onClick={() => setActivePortal(activePortal === 'employee' ? 'user' : 'employee')}
                    style={{ textAlign: 'left', color: '#85926B', fontWeight: 700 }}
                  >
                    {activePortal === 'employee' ? 'Exit to Customer Portal' : 'Open Employee Kitchen Portal'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#7E8775'
          }}>
            © {new Date().getFullYear()} Come To Eat. All rights reserved. Made with love for good food.
          </div>
        </div>
      </footer>

      {/* Slide-in Cart Drawer */}
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      {/* Food Details & Addons Modal */}
      {detailItem && (
        <FoodDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* Checkout Address & Details Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onProceedToPayment={handleProceedToPayment}
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranch}
      />

      {/* Secure Payment Gateway Modal */}
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        checkoutData={checkoutData}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Live Order Tracker Modal */}
      {trackingOrderId && (
        <OrderTracker
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
          onRefreshList={fetchData}
        />
      )}

      {/* Customer Order History Modal */}
      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        onTrackOrder={(id) => setTrackingOrderId(id)}
      />

      {/* User Profile & Address Manager Modal */}
      <UserProfileModal
        isOpen={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
      />

      {/* Unified Customer & Admin Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authTab}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
