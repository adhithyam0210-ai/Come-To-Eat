const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

if (!process.env.DATABASE_URL) {
  console.error('\n=============================================');
  console.error('ERROR: DATABASE_URL is not set in server/.env');
  console.error('Please add your Supabase PostgreSQL connection string to server/.env');
  console.error('Example: DATABASE_URL=postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres');
  console.error('=============================================\n');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});

// Helper to convert SQLite `?` parameters to PostgreSQL `$1, $2`
function convertSql(sql) {
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
}

const query = {
  async all(sql, params = []) {
    const pgSql = convertSql(sql);
    const { rows } = await pool.query(pgSql, params);
    return rows;
  },
  async get(sql, params = []) {
    const pgSql = convertSql(sql);
    const { rows } = await pool.query(pgSql, params);
    return rows.length ? rows[0] : null;
  },
  async run(sql, params = []) {
    let pgSql = convertSql(sql);
    
    // Polyfill for SQLite's lastID on INSERT
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql = pgSql.trim();
      // Remove trailing semicolon if any before appending RETURNING
      if (pgSql.endsWith(';')) pgSql = pgSql.slice(0, -1);
      pgSql += ' RETURNING id';
    }

    const { rows, rowCount } = await pool.query(pgSql, params);
    let lastID = null;
    if (isInsert && rows && rows.length > 0 && rows[0].id) {
      lastID = rows[0].id;
    }
    return { lastID, changes: rowCount };
  },
  async exec(sql) {
    // For exec, we split multiple statements if needed, though pg handles simple multiple statements natively
    await pool.query(sql);
  }
};

async function initSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user',
      is_blocked INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      branch_id INTEGER DEFAULT 1,
      pending_branch_id INTEGER,
      transfer_status TEXT DEFAULT 'none',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      price DECIMAL NOT NULL,
      discount_price DECIMAL,
      is_veg INTEGER DEFAULT 1,
      is_available INTEGER DEFAULT 1,
      prep_time TEXT DEFAULT '15-20 min',
      is_featured INTEGER DEFAULT 0,
      rating DECIMAL DEFAULT 4.5,
      rating_count INTEGER DEFAULT 12,
      image_url TEXT,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_addons (
      id SERIAL PRIMARY KEY,
      food_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price DECIMAL NOT NULL,
      is_required INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT DEFAULT 'Home',
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      landmark TEXT,
      phone TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_type TEXT DEFAULT 'delivery',
      delivery_address_json TEXT,
      item_total DECIMAL NOT NULL,
      taxes DECIMAL NOT NULL,
      delivery_fee DECIMAL DEFAULT 0,
      discount_amount DECIMAL DEFAULT 0,
      coupon_code TEXT,
      final_amount DECIMAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'Order Placed',
      cancellation_reason TEXT,
      estimated_delivery_minutes INTEGER DEFAULT 35,
      branch_id INTEGER DEFAULT 1,
      branch_name TEXT DEFAULT 'Indiranagar (Flagship)',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      food_id INTEGER NOT NULL REFERENCES food_items(id),
      food_name TEXT NOT NULL,
      unit_price DECIMAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal DECIMAL NOT NULL,
      selected_addons_json TEXT
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount DECIMAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'successful',
      gateway_response_json TEXT,
      refund_status TEXT DEFAULT 'none',
      refund_amount DECIMAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_orders (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      provider TEXT DEFAULT 'ComeToEat Express',
      driver_name TEXT,
      driver_phone TEXT,
      tracking_code TEXT UNIQUE,
      pickup_address TEXT,
      drop_address TEXT,
      current_lat DECIMAL,
      current_lng DECIMAL,
      status TEXT DEFAULT 'assigned',
      eta_minutes INTEGER DEFAULT 25,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value DECIMAL NOT NULL,
      min_order_value DECIMAL DEFAULT 0,
      max_discount DECIMAL DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      start_date TEXT,
      end_date TEXT,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      food_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      user_name TEXT NOT NULL,
      rating DECIMAL NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      is_admin INTEGER DEFAULT 0,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      order_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS restaurant_settings (
      id SERIAL PRIMARY KEY,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_food_category ON food_items (category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);
  `;

  try {
    if (process.env.DATABASE_URL) {
      await query.exec(schema);

      // Seed default branches
      const defaultBranches = [
        { id: 1, name: 'Indiranagar (Flagship)', code: 'INDIRA', address: '100 Feet Rd, Indiranagar, Bengaluru, 560038', phone: '+91 98765 43210' },
        { id: 2, name: 'Koramangala', code: 'KORA', address: '80 Feet Rd, 5th Block, Koramangala, Bengaluru, 560095', phone: '+91 98765 43211' },
        { id: 3, name: 'HSR Layout', code: 'HSR', address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru, 560102', phone: '+91 98765 43212' },
        { id: 4, name: 'Whitefield', code: 'WHITE', address: 'ITPB Main Road, Whitefield, Bengaluru, 560066', phone: '+91 98765 43213' }
      ];

      for (const b of defaultBranches) {
        await query.run(
          \`INSERT INTO branches (id, name, code, address, phone, is_active) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT (id) DO NOTHING\`,
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
          \`INSERT INTO restaurant_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT (setting_key) DO NOTHING\`,
          [s.key, s.value]
        );
      }
      
      console.log('Database tables, branches, settings & indices initialized successfully on PostgreSQL.');
    } else {
      console.log('Skipping schema init - no DATABASE_URL');
    }
  } catch (err) {
    console.error('Failed to init schema:', err);
  }
}

module.exports = {
  db: pool,
  query,
  initSchema
};
