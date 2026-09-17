import React, { useState, useEffect } from 'react';
import {
  ChefHat, ShoppingBag, UtensilsCrossed, Clock, Check, CheckCircle2,
  Package, Truck, RefreshCw, AlertCircle, Search, CreditCard, Banknote,
  Smartphone, Building, Shield, LogOut, ArrowUpRight, Eye
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { subscribeToLiveOrders } from '../utils/supabase';

export function EmployeePortal({
  onSwitchToUserView,
  branches = [],
  selectedBranch,
  onSelectBranch
}) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'dashboard', 'foods'

  const userAssignedBranch = branches.find((b) => b.id === (user?.branch_id || 1)) || {
    id: user?.branch_id || 1,
    name: user?.branch_name || 'Indiranagar (Flagship)'
  };
  const [activeBranch, setActiveBranch] = useState(userAssignedBranch);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchOrder, setSearchOrder] = useState('');

  const [pendingTransfer, setPendingTransfer] = useState(
    user?.transfer_status === 'pending_employee_confirmation' && user?.pending_branch_id
      ? {
          branchId: user.pending_branch_id,
          branchName: user.pending_branch_name || 'New Station'
        }
      : null
  );

  // Sync active branch if user session or branches change
  useEffect(() => {
    if (user?.branch_id) {
      const b = branches.find((item) => item.id === user.branch_id);
      if (b && b.id !== activeBranch?.id) {
        setActiveBranch(b);
      }
    }
  }, [user, branches]);

  // Check latest user profile to verify pending transfer
  useEffect(() => {
    api.get('/auth/me').then((res) => {
      if (res.success && res.user) {
        if (res.user.transfer_status === 'pending_employee_confirmation' && res.user.pending_branch_id) {
          setPendingTransfer({
            branchId: res.user.pending_branch_id,
            branchName: res.user.pending_branch_name || 'New Station'
          });
        }
      }
    }).catch(() => {});
  }, []);

  const handleConfirmTransfer = async () => {
    try {
      const res = await api.post('/employee/confirm-transfer');
      if (res.success) {
        setMessage(res.message);
        const newB = branches.find((b) => b.id === res.branch_id) || { id: res.branch_id, name: res.branch_name };
        setActiveBranch(newB);
        setPendingTransfer(null);
        fetchOrders(res.branch_id);
        fetchStats(res.branch_id);
      }
    } catch (err) {
      console.error('Failed to confirm transfer:', err);
    }
  };

  const handleDeclineTransfer = async () => {
    try {
      const res = await api.post('/employee/decline-transfer');
      if (res.success) {
        setMessage('Transfer request declined.');
        setPendingTransfer(null);
      }
    } catch (err) {
      console.error('Failed to decline transfer:', err);
    }
  };

  // Fetch stats without revenue, scoped to active branch
  const fetchStats = async (branchId) => {
    try {
      const bId = branchId !== undefined ? branchId : (activeBranch?.id || 1);
      const res = await api.get(`/admin/dashboard?branch_id=${bId}`);
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to fetch employee dashboard metrics:', err);
    }
  };

  // Fetch orders strictly for employee's active kitchen branch
  const fetchOrders = async (branchId) => {
    try {
      setLoading(true);
      const bId = branchId !== undefined ? branchId : (activeBranch?.id || 1);
      const res = await api.get(`/orders/admin/all?branch_id=${bId}`);
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to fetch kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch foods for availability toggle
  const fetchFoods = async () => {
    try {
      const res = await api.get('/foods');
      if (res.success && res.foods) {
        setFoods(res.foods);
      }
    } catch (err) {
      console.error('Failed to fetch foods:', err);
    }
  };

  // Switch kitchen station
  const handleBranchSwitch = (newBranch) => {
    setActiveBranch(newBranch);
    if (onSelectBranch) onSelectBranch(newBranch);
    fetchOrders(newBranch.id);
    fetchStats(newBranch.id);
    setMessage(`Kitchen active station switched to ${newBranch.name}`);
  };

  useEffect(() => {
    const bId = activeBranch?.id || 1;
    fetchOrders(bId);
    fetchStats(bId);
    fetchFoods();

    // Supabase Realtime / SSE Live Reflection Subscription with branch filtering
    const unsubscribe = subscribeToLiveOrders((updatedOrder, eventType) => {
      const currentBId = activeBranch?.id || 1;
      // Strict branch isolation: only notify and re-fetch if order is for this branch!
      if (updatedOrder.branch_id && Number(updatedOrder.branch_id) !== Number(currentBId)) {
        return;
      }
      setMessage(`Live update: Order #${updatedOrder.order_number} ${eventType === 'ORDER_CREATED' ? 'received at this branch station!' : 'updated.'}`);
      fetchOrders(currentBId);
      fetchStats(currentBId);
    });

    return () => unsubscribe();
  }, [activeBranch?.id]);

  // Employee workflow action
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        setMessage(`Order marked as ${newStatus}`);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Toggle food availability
  const handleToggleAvailability = async (foodId) => {
    try {
      const res = await api.patch(`/foods/${foodId}/availability`);
      if (res.success) {
        fetchFoods();
        setMessage('Food availability updated.');
      }
    } catch (err) {
      alert('Failed to toggle food availability');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone?.toLowerCase().includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  const employeeNavItems = [
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: stats?.pendingOrders },
    { id: 'dashboard', label: 'Kitchen Overview', icon: Clock },
    { id: 'foods', label: 'Food Availability', icon: UtensilsCrossed }
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
            <div style={{ fontSize: '0.64rem', color: '#A3B18A', fontWeight: 700, letterSpacing: '0.5px' }}>
              KITCHEN OPERATIONS
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
        {employeeNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
        {/* Ops Header */}
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
              <div style={{ fontSize: '0.7rem', color: '#A3B18A', fontWeight: 700, letterSpacing: '0.8px' }}>
                KITCHEN OPERATIONS
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {employeeNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: active ? '#85926B' : 'transparent',
                  color: active ? '#FFFFFF' : '#CBD4C0',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#E76F51',
                    color: '#FFF',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
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
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main">
        {/* Toast / Notification message */}
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} /> {message}
            </span>
            <button onClick={() => setMessage('')} style={{ color: '#2E7D32', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* 1. LIVE ORDERS TAB (Work execution with Payment Indicators) */}
        {activeTab === 'orders' && (
          <div>
            {/* Pending Transfer Verification Prompt (Two-Way Verification Step 2) */}
            {pendingTransfer && (
              <div style={{
                backgroundColor: '#FFF8E1',
                border: '2px solid #FFA000',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                boxShadow: '0 4px 16px rgba(255, 160, 0, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B78103' }}>
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#5D4037' }}>
                      Station Transfer Request from Restaurant Admin
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#795548', marginTop: '2px' }}>
                      Admin has requested to reassign your kitchen station to <strong>{pendingTransfer.branchName}</strong>. Do you confirm and accept this station transfer?
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleConfirmTransfer}
                    style={{
                      backgroundColor: '#2E7D32',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={16} /> Confirm & Accept Transfer
                  </button>
                  <button
                    onClick={handleDeclineTransfer}
                    style={{
                      backgroundColor: '#EEEEEE',
                      color: '#424242',
                      border: '1px solid #BDBDBD',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Active Kitchen Station Scope Bar (Locked to Assigned Location) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #85926B',
              borderRadius: '16px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EBF0E4',
                  color: '#475234',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#85926B', letterSpacing: '0.5px' }}>
                    Assigned Kitchen Station
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1F241C' }}>
                    {activeBranch?.name || 'Indiranagar (Flagship)'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F0F4E8',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  color: '#475234',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid #DCE3D4'
                }}>
                  <Shield size={14} color="#85926B" /> Assigned by Admin • Dedicated Station
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                  Live Kitchen Order Station
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#65705C' }}>
                  Realtime live reflection • Advance orders and verify payment collection
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '420px', justifyContent: 'flex-start' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#85926B' }} />
                  <input
                    type="text"
                    placeholder="Search by #order or customer..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    style={{
                      padding: '8px 12px 8px 36px',
                      borderRadius: '9999px',
                      border: '1px solid #DCE3D4',
                      fontSize: '0.84rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>

                <button
                  onClick={() => { fetchOrders(); fetchStats(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    border: '1px solid #DCE3D4',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475234'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['all', 'Order Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: statusFilter === st ? '#85926B' : '#FFFFFF',
                    color: statusFilter === st ? '#FFFFFF' : '#556149',
                    border: '1px solid #DCE3D4',
                    transition: 'all 0.2s'
                  }}
                >
                  {st === 'all' ? 'All Live' : st}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {loading && orders.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#7E8775' }}>Loading live orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: '1px solid #ECE7DE' }}>
                <ShoppingBag size={40} color="#85926B" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1F241C' }}>No orders found</h4>
                <p style={{ fontSize: '0.85rem', color: '#7E8775' }}>No orders matching current filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map((ord) => {
                  const isDelivered = ord.order_status === 'Delivered';
                  const isCancelled = ord.order_status === 'Cancelled';
                  const isCod = ord.payment_method === 'Cash on Delivery';
                  const isPaid = ord.payment_status === 'completed' || ord.payment_status === 'successful';

                  return (
                    <div
                      key={ord.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #ECE7DE',
                        padding: '20px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Top Bar: Order Number, Status, Customer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1F241C' }}>
                              Order #{ord.order_number}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: isDelivered ? '1px solid #2E7D32' : isCancelled ? '1px solid #C62828' : '1px solid #85926B',
                              backgroundColor: isDelivered ? '#E8F5E9' : isCancelled ? '#FFEBEE' : '#F3F6EE',
                              color: isDelivered ? '#2E7D32' : isCancelled ? '#C62828' : '#475234'
                            }}>
                              {ord.order_status}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#EAF0E2',
                              color: '#475234',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Building size={11} /> {ord.branch_name || activeBranch?.name || 'Indiranagar'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#65705C', marginTop: '4px' }}>
                            Customer: <strong>{ord.customer_name}</strong> • Phone: {ord.customer_phone} • {ord.delivery_type === 'pickup' ? 'Takeaway Pickup' : 'Home Delivery'}
                          </div>
                        </div>

                        {/* Payment Details Indicator */}
                        <div style={{
                          backgroundColor: isPaid ? '#F0F9F1' : isCod ? '#FFF9E6' : '#FAF8F5',
                          border: isPaid ? '1px solid #A5D6A7' : isCod ? '1px solid #FFE082' : '1px solid #ECE7DE',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          textAlign: 'right'
                        }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isPaid ? '#2E7D32' : isCod ? '#B78103' : '#65705C' }}>
                            {isPaid ? 'PAID ONLINE' : isCod ? 'COLLECT CASH ON DELIVERY' : 'PAYMENT PENDING'}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1F241C', marginTop: '2px' }}>
                            ₹{ord.final_amount}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#65705C' }}>
                            Method: <strong>{ord.payment_method}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Items to Prepare */}
                      <div style={{ backgroundColor: '#FAF8F5', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#3A4430', marginBottom: '6px' }}>Kitchen Items to Prepare:</div>
                        {ord.items?.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                            <span>
                              <strong>{it.quantity}x</strong> {it.food_name}
                              {it.selected_addons && it.selected_addons.length > 0 && (
                                <span style={{ color: '#7E8775', fontSize: '0.78rem', marginLeft: '6px' }}>
                                  (+ {it.selected_addons.map((a) => a.name).join(', ')})
                                </span>
                              )}
                            </span>
                            <span style={{ fontWeight: 600 }}>₹{it.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      {/* Employee Operational Action Buttons */}
                      {!isDelivered && !isCancelled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #F0EFEB' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475234' }}>Advance Status:</span>

                          {ord.order_status === 'Order Placed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Confirmed')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                backgroundColor: '#85926B',
                                color: '#FFF',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Check size={14} /> Confirm Order
                            </button>
                          )}

                          {ord.order_status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                backgroundColor: '#85926B',
                                color: '#FFF',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <ChefHat size={14} /> Start Preparing
                            </button>
                          )}

                          {ord.order_status === 'Preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Ready')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                backgroundColor: '#85926B',
                                color: '#FFF',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Package size={14} /> Pack as Ready
                            </button>
                          )}

                          {ord.order_status === 'Ready' && ord.delivery_type !== 'pickup' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Out for Delivery')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                backgroundColor: '#85926B',
                                color: '#FFF',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Truck size={14} /> Dispatch (Out for Delivery)
                            </button>
                          )}

                          {(ord.order_status === 'Out for Delivery' || (ord.order_status === 'Ready' && ord.delivery_type === 'pickup')) && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                backgroundColor: '#2E7D32',
                                color: '#FFF',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <CheckCircle2 size={14} /> Mark Delivered
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. DASHBOARD TAB (Operational Stats Only — Strictly NO Revenue) */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                Kitchen Operational Overview
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#65705C' }}>
                Order fulfillment health and workload (financial revenue is restricted)
              </div>
            </div>

            {/* Operational Metric Cards (No Revenue) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.76rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Today's Orders</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1F241C', marginTop: '6px' }}>{stats.todayOrders}</div>
                <div style={{ fontSize: '0.75rem', color: '#85926B', marginTop: '4px' }}>All-time total: {stats.totalOrders}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.76rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Active Kitchen Orders</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#E76F51', marginTop: '6px' }}>{stats.pendingOrders}</div>
                <div style={{ fontSize: '0.75rem', color: '#E76F51', marginTop: '4px' }}>Needs prep / dispatch</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <div style={{ fontSize: '0.76rem', color: '#7E8775', fontWeight: 700, textTransform: 'uppercase' }}>Completed Deliveries</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2E7D32', marginTop: '6px' }}>{stats.completedOrders}</div>
                <div style={{ fontSize: '0.75rem', color: '#7E8775', marginTop: '4px' }}>Cancelled: {stats.cancelledOrders}</div>
              </div>
            </div>

            {/* Popular Items & Recent Orders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#1F241C', marginBottom: '16px' }}>
                  Popular Food Items Today
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.popularItems?.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F4F6F1' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2A3324' }}>
                        #{idx + 1} {p.food_name}
                      </span>
                      <span style={{ backgroundColor: '#EBF0E4', color: '#475234', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {p.total_sold} sold
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#1F241C', marginBottom: '16px' }}>
                  Recent Orders Flow
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.recentOrders?.slice(0, 5).map((ro) => (
                    <div key={ro.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F241C' }}>#{ro.order_number}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7E8775' }}>{ro.customer_name}</div>
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

        {/* 3. FOOD AVAILABILITY TAB */}
        {activeTab === 'foods' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.3rem, 4.2vw, 1.8rem)', fontWeight: 700, color: '#1F241C', wordBreak: 'break-word', lineHeight: 1.25 }}>
                Kitchen Food Item Availability
              </h2>
              <div style={{ fontSize: '0.84rem', color: '#65705C' }}>
                Quickly toggle availability if ingredients run out in kitchen
              </div>
            </div>

            <div className="table-responsive" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DE' }}>
              <table style={{ width: '100%', minWidth: '520px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #ECE7DE' }}>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Item</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '14px 18px', color: '#475234', fontWeight: 700, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id} style={{ borderBottom: '1px solid #F2EFE9' }}>
                      <td style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={food.image_url} alt={food.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 700, color: '#1F241C' }}>{food.name}</span>
                      </td>
                      <td style={{ padding: '12px 18px', color: '#65705C' }}>{food.category_name}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: food.is_available ? '#E8F5E9' : '#FFEBEE',
                          color: food.is_available ? '#2E7D32' : '#C62828'
                        }}>
                          {food.is_available ? 'Available' : 'Sold Out'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleAvailability(food.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: food.is_available ? '#FFEBEE' : '#E8F5E9',
                            color: food.is_available ? '#C62828' : '#2E7D32',
                            border: '1px solid currentColor'
                          }}
                        >
                          {food.is_available ? 'Mark Sold Out' : 'Mark Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
