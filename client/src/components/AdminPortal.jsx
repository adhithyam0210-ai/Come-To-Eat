import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, FolderTree, Users, CreditCard,
  Truck, Tag, MessageSquare, Plus, Edit2, Trash2, CheckCircle, CheckCircle2, Check, AlertTriangle,
  Search, RefreshCw, X, ArrowUpRight, ArrowRight, TrendingUp, Shield, Clock, Eye, ChefHat, Package, Sparkles,
  Building, MapPin, Phone
} from 'lucide-react';
import { api } from '../utils/api';
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
      if (res.success) setOrders(res.orders);
    } catch (e) {} finally {
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

  const fetchHeroSlides = async () => {
    try {
      const res = await api.get('/hero-slides/admin');
      if (res.success) setHeroSlides(res.slides);
    } catch (e) {}
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
        if (res.success) setMessage('Coupon modified successfully.');
      } else {
        const res = await api.post('/coupons', couponForm);
        if (res.success) setMessage('New coupon created successfully.');
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      fetchCoupons();
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert(err.message || 'Failed to save coupon.');
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
      fetchHeroSlides();
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
        fetchHeroSlides();
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete hero slide.');
    }
  };

  // Store Settings & Timings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        setMessage('Store timings and details updated successfully!');
        if (onSettingsUpdate) onSettingsUpdate(res.settings);
        if (onDataUpdate) onDataUpdate();
      }
    } catch (err) {
      alert(err.message || 'Failed to save store settings.');
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
      tag: slide.tag,
      script: slide.script,
      title: slide.title,
      desc: slide.desc,
      image_url: slide.image_url,
      button_text: slide.button_text,
      bg_color: slide.bg_color,
      accent_text: slide.accent_text || '',
      target_category: slide.target_category || 'Burgers and Sandwiches'
    });
    setShowSlideModal(true);
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.order_status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone?.toLowerCase().includes(q);
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
    { id: 'coupons', label: 'Coupons & Offers', icon: Tag },
    { id: 'hero', label: 'Hero Banner', icon: Sparkles },
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
      <main className="portal-main">
        {/* Toast */}
        {message && (
          <div style={{
            backgroundColor: '#E8F5E9',
            border: '1px solid #A5D6A7',
            color: '#2E7D32',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {message}
            </span>
            <button onClick={() => setMessage('')} style={{ color: '#2E7D32', display: 'flex', alignItems: 'center' }}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* 1. DASHBOARD TAB (Includes Full Revenue Metrics for Manager Admin) */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Kitchen & Sales Overview
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Real-time operational health and financial revenue metrics
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '12px', border: '1.5px solid #85926B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <Building size={14} color="#85926B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475234' }}>Branch:</span>
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
                      fontSize: '0.8rem',
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
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCE3D4',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475234'
                  }}
                >
                  <RefreshCw size={14} /> Refresh Data
                </button>
              </div>
            </div>

            {/* Financial & Operational Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.74rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Today's Revenue</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1F241C', marginTop: '4px' }}>₹{stats.todayRevenue || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '4px' }}>Total All Time: ₹{stats.totalRevenue || 0}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.74rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Today's Orders</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1F241C', marginTop: '4px' }}>{stats.todayOrders}</div>
                <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '4px' }}>All-time total: {stats.totalOrders}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.74rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Active Kitchen Orders</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#E76F51', marginTop: '4px' }}>{stats.pendingOrders}</div>
                <div style={{ fontSize: '0.75rem', color: '#E76F51', marginTop: '4px' }}>Needs preparation / dispatch</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.74rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Completed Deliveries</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>{stats.completedOrders}</div>
                <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '4px' }}>Cancelled: {stats.cancelledOrders}</div>
              </div>
            </div>

            {/* Popular Items & Recent Orders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1F241C', marginBottom: '16px' }}>
                  Popular Food Items
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.popularItems?.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F4F6F1' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2A3324' }}>
                        #{idx + 1} {p.food_name}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1F241C' }}>{p.total_sold} sold</div>
                        <div style={{ fontSize: '0.74rem', color: '#7E8775' }}>₹{p.total_revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1F241C' }}>
                    Recent Orders
                  </h4>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '0.8rem', color: '#85926B', fontWeight: 600 }}>
                    View All →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.recentOrders?.slice(0, 6).map((ro) => (
                    <div key={ro.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F241C' }}>#{ro.order_number}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7E8775' }}>{ro.customer_name} • ₹{ro.final_amount}</div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Live Orders Audit (View-Only)
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Managerial audit view • Operational status transitions are handled live in the Employee Station
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '12px', border: '1.5px solid #85926B' }}>
                  <Building size={14} color="#85926B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475234' }}>Branch:</span>
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
                      fontSize: '0.8rem',
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
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    border: '1px solid #DCE3D4',
                    fontSize: '0.84rem',
                    outline: 'none',
                    width: '100%',
                    maxWidth: '220px'
                  }}
                />
                <button
                  onClick={() => fetchOrders(selectedBranchFilter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCE3D4',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475234'
                  }}
                >
                  <RefreshCw size={13} /> Refresh
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
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    backgroundColor: orderStatusFilter === status ? '#85926B' : '#FFFFFF',
                    color: orderStatusFilter === status ? '#FFFFFF' : '#475234',
                    border: '1px solid #DCE3D4'
                  }}
                >
                  {status === 'all' ? 'All Orders' : status}
                </button>
              ))}
            </div>

            {/* Orders Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #ECE7DE',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1F241C' }}>
                            #{order.order_number}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#EAF0E2',
                            color: '#475234',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Building size={10} /> {order.branch_name || 'Indiranagar'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#7E8775', marginTop: '2px' }}>
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: order.order_status === 'Delivered' ? '#E8F5E9' : '#FFF3E0',
                        color: order.order_status === 'Delivered' ? '#2E7D32' : '#E65100'
                      }}>
                        {order.order_status}
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #F2EFE9', paddingTop: '10px', marginBottom: '10px', fontSize: '0.84rem' }}>
                      <div style={{ fontWeight: 600, color: '#1F241C' }}>{order.customer_name}</div>
                      <div style={{ color: '#7E8775', fontSize: '0.78rem' }}>{order.customer_phone || 'No phone'}</div>
                      <div style={{ color: '#556149', fontSize: '0.78rem', marginTop: '4px' }}>
                        📍 {order.delivery_type === 'pickup' ? 'Takeaway Pickup at Counter' : (order.delivery_address || 'Home Delivery')}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#475234', marginBottom: '10px' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                          <span>{item.quantity}x {item.food_name}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F2EFE9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1F241C' }}>
                      Total: ₹{order.final_amount}
                    </span>
                    <span style={{ fontStyle: 'italic', color: '#85926B', fontSize: '0.76rem' }}>
                      Admin View-Only • Kitchen Managed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STORE BRANCHES & DEDICATED STAFF TAB */}
        {activeTab === 'branches' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Store Outlets & Dedicated Staff
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Manage Come To Eat café branch locations and employee station assignments with two-way verification
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={openAddBranch}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
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
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                >
                  <ChefHat size={16} /> Create Staff Employee
                </button>
              </div>
            </div>

            {/* BRANCHES LIST */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2B3224', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#85926B" /> Café Outlets ({branches.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {branches.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '18px',
                      border: '1px solid #E6ECE0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1F241C' }}>
                            {b.name}
                          </span>
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#EAF0E2',
                            color: '#475234'
                          }}>
                            {b.code}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: b.is_active ? '#E8F5E9' : '#FFEBEE',
                          color: b.is_active ? '#2E7D32' : '#C62828'
                        }}>
                          {b.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#556149', display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                        <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#85926B' }} />
                        <span>{b.address || 'Address not set'}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#556149', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} style={{ flexShrink: 0, color: '#85926B' }} />
                        <span>{b.phone || 'Phone not set'}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #F0EFEA', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => handleDeleteBranch(b.id, b.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#C62828',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Delete branch outlet"
                      >
                        <Trash2 size={13} /> Delete Branch
                      </button>
                      <button
                        onClick={() => openEditBranch(b)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#475234',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Edit2 size={13} /> Edit Outlet Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EMPLOYEES & TWO-WAY REASSIGNMENT */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2B3224', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChefHat size={18} color="#85926B" /> Staff Employees & Station Verification ({employees.length})
                </h3>
              </div>

              {/* Informational Banner on Two-Way Verification & Single Branch Lock */}
              <div style={{
                backgroundColor: '#F8FAF5',
                border: '1px solid #DCE6D3',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '0.86rem',
                color: '#3B4530',
                lineHeight: 1.5
              }}>
                <Shield size={20} color="#85926B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Branch Lock & Two-Way Verification Policy:</strong> Employees operate exclusively within their assigned physical station. When you initiate a branch reassignment, the employee is presented with a prominent confirmation prompt upon their next login. Only when confirmed by the employee does their operational station switch.
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E6ECE0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #E6ECE0', fontSize: '0.82rem', color: '#556149', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px' }}>Staff Member</th>
                      <th style={{ padding: '14px 18px' }}>Current Branch</th>
                      <th style={{ padding: '14px 18px' }}>Station Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#7E8775', fontStyle: 'italic' }}>
                          No staff employee accounts created yet. Click "Create Staff Employee" above to add kitchen or café staff.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid #F2EFE9', fontSize: '0.88rem' }}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 700, color: '#1F241C' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#7E8775' }}>{emp.email}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#EAF0E2',
                              color: '#3B4530',
                              fontWeight: 700,
                              fontSize: '0.82rem'
                            }}>
                              <Building size={13} /> {emp.branch_name || 'Unassigned'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {emp.transfer_status === 'pending_employee_confirmation' ? (
                              <div>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FFF3E0',
                                  color: '#E65100',
                                  fontWeight: 700,
                                  fontSize: '0.78rem'
                                }}>
                                  <AlertTriangle size={13} /> Pending Confirmation
                                </span>
                                <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '3px' }}>
                                  Relocating to: <strong>{emp.pending_branch_name}</strong>
                                </div>
                              </div>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#E8F5E9',
                                color: '#2E7D32',
                                fontWeight: 700,
                                fontSize: '0.78rem'
                              }}>
                                <CheckCircle size={13} /> Active at Station
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            {emp.transfer_status === 'pending_employee_confirmation' ? (
                              <button
                                onClick={() => handleCancelTransfer(emp.id)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  backgroundColor: '#FFEBEE',
                                  color: '#C62828',
                                  border: '1px solid #FFCDD2',
                                  borderRadius: '6px',
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
                                  padding: '6px 14px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  backgroundColor: '#F3F6EF',
                                  color: '#475234',
                                  border: '1px solid #DCE6D3',
                                  borderRadius: '6px',
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
          </div>
        )}

        {/* 3. FOOD ITEMS TAB */}
        {activeTab === 'foods' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Menu Dishes & Catalog
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Manage dishes across Come To Eat categories with device image upload
                </div>
              </div>
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
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} /> Add Food Item
              </button>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DE', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Food Item</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Price</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Diet</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                      <td style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={food.image_url} alt={food.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#1F241C' }}>{food.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#7E8775' }}>{food.prep_time}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px', color: '#556149' }}>{food.category_name}</td>
                      <td style={{ padding: '12px 18px', fontWeight: 700 }}>₹{food.discount_price || food.price}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          border: food.is_veg ? '1px solid #2E7D32' : '1px solid #C62828',
                          color: food.is_veg ? '#2E7D32' : '#C62828',
                          backgroundColor: food.is_veg ? '#F1F8F3' : '#FDF2F2'
                        }}>
                          {food.is_veg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <button
                          onClick={() => handleToggleAvailability(food.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: food.is_available ? '#E8F5E9' : '#FFEBEE',
                            color: food.is_available ? '#2E7D32' : '#C62828',
                            border: '1px solid currentColor'
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
        )}

        {/* 4. CATEGORIES TAB (WITH ADD & EDIT & DELETE CATEGORY OPTIONS) */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Food Categories Management
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Create categories, upload category banner images from your device, and manage menu sections
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={fetchCategories}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Reload categories"
                >
                  <RefreshCw size={15} /> Refresh
                </button>
                <button
                  onClick={openAddCategory}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.86rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #ECE7DE',
                padding: '48px 20px',
                textAlign: 'center'
              }}>
                <FolderTree size={42} color="#85926B" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1F241C', marginBottom: '6px' }}>No Categories Loaded</h4>
                <p style={{ color: '#7E8775', fontSize: '0.88rem', marginBottom: '16px' }}>Click refresh to fetch current menu categories or add a new category.</p>
                <button onClick={fetchCategories} className="btn-secondary" style={{ padding: '8px 18px' }}>
                  Refresh Categories
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #ECE7DE',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0
                    }}
                  >
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F241C' }}>
                          {cat.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditCategory(cat)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#F0F4E8',
                              color: '#475234',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                            title="Edit Category Details"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            style={{
                              color: '#C62828',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#FFEBEE'
                            }}
                            title="Delete Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#6A7463', lineHeight: 1.4, flex: 1 }}>
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. COUPONS TAB (WITH ADD, MODIFY & DELETE OPTIONS AND DATE RANGES) */}
        {activeTab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Coupons & Promo Offers
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Create coupons, set valid start/end dates, modify discounts, or delete expired promotions
                </div>
              </div>
              <button
                onClick={openAddCoupon}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.86rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} /> Add Coupon
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {coupons.map((cp) => (
                <div
                  key={cp.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px dashed #C8D1BE',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        backgroundColor: '#F3F6EE',
                        color: '#475234',
                        padding: '4px 10px',
                        borderRadius: '6px'
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
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#F0F4E8',
                            color: '#475234',
                            fontSize: '0.78rem',
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
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#FFEBEE'
                          }}
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#E76F51', marginBottom: '4px' }}>
                      {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} FLAT`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6A7463', marginBottom: '4px' }}>
                      Min Order: ₹{cp.min_order_value} • Max Cap: ₹{cp.max_discount}
                    </div>
                    {(cp.start_date || cp.end_date || cp.expires_at) && (
                      <div style={{ fontSize: '0.75rem', color: '#85926B', fontWeight: 600 }}>
                        Valid: {cp.start_date || 'Ongoing'} → {cp.end_date || cp.expires_at || 'No expiry'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F0F4E8' }}>
                    <span style={{ fontSize: '0.75rem', color: '#7E8775' }}>
                      Redeemed: <strong>{cp.times_used || 0} times</strong>
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: cp.is_active ? '#E8F5E9' : '#F5F5F5',
                      color: cp.is_active ? '#2E7D32' : '#9E9E9E'
                    }}>
                      {cp.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. HERO BANNER TAB (ADD, EDIT & DELETE HERO SLIDES) */}
        {activeTab === 'hero' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Hero Banner Slides Management
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                  Add hero slides with device image uploads, customize headline titles, CTA buttons, background colors, or delete slides
                </div>
              </div>
              <button
                onClick={openAddSlide}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.86rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} /> Add Hero Slide
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #ECE7DE',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{
                    backgroundColor: slide.bg_color,
                    padding: '20px',
                    color: '#FFFFFF',
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px' }}>{slide.tag}</div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', lineHeight: 1.2 }}>{slide.script}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{slide.title}</div>
                  </div>

                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '0.82rem', color: '#65705C', lineHeight: 1.5, flex: 1 }}>
                      {slide.desc}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F0EFEB' }}>
                      <span style={{ fontSize: '0.75rem', color: '#85926B', fontWeight: 700 }}>
                        CTA: "{slide.button_text}"
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditSlide(slide)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#85926B',
                            color: '#FFFFFF',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHeroSlide(slide.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#FFEBEE',
                            color: '#C62828',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                          title="Delete Slide"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. STORE SETTINGS & TIMINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                Store Timings & Operational Settings
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#65705C', marginTop: '4px' }}>
                Customize your daily restaurant operating hours, delivery promise badges, and contact details reflected immediately on the live website
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(16px, 4vw, 28px)', borderRadius: '20px', border: '1px solid #ECE7DE', maxWidth: '680px', width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
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
                  <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '4px' }}>
                    Displays in the top green banner across all pages for customers and staff.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
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
                  <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '4px' }}>
                    Displayed in the Landing Page and customer Home Page information cards.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
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
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1F241C', marginBottom: '6px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
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
            <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25, marginBottom: '18px' }}>
              Registered Customer Accounts
            </h2>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE7DE', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE', color: '#475234' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Total Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>{c.name}</td>
                      <td style={{ padding: '14px 18px', color: '#556149' }}>{c.email}</td>
                      <td style={{ padding: '14px 18px', color: '#7E8775' }}>{c.phone || 'N/A'}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>{c.total_orders || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25, marginBottom: '18px' }}>
              Financial Transactions Audit
            </h2>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE7DE', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE', color: '#475234' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Order #</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Method</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '14px 18px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>#{p.order_number}</td>
                      <td style={{ padding: '14px 18px' }}>{p.customer_name}</td>
                      <td style={{ padding: '14px 18px', color: '#556149' }}>{p.payment_method}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 800 }}>₹{p.amount}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: p.status === 'successful' ? '#E8F5E9' : '#F4F6F1',
                          color: p.status === 'successful' ? '#2E7D32' : '#475234'
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. DELIVERIES TAB */}
        {activeTab === 'deliveries' && (
          <div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25, marginBottom: '18px' }}>
              Third-Party Delivery Dispatch
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {deliveries.map((del) => (
                <div key={del.id} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #ECE7DE', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, color: '#1F241C' }}>Order #{del.order_number}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#EBF0E4', color: '#475234' }}>
                      {del.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475234', marginBottom: '6px' }}>
                    Provider: <strong>{del.provider}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#7E8775', marginBottom: '4px' }}>
                    Tracking Code: <code>{del.tracking_code}</code>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#7E8775' }}>
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

              {/* Real-time Hero Banner Live Preview */}
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
                  borderRadius: '14px',
                  padding: '16px 20px',
                  color: '#FFFFFF',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '14px',
                  alignItems: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div>
                    {slideForm.tag && (
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                      }}>
                        {slideForm.tag}
                      </span>
                    )}
                    {slideForm.script && (
                      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: '#FFF' }}>
                        {slideForm.script}
                      </div>
                    )}
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.25, margin: '3px 0 5px 0' }}>
                      {slideForm.title || 'Your Headline Here'}
                    </div>
                    {slideForm.desc && (
                      <div style={{ fontSize: '0.72rem', opacity: 0.9, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {slideForm.desc}
                      </div>
                    )}
                    <div style={{ marginTop: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#1F241C',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {slideForm.button_text || 'Order Now'} <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>

                  {/* Preview Image */}
                  <div style={{
                    height: '115px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(255,255,255,0.4)',
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
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: '8px' }}>
                        Upload banner image below to preview
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
      </main>
    </div>
  );
}
