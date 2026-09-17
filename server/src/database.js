const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/cometoeat.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.run('PRAGMA foreign_keys = ON;');
  }
});

// Promise wrappers for async/await
const query = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

async function initSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      is_blocked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      price REAL NOT NULL,
      discount_price REAL,
      is_veg INTEGER DEFAULT 1,
      is_available INTEGER DEFAULT 1,
      prep_time TEXT DEFAULT '15-20 min',
      is_featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.5,
      rating_count INTEGER DEFAULT 12,
      image_url TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS food_addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_required INTEGER DEFAULT 0,
      FOREIGN KEY (food_id) REFERENCES food_items (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT DEFAULT 'Home',
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      landmark TEXT,
      phone TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_type TEXT DEFAULT 'delivery',
      delivery_address_json TEXT,
      item_total REAL NOT NULL,
      taxes REAL NOT NULL,
      delivery_fee REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      coupon_code TEXT,
      final_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'Order Placed',
      cancellation_reason TEXT,
      estimated_delivery_minutes INTEGER DEFAULT 35,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      food_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      selected_addons_json TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (food_id) REFERENCES food_items (id)
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'successful',
      gateway_response_json TEXT,
      refund_status TEXT DEFAULT 'none',
      refund_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS delivery_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      provider TEXT DEFAULT 'ComeToEat Express',
      driver_name TEXT,
      driver_phone TEXT,
      tracking_code TEXT UNIQUE,
      pickup_address TEXT,
      drop_address TEXT,
      current_lat REAL,
      current_lng REAL,
      status TEXT DEFAULT 'assigned',
      eta_minutes INTEGER DEFAULT 25,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount REAL DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating REAL NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (food_id) REFERENCES food_items (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      is_admin INTEGER DEFAULT 0,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      order_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      script TEXT NOT NULL,
      title TEXT NOT NULL,
      desc TEXT NOT NULL,
      image_url TEXT NOT NULL,
      button_text TEXT DEFAULT 'Order Now',
      bg_color TEXT DEFAULT '#949E7C',
      accent_text TEXT,
      target_category TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS restaurant_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_food_category ON food_items (category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);
  `;

  await query.exec(schema);

  // Safe migrations for coupons table
  try {
    await query.exec(`ALTER TABLE coupons ADD COLUMN start_date TEXT`);
  } catch (e) {
    // Column may already exist
  }
  try {
    await query.exec(`ALTER TABLE coupons ADD COLUMN end_date TEXT`);
  } catch (e) {
    // Column may already exist
  }

  // Safe migrations for orders table (branch columns)
  try {
    await query.exec(`ALTER TABLE orders ADD COLUMN branch_id INTEGER DEFAULT 1`);
  } catch (e) {
    // Column may already exist
  }
  try {
    await query.exec(`ALTER TABLE orders ADD COLUMN branch_name TEXT DEFAULT 'Indiranagar (Flagship)'`);
  } catch (e) {
    // Column may already exist
  }

  // Safe migrations for admins table (employee branch assignment and two-way transfer verification)
  try {
    await query.exec(`ALTER TABLE admins ADD COLUMN branch_id INTEGER DEFAULT 1`);
  } catch (e) {}
  try {
    await query.exec(`ALTER TABLE admins ADD COLUMN pending_branch_id INTEGER`);
  } catch (e) {}
  try {
    await query.exec(`ALTER TABLE admins ADD COLUMN transfer_status TEXT DEFAULT 'none'`);
  } catch (e) {}
  try {
    await query.exec(`UPDATE admins SET branch_id = 1 WHERE role = 'employee' AND (branch_id IS NULL OR branch_id = 0)`);
  } catch (e) {}

  // Seed default branches
  const defaultBranches = [
    { id: 1, name: 'Indiranagar (Flagship)', code: 'INDIRA', address: '100 Feet Rd, Indiranagar, Bengaluru, 560038', phone: '+91 98765 43210' },
    { id: 2, name: 'Koramangala', code: 'KORA', address: '80 Feet Rd, 5th Block, Koramangala, Bengaluru, 560095', phone: '+91 98765 43211' },
    { id: 3, name: 'HSR Layout', code: 'HSR', address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru, 560102', phone: '+91 98765 43212' },
    { id: 4, name: 'Whitefield', code: 'WHITE', address: 'ITPB Main Road, Whitefield, Bengaluru, 560066', phone: '+91 98765 43213' }
  ];

  for (const b of defaultBranches) {
    await query.run(
      `INSERT OR IGNORE INTO branches (id, name, code, address, phone, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [b.id, b.name, b.code, b.address, b.phone]
    );
  }

  // Seed default restaurant settings if not set
  const defaultSettings = [
    { key: 'timing_text', value: 'Open Daily: 10:00 AM – 11:30 PM' },
    { key: 'days_open', value: 'Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)' },
    { key: 'delivery_text', value: 'Express 30 Min Delivery' },
    { key: 'contact_address', value: '100 Feet Rd, Indiranagar, Bengaluru, 560038' },
    { key: 'contact_phone', value: '+91 98765 43210' },
    { key: 'contact_email', value: 'hello@cometoeat.com' }
  ];

  for (const s of defaultSettings) {
    await query.run(
      `INSERT OR IGNORE INTO restaurant_settings (setting_key, setting_value) VALUES (?, ?)`,
      [s.key, s.value]
    );
  }

  console.log('Database tables, branches, settings & indices initialized successfully.');
}

module.exports = {
  db,
  query,
  initSchema
};
