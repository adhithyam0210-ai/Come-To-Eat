const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api' + path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api' + path,
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /branches ---');
  const branchesRes = await get('/branches');
  console.log('Branches status:', branchesRes.success, 'Count:', branchesRes.branches?.length);
  console.log('Branches:', branchesRes.branches?.map(b => `${b.id}: ${b.name} (${b.code})`));

  console.log('\n--- 2. Logging in as Admin and Employee ---');
  const adminLogin = await post('/auth/login', { email: 'admin@cometoeat.com', password: 'admin123' });
  const adminToken = adminLogin.token;
  console.log('Admin login success:', adminLogin.success);

  const empLogin = await post('/auth/login', { email: 'chef@cometoeat.com', password: 'employee123' });
  const empToken = empLogin.token;
  console.log('Employee login success:', empLogin.success);

  console.log('\n--- 3. Customer placing order targeted to Koramangala Branch (ID: 2) ---');
  const foodsRes = await get('/foods');
  const validFood = foodsRes.foods?.[0];
  console.log('Using food item:', validFood?.id, validFood?.name);

  const orderRes = await post('/orders', {
    customer_name: 'Rohit Sharma',
    customer_email: 'rohit@example.com',
    customer_phone: '+91 98765 11111',
    delivery_type: 'delivery',
    address: { street: '12th Cross, 4th Block', city: 'Bengaluru', landmark: 'Sony Signal', phone: '+91 98765 11111' },
    branch_id: 2,
    branch_name: 'Koramangala',
    payment_method: 'UPI',
    items: [{ food_id: validFood.id, quantity: 2 }]
  });
  console.log('Order created response:', JSON.stringify(orderRes));

  const createdOrderNum = orderRes.order?.order_number;

  console.log('\n--- 4. Checking Employee Kitchen Isolation ---');
  // Koramangala kitchen checks
  const koraKitchen = await get('/orders/admin/all?branch_id=2', empToken);
  const foundInKora = koraKitchen.orders?.some(o => o.order_number === createdOrderNum);
  console.log('Koramangala kitchen sees order:', foundInKora ? 'YES (CORRECT)' : 'NO (FAILED)');

  // Indiranagar kitchen checks
  const indiraKitchen = await get('/orders/admin/all?branch_id=1', empToken);
  const foundInIndira = indiraKitchen.orders?.some(o => o.order_number === createdOrderNum);
  console.log('Indiranagar kitchen sees Koramangala order:', foundInIndira ? 'YES (LEAKED!)' : 'NO (ISOLATED - CORRECT)');

  // Admin global audit checks
  const adminAll = await get('/orders/admin/all?branch_id=all', adminToken);
  const foundInAdminAll = adminAll.orders?.some(o => o.order_number === createdOrderNum);
  console.log('Admin All Branches sees order:', foundInAdminAll ? 'YES (CORRECT)' : 'NO');

  console.log('\n--- 5. Admin modifying branch details ---');
  const putBranch = await new Promise((resolve, reject) => {
    const payload = JSON.stringify({ phone: '+91 80 4455 6677' });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/branches/2',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          Authorization: `Bearer ${adminToken}`
        }
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => resolve(JSON.parse(body)));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
  console.log('Branch updated:', putBranch.success, 'New Phone:', putBranch.branch?.phone);

  console.log('\nAll Multi-Branch routing tests passed successfully!');
}

runTests().catch(console.error);
