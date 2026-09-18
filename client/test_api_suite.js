// Node polyfills for testing
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
}

import { api } from './src/utils/api.js';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 COME TO EAT - CLIENT API AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ FAIL: ${name} ->`, e.message);
      failed++;
    }
  }

  // 1. Initial Data Fetching
  await test('GET /categories returns category list', async () => {
    const res = await api.get('/categories');
    if (!res.success || !Array.isArray(res.categories) || res.categories.length === 0) {
      throw new Error('Categories list is invalid');
    }
  });

  await test('GET /foods returns food items', async () => {
    const res = await api.get('/foods');
    if (!res.success || !Array.isArray(res.foods) || res.foods.length === 0) {
      throw new Error('Foods list is invalid');
    }
  });

  await test('GET /hero-slides returns hero slides', async () => {
    const res = await api.get('/hero-slides');
    if (!res.success || !Array.isArray(res.slides) || res.slides.length === 0) {
      throw new Error('Hero slides list is invalid');
    }
  });

  await test('GET /branches returns cafe branches', async () => {
    const res = await api.get('/branches');
    if (!res.success || !Array.isArray(res.branches) || res.branches.length === 0) {
      throw new Error('Branches list is invalid');
    }
  });

  await test('GET /settings returns store settings', async () => {
    const res = await api.get('/settings');
    if (!res.success || !res.settings || !res.settings.timing_text) {
      throw new Error('Settings object is invalid');
    }
  });

  await test('GET /offers returns active promotions', async () => {
    const res = await api.get('/offers');
    if (!res.success || !Array.isArray(res.offers) || res.offers.length === 0) {
      throw new Error('Offers list is invalid');
    }
  });

  // 2. Coupons
  await test('POST /coupons/validate with valid code WELCOME50', async () => {
    const res = await api.post('/coupons/validate', { code: 'WELCOME50', totalAmount: 300 });
    if (!res.success || !res.valid || res.discount <= 0) {
      throw new Error('Coupon validation failed');
    }
  });

  // 3. Authentication
  await test('POST /auth/login with Admin credentials', async () => {
    const res = await api.post('/auth/login', { email: 'admin@cometoeat.com', password: 'admin123' });
    if (!res.success || !res.token || res.user.role !== 'admin') {
      throw new Error('Admin login failed');
    }
  });

  await test('POST /auth/login with Employee credentials', async () => {
    const res = await api.post('/auth/login', { email: 'chef@cometoeat.com', password: 'employee123' });
    if (!res.success || !res.token || res.user.role !== 'employee') {
      throw new Error('Employee login failed');
    }
  });

  await test('POST /auth/register for new customer', async () => {
    const res = await api.post('/auth/register', { name: 'Test Customer', email: 'test@gmail.com', password: 'password123', phone: '9876543210' });
    if (!res.success || !res.user || res.user.email !== 'test@gmail.com') {
      throw new Error('Registration failed');
    }
  });

  // 4. Orders Lifecycle
  let createdOrderId = null;
  await test('POST /orders places a new order', async () => {
    const orderPayload = {
      customer_name: 'Test Customer',
      customer_email: 'test@gmail.com',
      customer_phone: '9876543210',
      delivery_type: 'delivery',
      delivery_address_json: { street: '123 Main St', city: 'Bengaluru' },
      item_total: 249,
      taxes: 12.45,
      delivery_fee: 30,
      discount_amount: 50,
      coupon_code: 'WELCOME50',
      final_amount: 241.45,
      payment_method: 'UPI',
      branch_id: 1,
      items: [
        { id: 1, name: 'Double Smash Gourmet Burger', price: 249, quantity: 1 }
      ]
    };
    const res = await api.post('/orders', orderPayload);
    if (!res.success || !res.order || !res.order.id) {
      throw new Error('Order creation failed');
    }
    createdOrderId = res.order.id;
  });

  await test('GET /orders/:id retrieves created order', async () => {
    const res = await api.get(`/orders/${createdOrderId}`);
    if (!res.success || !res.order) {
      throw new Error('Could not retrieve order details');
    }
  });

  await test('PATCH /orders/:id/status updates kitchen status', async () => {
    const res = await api.patch(`/orders/${createdOrderId}/status`, { status: 'Preparing' });
    if (!res.success || res.order.order_status !== 'Preparing') {
      throw new Error('Could not update order status');
    }
  });

  await test('GET /orders/admin/all returns list of orders', async () => {
    const res = await api.get('/orders/admin/all');
    if (!res.success || !Array.isArray(res.orders)) {
      throw new Error('Could not retrieve all orders for admin');
    }
  });

  // 5. Admin Portal
  await test('GET /admin/dashboard returns operational stats', async () => {
    const res = await api.get('/admin/dashboard');
    if (!res.success || !res.stats || typeof res.stats.totalRevenue !== 'number') {
      throw new Error('Dashboard stats failed');
    }
  });

  await test('GET /admin/customers returns customer list', async () => {
    const res = await api.get('/admin/customers');
    if (!res.success || !Array.isArray(res.customers)) {
      throw new Error('Customers listing failed');
    }
  });

  await test('GET /admin/employees returns employee list', async () => {
    const res = await api.get('/admin/employees');
    if (!res.success || !Array.isArray(res.employees)) {
      throw new Error('Employees listing failed');
    }
  });

  // 6. Food Availability Toggle (Employee Portal)
  await test('PATCH /foods/:id/availability toggles food stock', async () => {
    const res = await api.patch('/foods/1/availability');
    if (!res.success) {
      throw new Error('Food availability toggle failed');
    }
  });

  // 7. Reviews
  await test('POST /reviews adds a customer review', async () => {
    const res = await api.post('/reviews', { user_name: 'Test Customer', rating: 5, comment: 'Amazing burgers and boba!' });
    if (!res.success || !res.review) {
      throw new Error('Review creation failed');
    }
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
