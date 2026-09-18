import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, FolderTree, Users, CreditCard,
  Truck, Tag, MessageSquare, Plus, Edit2, Trash2, CheckCircle, CheckCircle2, Check, AlertTriangle,
  Search, RefreshCw, X, ArrowUpRight, ArrowRight, TrendingUp, Shield, Clock, Eye, ChefHat, Package, Sparkles,
  Building, MapPin, Phone, Mail
} from 'lucide-react';
import { api, DEFAULT_HERO_SLIDES } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { subscribeToLiveOrders } from '../utils/supabase';
import { ImageUploadField } from './ImageUploadField';

export function AdminPortal({
  onSwitchToUserView,
  onSettingsUpdate,
  onDataUpdate,
  branches: initialBranches = [],
  selectedBranch
}) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Operational State
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Store Settings State (Timings, Address, Delivery)
  const [settings, setSettings] = useState({
    timing_text: 'Open Daily: 10:00 AM – 11:30 PM',
    days_open: 'Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)',
    delivery_text: 'Express 30 Min Delivery',
    contact_address: '100 Feet Rd, Indiranagar, Bengaluru, 560038',
    contact_phone: '+91 98765 43210',
    contact_email: 'hello@cometoeat.com'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Food Item Modal
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    category_id: '',
    price: '',
    discount_price: '',
    is_veg: 1,
    is_available: 1,
    prep_time: '15 min',
    image_url: '',
    description: '',
    is_featured: 0
  });

  // Category Modal (Add / Edit)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  // Coupon Modal (Add / Edit)
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount: '',
    start_date: '',
    end_date: '',
    is_active: 1
  });

  // Hero Slide Modal (Add / Edit)
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    tag: 'CHEF SIGNATURE',
    script: 'Savor Every Bite',
    title: '',
    desc: '',
    image_url: '',
    button_text: 'Order Now',
    bg_color: '#949E7C',
    accent_text: '',
    target_category: 'Burgers and Sandwiches'
  });

  // Branches State & Modal
  const [branches, setBranches] = useState(initialBranches);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    is_active: 1
  });

  // Order Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Chef's Recommendation filter inside Landing Page tab
  const [chefCatFilter, setChefCatFilter] = useState('all');
  const [chefSearchTerm, setChefSearchTerm] = useState('');

  // Offer Banners State & Modal
  const [offers, setOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    tag: 'PROMO',
    description: '',
    image_url: '',
    button_text: 'Claim Offer & Order',
    target_category: 'Burgers and Sandwiches',
    bg_color: '#85926B',
    branch_id: ''
  });

  // Fetch functions
  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches?all=true');
      if (res.success && res.branches) {
        setBranches(res.branches);
      }
    } catch (e) {}
  };

  // Staff & Employees State & Modals
  const [employees, setEmployees] = useState([]);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    branch_id: ''
  });
  const [transferEmployee, setTransferEmployee] = useState(null);
  const [transferBranchId, setTransferBranchId] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      if (res.success && res.employees) {
        setEmployees(res.employees);
      }
    } catch (e) {}
  };

  const fetchDashboardStats = async (branchId = selectedBranchFilter) => {
    try {
      const q = branchId && branchId !== 'all' ? `?branch_id=${branchId}` : '';
      const res = await api.get(`/admin/dashboard${q}`);
      if (res.success) setStats(res.stats);
    } catch (e) {}
  };

  const fetchOrders = async (branchId = selectedBranchFilter) => {
    try {
      setLoading(true);
      const q = branchId && branchId !== 'all' ? `?branch_id=${branchId}` : '';
      const res = await api.get(`/orders/admin/all${q}`);
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await api.get('/foods');
      if (res.success) setFoods(res.foods);
    } catch (e) {}
  };

  const handleDeleteBranch = async (branchId, branchName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the "${branchName}" outlet?`)) return;
    try {
      const res = await api.delete(`/branches/${branchId}`);
      if (res.success) {
        setMessage(`Branch "${branchName}" deleted successfully.`);
        fetchBranches();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete branch outlet.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/admin');
      if (res.success && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
        return;
      }
    } catch (e) {
      console.warn('Admin categories endpoint failed, falling back to public route:', e);
    }
    try {
      const fallback = await api.get('/categories');
      if (fallback.success && fallback.categories) {
        setCategories(fallback.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories fallback:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      if (res.success) setCustomers(res.customers);
    } catch (e) {}
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      if (res.success) setPayments(res.payments);
    } catch (e) {}
  };

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/admin/deliveries');
      if (res.success) setDeliveries(res.deliveries);
    } catch (e) {}
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons/admin');
      if (res.success) setCoupons(res.coupons);
    } catch (e) {}
  };

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers/admin');
      if (res.success && res.offers) setOffers(res.offers);
    } catch (e) {}
  };

  const fetchHeroSlides = async () => {
    try {
      const res = await api.get('/hero-slides/admin');
      if (res.success && Array.isArray(res.slides)) {
        setHeroSlides(res.slides);
        return;
      }
    } catch (e) {}
    try {
      const fallback = await api.get('/hero-slides');
      if (fallback.success && Array.isArray(fallback.slides)) {
        setHeroSlides(fallback.slides);
        return;
      }
    } catch (err) {}
    setHeroSlides(DEFAULT_HERO_SLIDES);
  };

  const handleReloadDefaultSlides = async () => {
    try {
      for (const slide of DEFAULT_HERO_SLIDES) {
        await api.put(`/hero-slides/${slide.id}`, slide);
      }
      setHeroSlides(DEFAULT_HERO_SLIDES);
      setMessage('Default hero slides restored successfully in cloud database.');
      if (onDataUpdate) onDataUpdate();
    } catch (e) {
      alert('Failed to reload default slides');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchOrders();
    fetchFoods();
    fetchCategories();
    fetchCustomers();
    fetchPayments();
    fetchDeliveries();
    fetchCoupons();
    fetchOffers();
    fetchHeroSlides();
    fetchSettings();
    fetchBranches();
    fetchEmployees();

    // Supabase Realtime / SSE Live Reflection Subscription
    const unsubscribe = subscribeToLiveOrders((updatedOrder, eventType) => {
      setMessage(`Realtime order event: Order #${updatedOrder.order_number} ${eventType === 'ORDER_CREATED' ? 'received!' : 'updated.'}`);
      fetchOrders(selectedBranchFilter);
      fetchDashboardStats(selectedBranchFilter);
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss toast message after 4.5s
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 4500);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Category Save (Add & Edit)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory.id}`, categoryForm);
        if (res.success) setMessage('Category updated successfully.');
      } else {
        const res = await api.post('/categories', categoryForm);
        if (res.success) setMessage('New category created successfully.');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchCategories();
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.success) {
        setMessage('Category deleted successfully.');
        fetchCategories();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  // Coupon Save (Add & Edit with start/end date)
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        const res = await api.put(`/coupons/${editingCoupon.id}`, couponForm);
        if (res.success) setMessage(`Coupon "${couponForm.code}" modified successfully.`);
      } else {
        const res = await api.post('/coupons', couponForm);
        if (res.success) setMessage(`New coupon "${couponForm.code}" created successfully.`);
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      fetchCoupons();
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert(err.message || 'Failed to save coupon.');
    }
  };

  const handleToggleCouponStatus = async (cp) => {
    try {
      const nextActive = (cp.is_active === 1 || cp.is_active === true) ? 0 : 1;
      const res = await api.put(`/coupons/${cp.id}`, { ...cp, is_active: nextActive });
      if (res.success) {
        setMessage(`Coupon "${cp.code}" is now ${nextActive === 1 ? 'Active' : 'Inactive'}.`);
        fetchCoupons();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to update coupon status.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this coupon?')) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.success) {
        setMessage('Coupon deleted successfully.');
        fetchCoupons();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete coupon.');
    }
  };

  // Hero Slide Save (Add & Edit)
  const handleSaveHeroSlide = async (e) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        const res = await api.put(`/hero-slides/${editingSlide.id}`, slideForm);
        if (res.success) setMessage('Hero banner slide updated successfully.');
      } else {
        const res = await api.post('/hero-slides', slideForm);
        if (res.success) setMessage('New hero slide created successfully.');
      }
      setShowSlideModal(false);
      setEditingSlide(null);
      await fetchHeroSlides();
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert(err.message || 'Failed to save hero slide.');
    }
  };

  const handleDeleteHeroSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero slide?')) return;
    try {
      const res = await api.delete(`/hero-slides/${id}`);
      if (res.success) {
        setMessage('Hero slide deleted successfully.');
        await fetchHeroSlides();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete hero slide.');
    }
  };

  // Store Settings & Timings Save
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSettingsLoading(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        setMessage('Store timings and operational info updated successfully!');
        if (onSettingsUpdate) onSettingsUpdate(res.settings);
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to save store settings.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveLandingCards = async (e) => {
    if (e) e.preventDefault();
    setSettingsLoading(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        setMessage('Landing page brand headline and promise cards saved successfully!');
        if (onSettingsUpdate) onSettingsUpdate(res.settings);
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to save landing page cards.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Branch Save (Add & Edit)
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        const res = await api.put(`/branches/${editingBranch.id}`, branchForm);
        if (res.success) {
          setMessage(`Branch "${res.branch.name}" updated successfully.`);
        }
      } else {
        const res = await api.post('/branches', branchForm);
        if (res.success) {
          setMessage(`New branch "${res.branch.name}" added.`);
        }
      }
      setShowBranchModal(false);
      setEditingBranch(null);
      fetchBranches();
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert(err.message || 'Failed to save branch.');
    }
  };

  const openAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      code: '',
      address: '',
      phone: '',
      is_active: 1
    });
    setShowBranchModal(true);
  };

  const openEditBranch = (br) => {
    setEditingBranch(br);
    setBranchForm({
      name: br.name || '',
      code: br.code || '',
      address: br.address || '',
      phone: br.phone || '',
      is_active: br.is_active !== undefined ? br.is_active : 1
    });
    setShowBranchModal(true);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/employees', employeeForm);
      if (res.success) {
        setMessage(`Employee account for "${res.employee.name}" created successfully.`);
        setShowAddEmployeeModal(false);
        setEmployeeForm({ name: '', email: '', password: '', branch_id: '' });
        fetchEmployees();
      }
    } catch (err) {
      alert(err.message || 'Failed to create employee account.');
    }
  };

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    if (!transferEmployee || !transferBranchId) return;
    try {
      const res = await api.post(`/admin/employees/${transferEmployee.id}/transfer`, {
        branch_id: Number(transferBranchId)
      });
      if (res.success) {
        setMessage(`Branch transfer initiated for ${transferEmployee.name}. Pending employee confirmation upon login.`);
        setTransferEmployee(null);
        setTransferBranchId('');
        fetchEmployees();
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate transfer.');
    }
  };

  const handleCancelTransfer = async (employeeId) => {
    if (!window.confirm('Cancel this pending transfer request?')) return;
    try {
      const res = await api.delete(`/admin/employees/${employeeId}/transfer`);
      if (res.success) {
        setMessage('Transfer request cancelled.');
        fetchEmployees();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel transfer.');
    }
  };

  // Food Availability Toggle
  const handleToggleAvailability = async (foodId) => {
    try {
      const res = await api.patch(`/foods/${foodId}/availability`);
      if (res.success) {
        fetchFoods();
        setMessage('Food availability updated.');
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert('Failed to toggle food availability');
    }
  };

  // Food Save
  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      if (editingFood) {
        await api.put(`/foods/${editingFood.id}`, foodForm);
        setMessage('Food item updated successfully.');
      } else {
        await api.post('/foods', foodForm);
        setMessage('New food item added.');
      }
      setShowAddFoodModal(false);
      setEditingFood(null);
      fetchFoods();
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert(err.message || 'Failed to save food item');
    }
  };

  // Food Delete
  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to permanently delete this food item?')) return;
    try {
      const res = await api.delete(`/foods/${foodId}`);
      if (res.success) {
        setMessage('Food item deleted successfully.');
        fetchFoods();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete food item.');
    }
  };

  const openEditFood = (food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      category_id: food.category_id,
      price: food.price,
      discount_price: food.discount_price || '',
      is_veg: food.is_veg,
      is_available: food.is_available,
      prep_time: food.prep_time || '15 min',
      image_url: food.image_url,
      description: food.description,
      is_featured: food.is_featured || 0
    });
    setShowAddFoodModal(true);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      image_url: ''
    });
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || ''
    });
    setShowCategoryModal(true);
  };

  const openAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      max_discount: '',
      start_date: '',
      end_date: '',
      is_active: 1
    });
    setShowCouponModal(true);
  };

  const openEditCoupon = (cp) => {
    setEditingCoupon(cp);
    setCouponForm({
      code: cp.code,
      discount_type: cp.discount_type || 'percentage',
      discount_value: cp.discount_value,
      min_order_value: cp.min_order_value || 0,
      max_discount: cp.max_discount || 500,
      start_date: cp.start_date || '',
      end_date: cp.end_date || cp.expires_at || '',
      is_active: cp.is_active !== undefined ? cp.is_active : 1
    });
    setShowCouponModal(true);
  };

  const openAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      tag: 'PROMO',
      description: '',
      image_url: '',
      button_text: 'Claim Offer & Order',
      target_category: 'Burgers and Sandwiches',
      bg_color: '#85926B',
      branch_id: ''
    });
    setShowOfferModal(true);
  };

  const openEditOffer = (off) => {
    setEditingOffer(off);
    setOfferForm({
      title: off.title,
      tag: off.tag || 'PROMO',
      description: off.description || '',
      image_url: off.image_url || '',
      button_text: off.button_text || 'Claim Offer & Order',
      target_category: off.target_category || 'Burgers and Sandwiches',
      bg_color: off.bg_color || '#85926B',
      branch_id: off.branch_id || ''
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        const res = await api.put(`/offers/${editingOffer.id}`, offerForm);
        if (res.success) setMessage('Offer banner updated successfully.');
      } else {
        const res = await api.post('/offers', offerForm);
        if (res.success) setMessage('New offer banner created successfully.');
      }
      setShowOfferModal(false);
      setEditingOffer(null);
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to save offer banner.');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer banner?')) return;
    try {
      const res = await api.delete(`/offers/${id}`);
      if (res.success) {
        setMessage('Offer banner deleted.');
        fetchOffers();
      }
    } catch (e) {
      alert(e.message || 'Failed to delete offer banner.');
    }
  };

  const openAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      tag: 'CHEF SIGNATURE',
      script: 'Savor Every Bite',
      title: '',
      desc: '',
      image_url: '',
      button_text: 'Order Now',
      bg_color: '#949E7C',
      accent_text: '',
      target_category: 'Burgers and Sandwiches'
    });
    setShowSlideModal(true);
  };

  const openEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      tag: slide.tag || 'CHEF SIGNATURE',
      script: slide.script || 'Savor Every Bite',
      title: slide.title || '',
      desc: slide.desc || slide.desc_text || '',
      image_url: slide.image_url || slide.image || '',
      button_text: slide.button_text || 'Order Now',
      bg_color: slide.bg_color || '#85926B',
      accent_text: slide.accent_text || '',
      target_category: slide.target_category || 'Burgers and Sandwiches'
    });
    setShowSlideModal(true);
  };

  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'Placed' || orderStatusFilter === 'Order Placed') {
        if (o.order_status !== 'Placed' && o.order_status !== 'Order Placed') return false;
      } else if (o.order_status !== orderStatusFilter) {
        return false;
      }
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = (o.order_number || '').toLowerCase().includes(q);
      const matchName = (o.customer_name || '').toLowerCase().includes(q);
      const matchPhone = (o.customer_phone || '').toLowerCase().includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: stats?.pendingOrders },
    { id: 'branches', label: 'Store Branches', icon: Building },
    { id: 'foods', label: 'Food Items', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'coupons', label: 'Offers & Coupons', icon: Tag },
    { id: 'hero', label: 'Landing Page', icon: Sparkles },
    { id: 'settings', label: 'Store Timings & Info', icon: Clock },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'deliveries', label: 'Delivery Fleet', icon: Truck }
  ];

  return (
    <div className="portal-layout">
      {/* Mobile Top Bar */}
      <div className="portal-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/logo.jpg"
            alt="Come To Eat"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid #85926B',
              backgroundColor: '#FFFFFF',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.92rem', lineHeight: 1.1 }}>
              Come To Eat
            </div>
            <div style={{ fontSize: '0.64rem', color: '#85926B', fontWeight: 700, letterSpacing: '0.5px' }}>
              EXECUTIVE ADMIN
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToUserView}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#DCE4D2',
            fontSize: '0.74rem',
            fontWeight: 600
          }}
        >
          <Eye size={13} /> Customer View
        </button>
      </div>

      {/* Mobile Swipeable Horizontal Navigation Tabs */}
      <div className="portal-mobile-tabs">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'categories') fetchCategories();
                if (item.id === 'branches') fetchBranches();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                backgroundColor: active ? '#85926B' : 'rgba(255,255,255,0.08)',
                color: active ? '#FFFFFF' : '#CBD4C0',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  backgroundColor: '#E76F51',
                  color: '#FFF',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.65rem',
                  fontWeight: 800
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <aside className="portal-sidebar">
        {/* Header */}
        <div style={{ padding: '0 12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.jpg"
              alt="Come To Eat"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #85926B',
                backgroundColor: '#FFFFFF',
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.05rem', lineHeight: 1.2 }}>
                Come To Eat
              </div>
              <div style={{ fontSize: '0.72rem', color: '#85926B', fontWeight: 700, letterSpacing: '0.8px' }}>
                EXECUTIVE ADMIN
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'categories') fetchCategories();
                  if (item.id === 'branches') fetchBranches();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  backgroundColor: active ? '#85926B' : 'transparent',
                  color: active ? '#FFFFFF' : '#CBD4C0',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#E76F51',
                    color: '#FFF',
                    padding: '2px 7px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={onSwitchToUserView}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#DCE4D2',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <Eye size={15} /> Customer View
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out of Come To Eat?')) logout();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(198, 40, 40, 0.15)',
              color: '#FF8A80',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="portal-main" style={{ position: 'relative' }}>
        {/* Floating Toast Popup Notification */}
        {message && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 1300,
            backgroundColor: '#1E251C',
            color: '#FFFFFF',
            border: '1.5px solid #85926B',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            padding: '14px 20px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '420px',
            animation: 'scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <CheckCircle2 size={20} color="#85926B" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
              {message}
            </div>
            <button
              onClick={() => setMessage('')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px',
                cursor: 'pointer',
                color: '#DCE4D2',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* 1. DASHBOARD TAB (Includes Full Revenue Metrics for Manager Admin) */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Kitchen & Sales Overview</h2>
                <div className="subtitle">
                  Real-time operational health and financial revenue metrics
                </div>
              </div>
              <div className="portal-header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #85926B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <Building size={16} color="#85926B" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475234' }}>Branch:</span>
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBranchFilter(val);
                      fetchDashboardStats(val);
                      fetchOrders(val);
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#1F241C',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="all">All Branches (Global)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => { fetchDashboardStats(selectedBranchFilter); fetchOrders(selectedBranchFilter); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #DCE3D4',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#475234'
                  }}
                >
                  <RefreshCw size={15} /> Refresh Data
                </button>
              </div>
            </div>

            {/* Financial & Operational Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Revenue</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1F241C', marginTop: '6px' }}>₹{stats.todayRevenue || 0}</div>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', marginTop: '6px' }}>Total All Time: ₹{stats.totalRevenue || 0}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Orders</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1F241C', marginTop: '6px' }}>{stats.todayOrders}</div>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', marginTop: '6px' }}>All-time total: {stats.totalOrders}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Kitchen Orders</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#E76F51', marginTop: '6px' }}>{stats.pendingOrders}</div>
                <div style={{ fontSize: '0.82rem', color: '#E76F51', marginTop: '6px' }}>Needs preparation / dispatch</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Deliveries</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#2E7D32', marginTop: '6px' }}>{stats.completedOrders}</div>
                <div style={{ fontSize: '0.82rem', color: '#7E8775', marginTop: '6px' }}>Cancelled: {stats.cancelledOrders}</div>
              </div>
            </div>

            {/* Popular Items & Recent Orders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', marginBottom: '16px' }}>
                  Popular Food Items
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {stats.popularItems?.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F4F6F1' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#2A3324' }}>
                        #{idx + 1} {p.food_name}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1F241C' }}>{p.total_sold} sold</div>
                        <div style={{ fontSize: '0.82rem', color: '#7E8775' }}>₹{p.total_revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C' }}>
                    Recent Orders
                  </h4>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '0.88rem', color: '#85926B', fontWeight: 700 }}>
                    View All →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.recentOrders?.slice(0, 6).map((ro) => (
                    <div key={ro.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#1F241C' }}>#{ro.order_number}</div>
                        <div style={{ fontSize: '0.82rem', color: '#7E8775' }}>{ro.customer_name} • ₹{ro.final_amount}</div>
                      </div>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: ro.order_status === 'Delivered' ? '#E8F5E9' : '#FFF3E0',
                        color: ro.order_status === 'Delivered' ? '#2E7D32' : '#E65100'
                      }}>
                        {ro.order_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE ORDERS TAB (ADMIN: VIEW-ONLY PER SPECIFICATION) */}
        {activeTab === 'orders' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Live Orders Audit (View-Only)</h2>
                <div className="subtitle">
                  Managerial audit view • Operational status transitions are handled live in the Employee Station
                </div>
              </div>

              <div className="portal-header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #85926B' }}>
                  <Building size={16} color="#85926B" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475234' }}>Branch:</span>
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBranchFilter(val);
                      fetchOrders(val);
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#1F241C',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="all">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Search #order or customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '9999px',
                    border: '1.5px solid #DCE3D4',
                    fontSize: '0.92rem',
                    outline: 'none',
                    width: '100%',
                    maxWidth: '240px'
                  }}
                />
                <button
                  onClick={() => fetchOrders(selectedBranchFilter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #DCE3D4',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#475234'
                  }}
                >
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
              {['all', 'Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backgroundColor: orderStatusFilter === status ? '#85926B' : '#FFFFFF',
                    color: orderStatusFilter === status ? '#FFFFFF' : '#475234',
                    border: '1.5px solid #DCE3D4'
                  }}
                >
                  {status === 'all' ? 'All Orders' : status}
                </button>
              ))}
            </div>

            {/* Live Orders Highlighted Table View */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #ECE7DE',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '1020px', borderCollapse: 'collapse', fontSize: '1.05rem' }}>
                  <thead style={{ backgroundColor: '#F8F6F1', borderBottom: '2px solid #E3DC CE', color: '#323B25' }}>
                    <tr>
                      <th style={{ padding: '18px 22px', textAlign: 'left', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Order # & Time
                      </th>
                      <th style={{ padding: '18px 22px', textAlign: 'left', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Customer & Address
                      </th>
                      <th style={{ padding: '18px 22px', textAlign: 'left', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Branch Outlet
                      </th>
                      <th style={{ padding: '18px 22px', textAlign: 'left', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Items Ordered
                      </th>
                      <th style={{ padding: '18px 22px', textAlign: 'right', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Total Amount
                      </th>
                      <th style={{ padding: '18px 22px', textAlign: 'center', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Payment
                      </th>
                      <th style={{ padding: '18px 22px', textAlign: 'center', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        Live Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '56px 24px', textAlign: 'center', color: '#65705C' }}>
                          <ShoppingBag size={48} style={{ margin: '0 auto 14px', color: '#85926B', opacity: 0.8 }} />
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1F241C', marginBottom: '8px' }}>No orders found</h3>
                          <p style={{ fontSize: '1rem', margin: 0 }}>There are currently no live orders matching your branch or status filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, idx) => {
                        const orderItems = order.items && order.items.length > 0
                          ? order.items
                          : (order.items_json ? (typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json) : []);

                        const getStatusBadge = (status) => {
                          switch (status) {
                            case 'Order Placed':
                            case 'Placed':
                              return { bg: '#FFF3E0', text: '#E65100', border: '#FFE0B2', accent: '#FF9800' };
                            case 'Preparing':
                              return { bg: '#E1F5FE', text: '#0288D1', border: '#B3E5FC', accent: '#03A9F4' };
                            case 'Ready':
                              return { bg: '#E0F2F1', text: '#00796B', border: '#B2DFDB', accent: '#009688' };
                            case 'Out for Delivery':
                              return { bg: '#EDE7F6', text: '#5E35B1', border: '#D1C4E9', accent: '#7E57C2' };
                            case 'Delivered':
                              return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9', accent: '#4CAF50' };
                            case 'Cancelled':
                              return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2', accent: '#E53935' };
                            default:
                              return { bg: '#F5F5F5', text: '#424242', border: '#E0E0E0', accent: '#9E9E9E' };
                          }
                        };

                        const badge = getStatusBadge(order.order_status);

                        return (
                          <tr
                            key={order.id}
                            style={{
                              borderBottom: '1px solid #ECE7DE',
                              borderLeft: `6px solid ${badge.accent}`,
                              backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFBF8',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F4F7EF';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFBF8';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {/* 1. Order Number & Time */}
                            <td style={{ padding: '20px 22px', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 900, fontSize: '1.22rem', color: '#1F241C', letterSpacing: '-0.3px' }}>
                                #{order.order_number}
                              </div>
                              <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#556149', marginTop: '4px' }}>
                                🕒 {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: '0.86rem', color: '#85926B', marginTop: '2px', fontWeight: 600 }}>
                                📅 {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </td>

                            {/* 2. Customer & Address */}
                            <td style={{ padding: '20px 22px', verticalAlign: 'top', maxWidth: '280px' }}>
                              <div style={{ fontWeight: 800, color: '#1F241C', fontSize: '1.14rem', lineHeight: 1.25 }}>
                                {order.customer_name}
                              </div>
                              <div style={{ color: '#475234', fontSize: '0.96rem', fontWeight: 600, marginTop: '4px' }}>
                                📞 {order.customer_phone || 'No phone'}
                              </div>
                              <div style={{
                                marginTop: '8px',
                                fontSize: '0.92rem',
                                color: '#3A442E',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '6px',
                                lineHeight: 1.4,
                                backgroundColor: 'rgba(133, 146, 107, 0.08)',
                                padding: '6px 10px',
                                borderRadius: '8px'
                              }}>
                                <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{order.delivery_type === 'pickup' ? '🏬' : '📍'}</span>
                                <span style={{ wordBreak: 'break-word', fontWeight: 600 }}>
                                  {order.delivery_type === 'pickup' ? 'Takeaway Counter Pickup' : (order.delivery_address || 'Home Delivery')}
                                </span>
                              </div>
                            </td>

                            {/* 3. Branch */}
                            <td style={{ padding: '20px 22px', verticalAlign: 'top' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                backgroundColor: '#EAF0E2',
                                color: '#2B3818',
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                border: '1px solid #D1DCC6',
                                whiteSpace: 'nowrap'
                              }}>
                                <Building size={15} />
                                {order.branch_name || 'Indiranagar (Flagship)'}
                              </span>
                            </td>

                            {/* 4. Items Ordered */}
                            <td style={{ padding: '20px 22px', verticalAlign: 'top', maxWidth: '340px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {orderItems && orderItems.length > 0 ? (
                                  orderItems.map((item, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '1rem',
                                        color: '#242D1C',
                                        padding: '4px 0',
                                        borderBottom: i < orderItems.length - 1 ? '1px dashed #E5E0D5' : 'none'
                                      }}
                                    >
                                      <span style={{ fontWeight: 700 }}>
                                        <strong style={{
                                          color: '#FFFFFF',
                                          backgroundColor: '#85926B',
                                          padding: '2px 7px',
                                          borderRadius: '6px',
                                          fontSize: '0.85rem',
                                          marginRight: '6px'
                                        }}>
                                          {item.quantity}x
                                        </strong>
                                        {item.food_name || item.name}
                                      </span>
                                      <span style={{ color: '#475234', marginLeft: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                        ₹{(item.price || item.unit_price || 0) * (item.quantity || 1)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '0.95rem', color: '#7E8775', fontStyle: 'italic' }}>
                                    Items recorded in receipt
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 5. Total Amount */}
                            <td style={{ padding: '20px 22px', textAlign: 'right', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 900, fontSize: '1.35rem', color: '#1F241C', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>
                                ₹{Number(order.final_amount || order.total_amount || 0).toFixed(2)}
                              </div>
                              {order.discount_amount > 0 && (
                                <div style={{
                                  display: 'inline-block',
                                  fontSize: '0.84rem',
                                  color: '#E76F51',
                                  fontWeight: 800,
                                  backgroundColor: '#FBE9E7',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  marginTop: '4px'
                                }}>
                                  -₹{order.discount_amount} coupon
                                </div>
                              )}
                            </td>

                            {/* 6. Payment */}
                            <td style={{ padding: '20px 22px', textAlign: 'center', verticalAlign: 'top' }}>
                              <div style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <span style={{
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  fontSize: '0.88rem',
                                  fontWeight: 800,
                                  backgroundColor: '#F0EFEA',
                                  color: '#263238',
                                  border: '1px solid #D8D4CA'
                                }}>
                                  {order.payment_method || 'UPI'}
                                </span>
                                <span style={{
                                  fontSize: '0.84rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.3px',
                                  color: order.payment_status === 'completed' || order.payment_status === 'paid' ? '#2E7D32' : '#E65100'
                                }}>
                                  ● {order.payment_status || 'completed'}
                                </span>
                              </div>
                            </td>

                            {/* 7. Live Order Status */}
                            <td style={{ padding: '20px 22px', textAlign: 'center', verticalAlign: 'top' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '7px 18px',
                                borderRadius: '24px',
                                fontSize: '0.94rem',
                                fontWeight: 900,
                                backgroundColor: badge.bg,
                                color: badge.text,
                                border: `1.5px solid ${badge.border}`,
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                              }}>
                                {order.order_status || 'Order Placed'}
                              </span>
                              <div style={{ fontSize: '0.8rem', color: '#85926B', marginTop: '6px', fontWeight: 600 }}>
                                Kitchen Managed
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STORE BRANCHES & DEDICATED STAFF TAB */}
        {activeTab === 'branches' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Store Outlets & Dedicated Staff</h2>
                <div className="subtitle">
                  Manage Come To Eat café branch locations and employee station assignments with two-way verification
                </div>
              </div>
              <div className="portal-header-actions">
                <button
                  onClick={openAddBranch}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.92rem', fontWeight: 700 }}
                >
                  <Plus size={16} /> Add Outlet Branch
                </button>
                <button
                  onClick={() => {
                    setEmployeeForm({
                      name: '',
                      email: '',
                      password: '',
                      branch_id: branches[0]?.id || ''
                    });
                    setShowAddEmployeeModal(true);
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.92rem' }}
                >
                  <ChefHat size={16} /> Create Staff Employee
                </button>
              </div>
            </div>

            {/* BRANCHES LIST CARDS */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#85926B" /> Physical Branch Outlets ({branches.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {branches.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px solid #E6ECE0',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1F241C' }}>{b.name}</div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#85926B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                            Code: {b.code}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: b.is_active ? '#E8F5E9' : '#FFEBEE',
                          color: b.is_active ? '#2E7D32' : '#C62828'
                        }}>
                          {b.is_active ? 'ONLINE' : 'INACTIVE'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#556149', marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={15} color="#85926B" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{b.address || 'Address not configured'}</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#556149', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={15} color="#85926B" style={{ flexShrink: 0 }} />
                        <span>{b.phone || 'Phone not configured'}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #F0EFEA', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => handleDeleteBranch(b.id, b.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#C62828',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Delete branch outlet"
                      >
                        <Trash2 size={14} /> Delete Branch
                      </button>
                      <button
                        onClick={() => openEditBranch(b)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#475234',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Edit2 size={14} /> Edit Outlet Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EMPLOYEES & TWO-WAY REASSIGNMENT */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2B3224', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChefHat size={18} color="#85926B" /> Staff Employees & Station Verification ({employees.length})
                </h3>
              </div>

              {/* Informational Banner on Two-Way Verification & Single Branch Lock */}
              <div style={{
                backgroundColor: '#F8FAF5',
                border: '1px solid #DCE6D3',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '0.92rem',
                color: '#3B4530',
                lineHeight: 1.5
              }}>
                <Shield size={22} color="#85926B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Branch Lock & Two-Way Verification Policy:</strong> Employees operate exclusively within their assigned physical station. When you initiate a branch reassignment, the employee is presented with a prominent confirmation prompt upon their next login. Only when confirmed by the employee does their operational station switch.
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="responsive-table-view">
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E6ECE0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  overflowX: 'auto'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #E6ECE0', fontSize: '0.86rem', color: '#556149', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px 20px' }}>Staff Member</th>
                        <th style={{ padding: '16px 20px' }}>Current Branch</th>
                        <th style={{ padding: '16px 20px' }}>Station Status</th>
                        <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '36px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic', fontSize: '0.94rem' }}>
                            No staff employee accounts created yet. Click "Create Staff Employee" above to add kitchen or café staff.
                          </td>
                        </tr>
                      ) : (
                        employees.map((emp) => (
                          <tr key={emp.id} style={{ borderBottom: '1px solid #F2EFE9', fontSize: '0.94rem' }}>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ fontWeight: 700, color: '#1F241C' }}>{emp.name}</div>
                              <div style={{ fontSize: '0.82rem', color: '#7E8775' }}>{emp.email}</div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#1F241C',
                                fontWeight: 600,
                                fontSize: '0.92rem'
                              }}>
                                <Building size={15} color="#65705C" /> {emp.branch_name || 'Indiranagar (Flagship)'}
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              {emp.transfer_status === 'pending_employee_confirmation' ? (
                                <div>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    color: '#E65100',
                                    fontWeight: 700,
                                    fontSize: '0.88rem'
                                  }}>
                                    <AlertTriangle size={15} /> Pending Confirmation
                                  </span>
                                  <div style={{ fontSize: '0.8rem', color: '#7E8775', marginTop: '3px' }}>
                                    Relocating to: <strong>{emp.pending_branch_name}</strong>
                                  </div>
                                </div>
                              ) : (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  color: '#2E7D32',
                                  fontWeight: 700,
                                  fontSize: '0.88rem'
                                }}>
                                  <CheckCircle size={15} /> Active at Station
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                              {emp.transfer_status === 'pending_employee_confirmation' ? (
                                <button
                                  onClick={() => handleCancelTransfer(emp.id)}
                                  style={{
                                    padding: '8px 14px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    backgroundColor: '#FFEBEE',
                                    color: '#C62828',
                                    border: '1px solid #FFCDD2',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel Transfer
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTransferEmployee(emp);
                                    const other = branches.find(b => b.id !== emp.branch_id);
                                    setTransferBranchId(other ? other.id : '');
                                  }}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    backgroundColor: '#F3F6EF',
                                    color: '#475234',
                                    border: '1px solid #DCE6D3',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Transfer Branch
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="responsive-cards-view">
                {employees.length === 0 ? (
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DE', padding: '24px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic' }}>
                    No staff employee accounts created yet. Click "Create Staff Employee" above to add kitchen or café staff.
                  </div>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #ECE7DE',
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1F241C' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.82rem', color: '#7E8775' }}>{emp.email}</div>
                        </div>
                        {emp.transfer_status === 'pending_employee_confirmation' ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: '#FFF3E0',
                            color: '#E65100',
                            border: '1px solid #FFE082'
                          }}>
                            Pending Move
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            border: '1px solid #C8E6C9'
                          }}>
                            Active
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475234', backgroundColor: '#FAF8F5', padding: '10px 12px', borderRadius: '10px' }}>
                        <Building size={16} color="#85926B" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>Station: {emp.branch_name || 'Indiranagar (Flagship)'}</span>
                      </div>

                      {emp.transfer_status === 'pending_employee_confirmation' && (
                        <div style={{ fontSize: '0.82rem', color: '#E65100', backgroundColor: '#FFF8E1', padding: '8px 12px', borderRadius: '8px' }}>
                          Relocation Requested to: <strong>{emp.pending_branch_name}</strong>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid #F4F2EC', paddingTop: '10px' }}>
                        {emp.transfer_status === 'pending_employee_confirmation' ? (
                          <button
                            onClick={() => handleCancelTransfer(emp.id)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              backgroundColor: '#FFEBEE',
                              color: '#C62828',
                              border: '1px solid #FFCDD2',
                              borderRadius: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel Transfer Request
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setTransferEmployee(emp);
                              const other = branches.find(b => b.id !== emp.branch_id);
                              setTransferBranchId(other ? other.id : '');
                            }}
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              backgroundColor: '#F3F6EF',
                              color: '#475234',
                              border: '1px solid #DCE6D3',
                              borderRadius: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            Transfer Branch Station
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. FOOD ITEMS TAB */}
        {activeTab === 'foods' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Menu Dishes & Catalog</h2>
                <div className="subtitle">
                  Manage dishes across Come To Eat categories with device image upload
                </div>
              </div>
              <div className="portal-header-actions">
                <button
                  onClick={() => {
                    setEditingFood(null);
                    setFoodForm({
                      name: '',
                      category_id: categories[0]?.id || 1,
                      price: '',
                      discount_price: '',
                      is_veg: 1,
                      is_available: 1,
                      prep_time: '15 min',
                      image_url: '',
                      description: '',
                      is_featured: 0
                    });
                    setShowAddFoodModal(true);
                  }}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', padding: '10px 20px', fontSize: '0.94rem' }}
                >
                  <Plus size={16} /> Add Food Item
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="responsive-table-view">
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DE', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.94rem', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: '#475234', fontWeight: 700 }}>Food Item</th>
                      <th style={{ padding: '16px 20px', color: '#475234', fontWeight: 700 }}>Category</th>
                      <th style={{ padding: '16px 20px', color: '#475234', fontWeight: 700 }}>Price</th>
                      <th style={{ padding: '16px 20px', color: '#475234', fontWeight: 700 }}>Diet</th>
                      <th style={{ padding: '16px 20px', color: '#475234', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '16px 20px', color: '#475234', fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => (
                      <tr key={food.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                        <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img src={food.image_url} alt={food.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#1F241C', fontSize: '0.96rem' }}>{food.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#7E8775', marginTop: '2px' }}>{food.prep_time}</div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#556149' }}>{food.category_name}</td>
                        <td style={{ padding: '14px 20px', fontWeight: 800, color: '#1F241C' }}>₹{food.discount_price || food.price}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            border: food.is_veg ? '1px solid #2E7D32' : '1px solid #C62828',
                            color: food.is_veg ? '#2E7D32' : '#C62828',
                            backgroundColor: food.is_veg ? '#F1F8F3' : '#FDF2F2'
                          }}>
                            {food.is_veg ? 'VEG' : 'NON-VEG'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <button
                            onClick={() => handleToggleAvailability(food.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              backgroundColor: food.is_available ? '#E8F5E9' : '#FFEBEE',
                              color: food.is_available ? '#2E7D32' : '#C62828',
                              border: '1px solid currentColor',
                              cursor: 'pointer'
                            }}
                          >
                            {food.is_available ? 'Active (Live)' : 'Sold Out'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openEditFood(food)} title="Edit Food" style={{ color: '#85926B', padding: '4px' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteFood(food.id)} title="Delete Food" style={{ color: '#C62828', padding: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="responsive-cards-view">
              {foods.map((food) => (
                <div
                  key={food.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #ECE7DE',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img
                      src={food.image_url}
                      alt={food.name}
                      style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#1F241C', margin: 0 }}>{food.name}</h4>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          border: food.is_veg ? '1px solid #2E7D32' : '1px solid #C62828',
                          color: food.is_veg ? '#2E7D32' : '#C62828',
                          backgroundColor: food.is_veg ? '#F1F8F3' : '#FDF2F2',
                          flexShrink: 0
                        }}>
                          {food.is_veg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#7E8775', marginTop: '2px' }}>
                        {food.category_name} • {food.prep_time}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1F241C', marginTop: '4px' }}>
                        ₹{food.discount_price || food.price}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F4F2EC', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleAvailability(food.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '16px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        backgroundColor: food.is_available ? '#E8F5E9' : '#FFEBEE',
                        color: food.is_available ? '#2E7D32' : '#C62828',
                        border: '1px solid currentColor',
                        cursor: 'pointer'
                      }}
                    >
                      {food.is_available ? 'Active (Live)' : 'Sold Out'}
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => openEditFood(food)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#F3F6EF',
                          color: '#475234',
                          fontSize: '0.84rem',
                          fontWeight: 700
                        }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#FFEBEE',
                          color: '#C62828',
                          fontSize: '0.84rem',
                          fontWeight: 700
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CATEGORIES TAB (WITH ADD & EDIT & DELETE CATEGORY OPTIONS) */}
        {activeTab === 'categories' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Food Categories Management</h2>
                <div className="subtitle">
                  Create categories, upload category banner images from your device, and manage menu sections
                </div>
              </div>
              <div className="portal-header-actions">
                <button
                  onClick={fetchCategories}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  title="Reload categories"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
                <button
                  onClick={openAddCategory}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={18} /> Add Category
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #ECE7DE',
                padding: '48px 20px',
                textAlign: 'center'
              }}>
                <FolderTree size={46} color="#85926B" style={{ margin: '0 auto 14px' }} />
                <h4 style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1F241C', marginBottom: '8px' }}>No Categories Loaded</h4>
                <p style={{ color: '#7E8775', fontSize: '0.96rem', marginBottom: '18px' }}>Click refresh to fetch current menu categories or add a new category.</p>
                <button onClick={fetchCategories} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.92rem' }}>
                  Refresh Categories
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #ECE7DE',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F241C' }}>
                          {cat.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditCategory(cat)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#F0F4E8',
                              color: '#475234',
                              fontSize: '0.84rem',
                              fontWeight: 700
                            }}
                            title="Edit Category Details"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            style={{
                              color: '#C62828',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#FFEBEE'
                            }}
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#6A7463', lineHeight: 1.5, flex: 1 }}>
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. OFFERS & COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {/* Section A: Visual Offer Banners (for Offers Page) */}
            <div>
              <div className="portal-header-bar">
                <div className="portal-header-title">
                  <h2>1. Visual Offer Banners (Offers Page)</h2>
                  <div className="subtitle">
                    Create and manage visual promotional offer cards displayed on the customer Offers page
                  </div>
                </div>
                <div className="portal-header-actions">
                  <button
                    onClick={openAddOffer}
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={18} /> Add Offer Banner
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {offers.map((off) => (
                  <div
                    key={off.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #ECE7DE',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      height: '150px',
                      backgroundColor: off.bg_color || '#85926B',
                      overflow: 'hidden'
                    }}>
                      {off.image_url && (
                        <img src={off.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#E76F51', color: '#FFF', fontSize: '0.76rem', fontWeight: 800, padding: '4px 12px', borderRadius: '14px' }}>
                        {off.tag || 'PROMO'}
                      </div>
                    </div>
                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1F241C', marginBottom: '6px' }}>{off.title}</div>
                        <p style={{ fontSize: '0.9rem', color: '#65705C', lineHeight: 1.5, margin: '0 0 12px' }}>{off.description}</p>
                        <div style={{ fontSize: '0.82rem', color: '#85926B', fontWeight: 700 }}>Target: {off.target_category || 'All Categories'}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F0EFEB' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475234' }}>CTA: "{off.button_text}"</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditOffer(off)}
                            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#85926B', color: '#FFF', fontSize: '0.82rem', fontWeight: 700, border: 'none' }}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(off.id)}
                            style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '0.82rem', border: 'none' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Discount Coupon Codes */}
            <div>
              <div className="portal-header-bar">
                <div className="portal-header-title">
                  <h2>2. Discount Coupon Codes</h2>
                  <div className="subtitle">
                    Create checkout promo codes, set valid start/end dates, or modify discount values
                  </div>
                </div>
                <div className="portal-header-actions">
                  <button
                    onClick={openAddCoupon}
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={18} /> Add Coupon
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {coupons.map((cp) => (
                  <div
                    key={cp.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1.5px dashed #C8D1BE',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minWidth: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '1.18rem',
                          backgroundColor: '#F3F6EE',
                          color: '#475234',
                          padding: '5px 12px',
                          borderRadius: '8px'
                        }}>
                          {cp.code}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditCoupon(cp)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#F0F4E8',
                              color: '#475234',
                              fontSize: '0.82rem',
                              fontWeight: 700
                            }}
                            title="Modify Coupon"
                          >
                            <Edit2 size={13} /> Modify
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(cp.id)}
                            style={{
                              color: '#C62828',
                              padding: '5px 9px',
                              borderRadius: '8px',
                              backgroundColor: '#FFEBEE'
                            }}
                            title="Delete Coupon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#E76F51', marginBottom: '6px' }}>
                        {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} FLAT`}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#6A7463', marginBottom: '6px' }}>
                        Min Order: ₹{cp.min_order_value} • Max Cap: ₹{cp.max_discount}
                      </div>
                      {(cp.start_date || cp.end_date || cp.expires_at) && (
                        <div style={{ fontSize: '0.82rem', color: '#85926B', fontWeight: 600 }}>
                          Valid: {cp.start_date || 'Ongoing'} to {cp.end_date || cp.expires_at || 'No expiry'}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F0F4E8' }}>
                      <span style={{ fontSize: '0.82rem', color: '#7E8775' }}>
                        Redeemed: <strong>{cp.times_used || 0} times</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCouponStatus(cp)}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          backgroundColor: (cp.is_active === 1 || cp.is_active === true) ? '#E8F5E9' : '#F5F5F5',
                          color: (cp.is_active === 1 || cp.is_active === true) ? '#2E7D32' : '#757575',
                          border: '1px solid ' + ((cp.is_active === 1 || cp.is_active === true) ? '#A5D6A7' : '#E0E0E0'),
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Click to toggle Active / Inactive"
                      >
                        {(cp.is_active === 1 || cp.is_active === true) ? (
                          <>
                            <CheckCircle2 size={13} color="#2E7D32" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <X size={13} color="#757575" /> INACTIVE
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. LANDING PAGE TAB (HERO BANNERS, CHEF'S RECOMMENDATION & CRAFTED WITH PASSION) */}
        {activeTab === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {/* Section 1: Hero Banner Slides */}
            <div>
              <div className="portal-header-bar">
                <div className="portal-header-title">
                  <h2>1. Hero Banner Slides</h2>
                  <div className="subtitle">
                    Create dynamic promotional hero slides with custom tags, titles, cursive script, button actions, and background themes
                  </div>
                </div>
                <div className="portal-header-actions">
                  <button
                    onClick={openAddSlide}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: '0.94rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Plus size={18} /> Add Hero Slide
                  </button>
                </div>
              </div>

              {heroSlides.length === 0 ? (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1.5px dashed #CBD4C0',
                  padding: '48px 24px',
                  textAlign: 'center'
                }}>
                  <Sparkles size={46} color="#85926B" style={{ margin: '0 auto 14px' }} />
                  <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1F241C', marginBottom: '8px' }}>No Hero Banner Slides Found</h4>
                  <p style={{ color: '#7E8775', fontSize: '0.94rem', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                    Create custom promotional slides displayed on the customer landing and home pages.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={openAddSlide} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.94rem' }}>
                      <Plus size={16} /> Add Hero Slide
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {heroSlides.map((slide) => (
                    <div
                      key={slide.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '18px',
                        border: '1px solid #ECE7DE',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{
                        backgroundColor: slide.bg_color || '#85926B',
                        padding: '22px',
                        color: '#FFFFFF',
                        position: 'relative',
                        minHeight: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        {slide.image_url && (
                          <div style={{ position: 'absolute', right: '14px', bottom: '14px', width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                            <img src={slide.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '1px' }}>{slide.tag || 'PROMO'}</div>
                          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2rem', lineHeight: 1.2 }}>{slide.script || 'Delicious'}</div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', maxWidth: '75%' }}>{slide.title}</div>
                        </div>
                      </div>

                      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', color: '#65705C', lineHeight: 1.5, margin: '0 0 10px' }}>
                            {slide.desc || slide.desc_text || 'No description provided'}
                          </p>
                          {slide.target_category && (
                            <div style={{ fontSize: '0.82rem', color: '#85926B', fontWeight: 700 }}>
                              Target Category: {slide.target_category}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F0EFEB' }}>
                          <span style={{ fontSize: '0.82rem', color: '#85926B', fontWeight: 700 }}>
                            CTA: "{slide.button_text || 'Order Now'}"
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => openEditSlide(slide)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                backgroundColor: '#85926B',
                                color: '#FFFFFF',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteHeroSlide(slide.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '7px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#FFEBEE',
                                color: '#C62828',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              title="Delete Slide"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Chef's Recommendation Management */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #ECE7DE', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F241C', margin: 0 }}>
                    2. Chef's Recommendation Highlights
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#EAF0E2',
                    color: '#3B4826',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>
                    {foods.filter((f) => f.is_featured === 1 || f.is_featured === true || f.is_featured === '1').length} Dishes Featured
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#65705C', margin: 0 }}>
                  These signature dishes appear prominently on the customer landing and home pages.
                </p>
              </div>

              {/* 2A. Currently Added Chef's Recommendations */}
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#3A442E', marginBottom: '12px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                  ⭐ Active Featured Dishes ({foods.filter((f) => f.is_featured === 1 || f.is_featured === true || f.is_featured === '1').length})
                </h4>

                {foods.filter((f) => f.is_featured === 1 || f.is_featured === true || f.is_featured === '1').length === 0 ? (
                  <div style={{
                    backgroundColor: '#FAF8F5',
                    borderRadius: '14px',
                    border: '1.5px dashed #DCE3D4',
                    padding: '28px 20px',
                    textAlign: 'center',
                    color: '#65705C'
                  }}>
                    <UtensilsCrossed size={32} style={{ margin: '0 auto 8px', color: '#85926B', opacity: 0.8 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F241C', marginBottom: '4px' }}>
                      No Chef's Recommendations added yet
                    </div>
                    <p style={{ fontSize: '0.84rem', margin: 0 }}>
                      Search below to add signature dishes to the highlights section.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {foods.filter((f) => f.is_featured === 1 || f.is_featured === true || f.is_featured === '1').map((food) => {
                      const category = categories.find((c) => c.id === food.category_id);
                      return (
                        <div
                          key={food.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '14px',
                            border: '1.5px solid #85926B',
                            backgroundColor: '#F7FAF3',
                            boxShadow: '0 2px 6px rgba(133, 146, 107, 0.1)'
                          }}
                        >
                          <img
                            src={food.image_url}
                            alt=""
                            style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1F241C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {food.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#65705C', marginTop: '1px' }}>
                              {category?.name || 'Signature'} • <strong style={{ color: '#85926B' }}>₹{food.price}</strong>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/foods/${food.id}`, { is_featured: 0 });
                                fetchFoods();
                                setMessage(`Removed "${food.name}" from Chef's Recommendations.`);
                              } catch (e) {
                                alert('Failed to remove recommendation');
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              backgroundColor: '#FFEBEE',
                              color: '#C62828',
                              border: '1px solid #FFCDD2',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.15s ease'
                            }}
                            title="Remove from featured highlights"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2B. Search & Add More Dishes */}
              <div style={{ borderTop: '1px solid #ECE7DE', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#3A442E', marginBottom: '12px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                  🔍 Search & Add Food Dishes to Recommendations
                </h4>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#85926B' }} />
                    <input
                      type="text"
                      placeholder="Search dish by name to add..."
                      value={chefSearchTerm}
                      onChange={(e) => setChefSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 36px',
                        borderRadius: '10px',
                        border: '1.5px solid #DCE3D4',
                        fontSize: '0.92rem',
                        outline: 'none',
                        backgroundColor: '#FAF8F5'
                      }}
                    />
                  </div>

                  <select
                    value={chefCatFilter}
                    onChange={(e) => setChefCatFilter(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #DCE3D4',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      backgroundColor: '#FAF8F5',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unfeatured Dishes Available to Add */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {foods
                    .filter((f) => {
                      if (f.is_featured === 1 || f.is_featured === true || f.is_featured === '1') return false; // hide already added dishes
                      if (chefCatFilter !== 'all' && f.category_id !== Number(chefCatFilter)) return false;
                      if (chefSearchTerm.trim() && !f.name.toLowerCase().includes(chefSearchTerm.toLowerCase())) return false;
                      return true;
                    })
                    .map((food) => {
                      const category = categories.find((c) => c.id === food.category_id);
                      return (
                        <div
                          key={food.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: '1px solid #ECE7DE',
                            backgroundColor: '#FFFFFF',
                            transition: 'border-color 0.15s ease'
                          }}
                        >
                          <img
                            src={food.image_url}
                            alt=""
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F241C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {food.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#7E8775' }}>
                              {category?.name || 'Dish'} • <strong style={{ color: '#475234' }}>₹{food.price}</strong>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/foods/${food.id}`, { is_featured: 1 });
                                fetchFoods();
                                setMessage(`Added "${food.name}" to Chef's Recommendations.`);
                              } catch (e) {
                                alert('Failed to add recommendation');
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              backgroundColor: '#EAEFE6',
                              color: '#3B4725',
                              border: '1px solid #DCE3D4',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })}

                  {foods.filter((f) => {
                    if (f.is_featured === 1 || f.is_featured === true || f.is_featured === '1') return false;
                    if (chefCatFilter !== 'all' && f.category_id !== Number(chefCatFilter)) return false;
                    if (chefSearchTerm.trim() && !f.name.toLowerCase().includes(chefSearchTerm.toLowerCase())) return false;
                    return true;
                  }).length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '18px', textAlign: 'center', color: '#7E8775', fontSize: '0.86rem', fontStyle: 'italic' }}>
                      {chefSearchTerm.trim() ? `No unadded dishes matching "${chefSearchTerm}" found.` : 'All available dishes in this category are already added to Chef’s Recommendations.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: "Crafted With Passion" Promise Settings */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #ECE7DE', padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F241C', marginBottom: '4px' }}>
                  3. "Crafted With Passion" Brand Section & Promise Cards
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#65705C', margin: 0 }}>
                  Customize the brand headline, cursive subtitle tag, and all 3 promise card titles & descriptions.
                </p>
              </div>

              <form onSubmit={handleSaveLandingCards} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#475234', marginBottom: '6px' }}>
                      Section Headline Title
                    </label>
                    <input
                      type="text"
                      value={settings.crafted_title || 'The Come To Eat Promise'}
                      onChange={(e) => setSettings({ ...settings, crafted_title: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #DCE3D4', fontSize: '0.94rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#475234', marginBottom: '6px' }}>
                      Cursive Subtitle Tag
                    </label>
                    <input
                      type="text"
                      value={settings.crafted_subtitle || 'Crafted With Passion'}
                      onChange={(e) => setSettings({ ...settings, crafted_subtitle: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #DCE3D4', fontSize: '0.94rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  {/* Card 1 */}
                  <div style={{ backgroundColor: '#FAF8F5', padding: '18px', borderRadius: '14px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1F241C', marginBottom: '10px' }}>Card 1 (Sparkles Icon)</div>
                    <input
                      type="text"
                      placeholder="Card 1 Title"
                      value={settings.card1_title || 'Farm-Fresh Ingredients'}
                      onChange={(e) => setSettings({ ...settings, card1_title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE3D4', fontSize: '0.9rem', marginBottom: '8px' }}
                    />
                    <textarea
                      placeholder="Card 1 Description"
                      rows={3}
                      value={settings.card1_desc || '100% daily-procured farm produce, organic whole dairy, and authentic slow-simmered spices with zero preservatives.'}
                      onChange={(e) => setSettings({ ...settings, card1_desc: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE3D4', fontSize: '0.88rem', resize: 'vertical', flex: 1 }}
                    />
                  </div>

                  {/* Card 2 */}
                  <div style={{ backgroundColor: '#FAF8F5', padding: '18px', borderRadius: '14px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1F241C', marginBottom: '10px' }}>Card 2 (Zap Icon)</div>
                    <input
                      type="text"
                      placeholder="Card 2 Title"
                      value={settings.card2_title || 'Fresh Café Preparation'}
                      onChange={(e) => setSettings({ ...settings, card2_title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE3D4', fontSize: '0.9rem', marginBottom: '8px' }}
                    />
                    <textarea
                      placeholder="Card 2 Description"
                      rows={3}
                      value={settings.card2_desc || 'Crafted fresh on order, insulated packaging keeps burgers crispy and hot coolers iced right to your table.'}
                      onChange={(e) => setSettings({ ...settings, card2_desc: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE3D4', fontSize: '0.88rem', resize: 'vertical', flex: 1 }}
                    />
                  </div>

                  {/* Card 3 */}
                  <div style={{ backgroundColor: '#FAF8F5', padding: '18px', borderRadius: '14px', border: '1px solid #ECE7DE', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1F241C', marginBottom: '10px' }}>Card 3 (Shield Icon)</div>
                    <input
                      type="text"
                      placeholder="Card 3 Title"
                      value={settings.card3_title || 'Hygienic Café'}
                      onChange={(e) => setSettings({ ...settings, card3_title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE3D4', fontSize: '0.9rem', marginBottom: '8px' }}
                    />
                    <textarea
                      placeholder="Card 3 Description"
                      rows={3}
                      value={settings.card3_desc || 'Strict 5-star hygiene benchmarks, temperature-controlled food stations, and contactless café protocols.'}
                      onChange={(e) => setSettings({ ...settings, card3_desc: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DCE3D4', fontSize: '0.88rem', resize: 'vertical', flex: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                    Save Landing Page Brand & Promise Cards
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. STORE SETTINGS & TIMINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Store Timings & Operational Settings</h2>
                <div className="subtitle">
                  Customize your daily restaurant operating hours, delivery promise badges, and contact details reflected immediately on the live website
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(18px, 4vw, 32px)', borderRadius: '20px', border: '1px solid #ECE7DE', maxWidth: '720px', width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
                    Top Bar Timing Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.timing_text}
                    onChange={(e) => setSettings({ ...settings, timing_text: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Open Daily: 10:00 AM – 11:30 PM"
                  />
                  <div style={{ fontSize: '0.82rem', color: '#7E8775', marginTop: '4px' }}>
                    Displays in the top green banner across all pages for customers and staff.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
                    Weekly Operating Schedule
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.days_open}
                    onChange={(e) => setSettings({ ...settings, days_open: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)"
                  />
                  <div style={{ fontSize: '0.82rem', color: '#7E8775', marginTop: '4px' }}>
                    Displayed in the Landing Page and customer Home Page information cards.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
                    Delivery Guarantee Badge
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.delivery_text}
                    onChange={(e) => setSettings({ ...settings, delivery_text: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Express 30 Min Delivery"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
                    Kitchen Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.contact_address}
                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="btn-primary"
                    style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                  >
                    {settingsLoading ? 'Saving...' : 'Save Timing & Store Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Registered Customer Accounts</h2>
                <div className="subtitle">
                  Directory of customer profiles, contact numbers, and cumulative order history
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="responsive-table-view">
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE7DE', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '0.94rem' }}>
                  <thead style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE', color: '#475234' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Customer</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Total Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic' }}>
                          No registered customer accounts found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: '#1F241C' }}>{c.name}</td>
                          <td style={{ padding: '16px 20px', color: '#556149' }}>{c.email}</td>
                          <td style={{ padding: '16px 20px', color: '#7E8775' }}>{c.phone || 'N/A'}</td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1F241C' }}>{c.total_orders || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="responsive-cards-view">
              {customers.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DE', padding: '24px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic' }}>
                  No registered customer accounts found.
                </div>
              ) : (
                customers.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #ECE7DE',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: '#EBF0E4',
                          color: '#475234',
                          fontWeight: 800,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {c.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1F241C' }}>{c.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#7E8775' }}>Customer ID #{c.id}</div>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        backgroundColor: '#F0F4E8',
                        color: '#475234',
                        border: '1px solid #D8E2D0'
                      }}>
                        {c.total_orders || 0} Orders
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #F4F2EC', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475234' }}>
                        <Mail size={16} color="#85926B" style={{ flexShrink: 0 }} />
                        <span style={{ wordBreak: 'break-all' }}>{c.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475234' }}>
                        <Phone size={16} color="#85926B" style={{ flexShrink: 0 }} />
                        <span>{c.phone || 'No phone registered'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 8. PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Financial Transactions Audit</h2>
                <div className="subtitle">
                  Comprehensive log of verified checkout receipts and payments across all outlets
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="responsive-table-view">
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE7DE', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.94rem' }}>
                  <thead style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE', color: '#475234' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Order #</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Customer</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Method</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic' }}>
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1F241C' }}>#{p.order_number}</td>
                          <td style={{ padding: '16px 20px', color: '#1F241C', fontWeight: 600 }}>{p.customer_name}</td>
                          <td style={{ padding: '16px 20px', color: '#556149' }}>{p.payment_method}</td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1F241C', fontSize: '1rem' }}>₹{p.amount}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              backgroundColor: p.status === 'successful' ? '#E8F5E9' : '#F4F6F1',
                              color: p.status === 'successful' ? '#2E7D32' : '#475234'
                            }}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="responsive-cards-view">
              {payments.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DE', padding: '24px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic' }}>
                  No payment transactions recorded yet.
                </div>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #ECE7DE',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.08rem', color: '#1F241C' }}>
                          #{p.order_number}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#F0F4E8',
                          color: '#475234',
                          border: '1px solid #D8E2D0'
                        }}>
                          {p.payment_method}
                        </span>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: p.status === 'successful' ? '#E8F5E9' : '#FFF3E0',
                        color: p.status === 'successful' ? '#2E7D32' : '#E65100'
                      }}>
                        {p.status?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F4F2EC', paddingTop: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1F241C' }}>{p.customer_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#7E8775' }}>Verified Digital Receipt</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#85926B' }}>₹{p.amount}</div>
                        <div style={{ fontSize: '0.76rem', color: '#7E8775' }}>Total Paid</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 9. DELIVERIES TAB */}
        {activeTab === 'deliveries' && (
          <div>
            <div className="portal-header-bar">
              <div className="portal-header-title">
                <h2>Third-Party Delivery Dispatch</h2>
                <div className="subtitle">
                  Rider tracking, delivery logistics partner allocation, and order handoff status
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {deliveries.map((del) => (
                <div key={del.id} style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '18px', border: '1px solid #ECE7DE', minWidth: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1F241C' }}>Order #{del.order_number}</span>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, backgroundColor: '#EBF0E4', color: '#475234' }}>
                      {del.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.94rem', color: '#475234', marginBottom: '8px' }}>
                    Provider: <strong>{del.provider}</strong>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#7E8775', marginBottom: '6px' }}>
                    Tracking Code: <code style={{ backgroundColor: '#F3F6EF', padding: '2px 6px', borderRadius: '4px', fontSize: '0.86rem' }}>{del.tracking_code}</code>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#7E8775' }}>
                    Rider: {del.driver_name} ({del.driver_phone})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD / EDIT CATEGORY MODAL */}
        {(showCategoryModal || editingCategory) && (
          <div className="modal-backdrop" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                  {editingCategory ? `Update Category: ${editingCategory.name}` : 'Add New Category'}
                </h3>
                <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} style={{ color: '#475234' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Momos, Boba Tea, Desserts"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Category Description
                  </label>
                  <textarea
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Brief description of this food category..."
                  />
                </div>

                <ImageUploadField
                  label="Category Cover Image"
                  value={categoryForm.image_url}
                  onChange={(url) => setCategoryForm({ ...categoryForm, image_url: url })}
                  aspectRatio="1:1"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT COUPON MODAL */}
        {(showCouponModal || editingCoupon) && (
          <div className="modal-backdrop" onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                  {editingCoupon ? `Modify Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
                </h3>
                <button onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }} style={{ color: '#475234' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    placeholder="e.g. WELCOME50"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Discount Type
                    </label>
                    <select
                      value={couponForm.discount_type}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                      className="form-select"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Discount Value
                    </label>
                    <input
                      type="number"
                      required
                      value={couponForm.discount_value}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      value={couponForm.min_order_value}
                      onChange={(e) => setCouponForm({ ...couponForm, min_order_value: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      value={couponForm.max_discount}
                      onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={couponForm.start_date || ''}
                      onChange={(e) => setCouponForm({ ...couponForm, start_date: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      End Date (Expiry)
                    </label>
                    <input
                      type="date"
                      value={couponForm.end_date || ''}
                      onChange={(e) => setCouponForm({ ...couponForm, end_date: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={couponForm.is_active === 1}
                      onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked ? 1 : 0 })}
                    />
                    Coupon Active for Customers
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT HERO SLIDE MODAL */}
        {(showSlideModal || editingSlide) && (
          <div className="modal-backdrop" onClick={() => { setShowSlideModal(false); setEditingSlide(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                  {editingSlide ? `Edit Hero Banner Slide #${editingSlide.id}` : 'Add New Hero Slide'}
                </h3>
                <button onClick={() => { setShowSlideModal(false); setEditingSlide(null); }} style={{ color: '#475234' }}><X size={18} /></button>
              </div>

              {/* Real-time Hero Banner Live Preview (Customer Look & Feel) */}
              <div style={{
                backgroundColor: '#F7F8F5',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1px solid #E2E8DC',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#5B6A4C', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={13} /> Live Banner Preview (How Customers See It)
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#65705C', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', border: '1px solid #E2E8DC', fontWeight: 700 }}>
                    Realtime Render
                  </span>
                </div>

                <div style={{
                  backgroundColor: slideForm.bg_color || '#949E7C',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  color: '#FFFFFF',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div>
                    {slideForm.tag && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.22)',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.8px',
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                      }}>
                        <Sparkles size={11} /> {slideForm.tag}
                      </span>
                    )}
                    {slideForm.script && (
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.6rem', lineHeight: 1.1, color: '#F4F8EC' }}>
                        {slideForm.script}
                      </div>
                    )}
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.25, margin: '2px 0 6px 0', color: '#FFFFFF' }}>
                      {slideForm.title || 'Your Headline Here'}
                    </div>
                    {slideForm.desc && (
                      <div style={{ fontSize: '0.74rem', color: '#F0F4E8', opacity: 0.95, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {slideForm.desc}
                      </div>
                    )}
                    <div style={{ marginTop: '10px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#1F241C',
                        padding: '5px 14px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {slideForm.button_text || 'Explore Menu'} <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>

                  {/* Preview Image */}
                  <div style={{
                    height: '130px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
                    border: '2.5px solid rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {slideForm.image_url ? (
                      <img
                        src={slideForm.image_url}
                        alt="Live Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.85)', textAlign: 'center', padding: '10px' }}>
                        Upload or paste image URL below
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveHeroSlide} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Top Tag / Pill
                    </label>
                    <input
                      type="text"
                      value={slideForm.tag}
                      onChange={(e) => setSlideForm({ ...slideForm, tag: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Cursive Script Subtitle
                    </label>
                    <input
                      type="text"
                      required
                      value={slideForm.script}
                      onChange={(e) => setSlideForm({ ...slideForm, script: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Main Headline Title
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.title}
                    onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Slide Description
                  </label>
                  <textarea
                    rows={2}
                    value={slideForm.desc}
                    onChange={(e) => setSlideForm({ ...slideForm, desc: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={slideForm.button_text}
                      onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '6px' }}>
                      Background Tone / Color Theme
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="color"
                        value={slideForm.bg_color || '#949E7C'}
                        onChange={(e) => setSlideForm({ ...slideForm, bg_color: e.target.value })}
                        style={{
                          width: '44px',
                          height: '44px',
                          padding: '2px',
                          border: '2px solid #DCE3D4',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#FFFFFF',
                          flexShrink: 0
                        }}
                        title="Click to choose custom color"
                      />
                      <input
                        type="text"
                        value={slideForm.bg_color}
                        onChange={(e) => setSlideForm({ ...slideForm, bg_color: e.target.value })}
                        className="form-input"
                        placeholder="#949E7C"
                        style={{ flex: 1, textTransform: 'uppercase' }}
                      />
                    </div>

                    {/* Curated Color Swatches */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#7E8775', marginBottom: '6px', fontWeight: 600 }}>Quick Presets:</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { name: 'Sage Green', color: '#949E7C' },
                          { name: 'Warm Olive', color: '#8B9474' },
                          { name: 'Deep Forest', color: '#5B6A4C' },
                          { name: 'Dark Moss', color: '#2F3E2B' },
                          { name: 'Warm Terracotta', color: '#B25D43' },
                          { name: 'Crimson Red', color: '#843838' },
                          { name: 'Amber Gold', color: '#C2843A' },
                          { name: 'Espresso', color: '#3D332A' },
                          { name: 'Midnight Charcoal', color: '#252D21' }
                        ].map((preset) => {
                          const isSelected = slideForm.bg_color?.toLowerCase() === preset.color.toLowerCase();
                          return (
                            <button
                              key={preset.color}
                              type="button"
                              onClick={() => setSlideForm({ ...slideForm, bg_color: preset.color })}
                              title={preset.name}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                backgroundColor: preset.color,
                                border: isSelected ? '2.5px solid #FFFFFF' : '1px solid rgba(0,0,0,0.15)',
                                outline: isSelected ? '2px solid #85926B' : 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <ImageUploadField
                  label="Hero Banner Image"
                  value={slideForm.image_url}
                  onChange={(url) => setSlideForm({ ...slideForm, image_url: url })}
                  aspectRatio="16:9"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => { setShowSlideModal(false); setEditingSlide(null); }} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingSlide ? 'Save Slide' : 'Create Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT STORE BRANCH MODAL */}
        {(showBranchModal || editingBranch) && (
          <div className="modal-backdrop" onClick={() => { setShowBranchModal(false); setEditingBranch(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                  {editingBranch ? `Modify Branch: ${editingBranch.name}` : 'Add New Branch Outlet'}
                </h3>
                <button onClick={() => { setShowBranchModal(false); setEditingBranch(null); }} style={{ color: '#475234' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Branch / Outlet Name
                  </label>
                  <input
                    type="text"
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Indiranagar (Flagship)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Branch Code (Short identifier)
                    </label>
                    <input
                      type="text"
                      required
                      value={branchForm.code}
                      onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                      className="form-input"
                      placeholder="e.g. INDIRA"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      className="form-input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Full Street Address
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    className="form-textarea"
                    placeholder="e.g. 100 Feet Rd, Indiranagar, Bengaluru, 560038"
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={branchForm.is_active === 1}
                      onChange={(e) => setBranchForm({ ...branchForm, is_active: e.target.checked ? 1 : 0 })}
                    />
                    Branch Active for Customer Orders & Kitchen Work
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => { setShowBranchModal(false); setEditingBranch(null); }} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingBranch ? 'Save Branch Details' : 'Create Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT FOOD ITEM MODAL */}
        {showAddFoodModal && (
          <div className="modal-backdrop" onClick={() => setShowAddFoodModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1F241C' }}>
                  {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button onClick={() => setShowAddFoodModal(false)} style={{ color: '#475234' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Dish Name
                  </label>
                  <input
                    type="text"
                    required
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={foodForm.category_id}
                      onChange={(e) => setFoodForm({ ...foodForm, category_id: e.target.value })}
                      className="form-select"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Prep Time
                    </label>
                    <input
                      type="text"
                      value={foodForm.prep_time}
                      onChange={(e) => setFoodForm({ ...foodForm, prep_time: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Regular Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={foodForm.price}
                      onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Discount Price (₹)
                    </label>
                    <input
                      type="number"
                      value={foodForm.discount_price}
                      onChange={(e) => setFoodForm({ ...foodForm, discount_price: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Dish Photo"
                  value={foodForm.image_url}
                  onChange={(url) => setFoodForm({ ...foodForm, image_url: url })}
                  aspectRatio="4:3"
                />

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={foodForm.description}
                    onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem' }}>
                    <input
                      type="checkbox"
                      checked={foodForm.is_veg === 1}
                      onChange={(e) => setFoodForm({ ...foodForm, is_veg: e.target.checked ? 1 : 0 })}
                    />
                    Vegetarian dish
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem' }}>
                    <input
                      type="checkbox"
                      checked={foodForm.is_available === 1}
                      onChange={(e) => setFoodForm({ ...foodForm, is_available: e.target.checked ? 1 : 0 })}
                    />
                    In Stock (Available)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddFoodModal(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingFood ? 'Update Dish' : 'Add Dish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT BRANCH MODAL */}
        {showBranchModal && (
          <div className="modal-overlay" onClick={() => setShowBranchModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', margin: 0 }}>
                  {editingBranch ? 'Edit Store Branch' : 'Add New Store Branch'}
                </h3>
                <button
                  onClick={() => setShowBranchModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E8775' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar, Koramangala"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Branch Code (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IND-01, KOR-02"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Full physical street address"
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: '#1F241C' }}>
                  <input
                    type="checkbox"
                    checked={branchForm.is_active === 1}
                    onChange={(e) => setBranchForm({ ...branchForm, is_active: e.target.checked ? 1 : 0 })}
                  />
                  Outlet is open and active for customer orders
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowBranchModal(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingBranch ? 'Update Branch' : 'Add Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE EMPLOYEE MODAL */}
        {showAddEmployeeModal && (
          <div className="modal-overlay" onClick={() => setShowAddEmployeeModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', margin: 0 }}>
                  Create Staff Employee Account
                </h3>
                <button
                  onClick={() => setShowAddEmployeeModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E8775' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#65705C', margin: '0 0 16px 0' }}>
                Employees are assigned to a single dedicated branch location upon creation. They can sign in at the Employee Portal to manage live kitchen and café orders.
              </p>

              <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Chef Arun"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="staff@cometoeat.com"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Assigned Branch Station *
                  </label>
                  <select
                    required
                    value={employeeForm.branch_id}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, branch_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select branch station...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddEmployeeModal(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TRANSFER BRANCH TWO-WAY VERIFICATION MODAL */}
        {transferEmployee && (
          <div className="modal-overlay" onClick={() => setTransferEmployee(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', margin: 0 }}>
                  Initiate Branch Reassignment
                </h3>
                <button
                  onClick={() => setTransferEmployee(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E8775' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                backgroundColor: '#F8FAF5',
                border: '1px solid #DCE6D3',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '0.84rem',
                color: '#3B4530'
              }}>
                <div>Employee: <strong>{transferEmployee.name}</strong> ({transferEmployee.email})</div>
                <div style={{ marginTop: '4px' }}>Current Branch: <strong>{transferEmployee.branch_name || 'Unassigned'}</strong></div>
              </div>

              <div style={{
                backgroundColor: '#FFF8E1',
                border: '1px solid #FFE082',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#795548'
              }}>
                <AlertTriangle size={18} color="#FFA000" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Two-Way Verification Required:</strong> Submitting this request sends a relocation confirmation prompt to <strong>{transferEmployee.name}</strong> upon their next login. Their station will only be switched once they click "Confirm & Accept Transfer".
                </div>
              </div>

              <form onSubmit={handleInitiateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Select New Branch Station *
                  </label>
                  <select
                    required
                    value={transferBranchId}
                    onChange={(e) => setTransferBranchId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select target destination branch...</option>
                    {branches
                      .filter((b) => b.id !== transferEmployee.branch_id)
                      .map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setTransferEmployee(null)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    Send Transfer Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT VISUAL OFFER BANNER MODAL */}
        {showOfferModal && (
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-container" style={{ maxWidth: '640px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F241C', margin: 0 }}>
                  {editingOffer ? `Edit Offer Banner #${editingOffer.id}` : 'Add New Offer Banner'}
                </h3>
                <button onClick={() => setShowOfferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#65705C' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Offer Headline Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 50% OFF First Order"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Badge Tag *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WELCOME SPECIAL"
                      value={offerForm.tag}
                      onChange={(e) => setOfferForm({ ...offerForm, tag: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Button CTA Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Order Burgers Now"
                      value={offerForm.button_text}
                      onChange={(e) => setOfferForm({ ...offerForm, button_text: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                    Description / Offer Detail
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Unlock 50% discount on gourmet smash burgers..."
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <ImageUploadField
                  label="Offer Banner Image URL"
                  value={offerForm.image_url}
                  onChange={(url) => setOfferForm({ ...offerForm, image_url: url })}
                  placeholder="https://images.unsplash.com/..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Target Category Filter
                    </label>
                    <select
                      value={offerForm.target_category}
                      onChange={(e) => setOfferForm({ ...offerForm, target_category: e.target.value })}
                      className="form-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475234', marginBottom: '4px' }}>
                      Branch Scope
                    </label>
                    <select
                      value={offerForm.branch_id}
                      onChange={(e) => setOfferForm({ ...offerForm, branch_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">All Branches (Global)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button type="button" onClick={() => setShowOfferModal(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                    {editingOffer ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ADD / EDIT HERO BANNER SLIDE MODAL HANDLED ABOVE */}

      </main>
    </div>
  );
}
