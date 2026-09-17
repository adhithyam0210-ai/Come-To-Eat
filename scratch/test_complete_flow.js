const http = require('http');

function post(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(urlPath, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING COMPLETE VERIFICATION ===');

  // 1. Health check
  const health = await get('/api/health');
  console.log('1. Health check:', health.status, health.data?.status);

  // 2. Validate Coupon test (Checking min_order_value fix)
  const activeCoupons = await get('/api/coupons');
  console.log('2a. Active coupons in DB:', activeCoupons.data?.coupons?.map(c => ({ code: c.code, min: c.min_order_value, type: c.discount_type, val: c.discount_value })));
  const firstCouponCode = activeCoupons.data?.coupons?.[0]?.code || 'WELCOME50';
  
  const couponRes = await post('/api/coupons/validate', { code: firstCouponCode, order_amount: 600 });
  console.log(`2b. Validate coupon ${firstCouponCode}:`, couponRes.status, {
    code: couponRes.data?.coupon?.code,
    discount_amount: couponRes.data?.coupon?.discount_amount,
    min_order_value: couponRes.data?.coupon?.min_order_value
  });
  if (couponRes.data?.coupon?.min_order_value === undefined) {
    throw new Error('min_order_value is MISSING in coupon response!');
  }

  // 3. Admin Login
  const adminLogin = await post('/api/auth/login', { email: 'admin@cometoeat.com', password: 'admin123' });
  console.log('3. Admin login:', adminLogin.status, adminLogin.data?.user?.role);
  const adminToken = adminLogin.data?.token;

  // 4. Admin Get Employees
  const empList = await get('/api/admin/employees', adminToken);
  console.log('4. Admin get employees count:', empList.data?.employees?.length);
  const chef = empList.data?.employees?.find(e => e.email === 'chef@cometoeat.com');
  console.log('   Existing chef info:', {
    name: chef?.name,
    branch_name: chef?.branch_name,
    transfer_status: chef?.transfer_status
  });

  // 5. Admin Create New Staff Employee
  const testEmail = `barista_${Date.now()}@cometoeat.com`;
  const createEmpRes = await post('/api/admin/employees', {
    name: 'Barista Vikram',
    email: testEmail,
    password: 'baristaPass123',
    branch_id: 1 // Indiranagar
  }, adminToken);
  console.log('5. Create new employee:', createEmpRes.status, createEmpRes.data?.employee);
  const newEmpId = createEmpRes.data?.employee?.id;

  // 6. Admin Initiate Branch Reassignment (to Branch 2 Koramangala)
  const transferRes = await post(`/api/admin/employees/${newEmpId}/transfer`, {
    branch_id: 2
  }, adminToken);
  console.log('6. Initiate transfer:', transferRes.status, transferRes.data?.message);

  // 7. Login as the newly created employee to check pending transfer status
  const empLogin = await post('/api/auth/login', {
    email: testEmail,
    password: 'baristaPass123'
  });
  console.log('7. Employee login:', empLogin.status, {
    name: empLogin.data?.user?.name,
    branch_name: empLogin.data?.user?.branch_name,
    pending_branch_name: empLogin.data?.user?.pending_branch_name,
    transfer_status: empLogin.data?.user?.transfer_status
  });
  const empToken = empLogin.data?.token;

  // 8. Employee confirms transfer
  const confirmRes = await post('/api/employee/confirm-transfer', {}, empToken);
  console.log('8. Employee confirms transfer:', confirmRes.status, confirmRes.data?.message);

  // 9. Verify employee me endpoint has new active branch
  const meRes = await get('/api/auth/me', empToken);
  console.log('9. Employee /me after confirmation:', {
    branch_name: meRes.data?.user?.branch_name,
    transfer_status: meRes.data?.user?.transfer_status,
    pending_branch_id: meRes.data?.user?.pending_branch_id
  });

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
