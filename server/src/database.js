const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const isPg = Boolean(process.env.DATABASE_URL);

let pool = null;
let sqliteDb = null;
const dbPath = ':memory:';

if (isPg) {
  console.log('[Database] Connecting to Supabase PostgreSQL database via DATABASE_URL...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL] Unexpected error on idle pg client:', err);
  });
} else {
  console.log('[Database] Connecting with Supabase backend engine (SQLite in-memory fallback active).');
  openSqlite();
}

function openSqlite() {
  sqliteDb = new sqlite3.Database(':memory:', (err) => {
    if (err) console.error('[SQLite] Error opening database:', err);
  });
}

async function repairSqlite() {
  if (sqliteDb) {
    try { sqliteDb.close(); } catch (e) {}
  }
  openSqlite();
  await initSchema();
}

// Helper to convert SQLite `?` parameters to PostgreSQL `$1, $2`
function convertSql(sql) {
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
}

const query = {
  async all(sql, params = []) {
    if (isPg) {
      const pgSql = convertSql(sql);
      const { rows } = await pool.query(pgSql, params);
      return rows;
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, async (err, rows) => {
          if (err) {
            if (err.code === 'SQLITE_CORRUPT') {
              await repairSqlite();
              try {
                const retryRows = await query.all(sql, params);
                return resolve(retryRows);
              } catch (retryErr) {
                return reject(retryErr);
              }
            }
            return reject(err);
          }
          resolve(rows || []);
        });
      });
    }
  },

  async get(sql, params = []) {
    if (isPg) {
      const pgSql = convertSql(sql);
      const { rows } = await pool.query(pgSql, params);
      return rows.length ? rows[0] : null;
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, async (err, row) => {
          if (err) {
            if (err.code === 'SQLITE_CORRUPT') {
              await repairSqlite();
              try {
                const retryRow = await query.get(sql, params);
                return resolve(retryRow);
              } catch (retryErr) {
                return reject(retryErr);
              }
            }
            return reject(err);
          }
          resolve(row || null);
        });
      });
    }
  },

  async run(sql, params = []) {
    if (isPg) {
      let pgSql = convertSql(sql);
      const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
      if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql = pgSql.trim();
        if (pgSql.endsWith(';')) pgSql = pgSql.slice(0, -1);
        pgSql += ' RETURNING id';
      }

      const { rows, rowCount } = await pool.query(pgSql, params);
      let lastID = null;
      if (isInsert && rows && rows.length > 0 && rows[0].id) {
        lastID = rows[0].id;
      }
      return { lastID, changes: rowCount };
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, async function (err) {
          if (err) {
            if (err.code === 'SQLITE_CORRUPT') {
              await repairSqlite();
              try {
                const res = await query.run(sql, params);
                return resolve(res);
              } catch (retryErr) {
                return reject(retryErr);
              }
            }
            return reject(err);
          }
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  },

  async exec(sql) {
    if (isPg) {
      await pool.query(sql);
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.exec(sql, async (err) => {
          if (err) {
            if (err.code === 'SQLITE_CORRUPT') {
              await repairSqlite();
              try {
                await query.exec(sql);
                return resolve();
              } catch (retryErr) {
                return reject(retryErr);
              }
            }
            return reject(err);
          }
          resolve();
        });
      });
    }
  }
};

async function initSchema() {
  const schema = isPg ? `
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
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      current_status TEXT DEFAULT 'assigned',
      live_lat DECIMAL,
      live_lng DECIMAL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value DECIMAL NOT NULL,
      min_order_value DECIMAL DEFAULT 0,
      max_discount DECIMAL,
      start_date DATE,
      end_date DATE,
      expires_at TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      times_used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offer_banners (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'PROMO',
      description TEXT,
      image_url TEXT,
      button_text TEXT DEFAULT 'Explore Menu',
      target_category TEXT,
      bg_color TEXT DEFAULT '#85926B',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      branch_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      tag TEXT NOT NULL,
      script TEXT NOT NULL,
      title TEXT NOT NULL,
      desc_text TEXT NOT NULL,
      image_url TEXT,
      button_text TEXT DEFAULT 'Order Now',
      bg_color TEXT DEFAULT '#85926B',
      accent_text TEXT,
      target_category TEXT DEFAULT 'Burgers and Sandwiches',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      food_id INTEGER REFERENCES food_items(id),
      is_approved INTEGER DEFAULT 1,
      branch_id INTEGER,
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
  ` : `
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
      branch_id INTEGER DEFAULT 1,
      pending_branch_id INTEGER,
      transfer_status TEXT DEFAULT 'none',
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
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_required INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT DEFAULT 'Home',
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      landmark TEXT,
      phone TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
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
      branch_id INTEGER DEFAULT 1,
      branch_name TEXT DEFAULT 'Indiranagar (Flagship)',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      food_id INTEGER NOT NULL REFERENCES food_items(id),
      food_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      selected_addons_json TEXT
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'successful',
      gateway_response_json TEXT,
      refund_status TEXT DEFAULT 'none',
      refund_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      current_status TEXT DEFAULT 'assigned',
      live_lat REAL,
      live_lng REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount REAL,
      start_date DATE,
      end_date DATE,
      expires_at DATETIME,
      is_active INTEGER DEFAULT 1,
      times_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offer_banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'PROMO',
      description TEXT,
      image_url TEXT,
      button_text TEXT DEFAULT 'Explore Menu',
      target_category TEXT,
      bg_color TEXT DEFAULT '#85926B',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      branch_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      script TEXT NOT NULL,
      title TEXT NOT NULL,
      desc_text TEXT NOT NULL,
      image_url TEXT,
      button_text TEXT DEFAULT 'Order Now',
      bg_color TEXT DEFAULT '#85926B',
      accent_text TEXT,
      target_category TEXT DEFAULT 'Burgers and Sandwiches',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      food_id INTEGER REFERENCES food_items(id),
      is_approved INTEGER DEFAULT 1,
      branch_id INTEGER,
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
  `;

  try {
    await query.exec(schema);

    // Auto-migration for offer_banners sort_order column
    try {
      if (isPg) {
        await query.exec('ALTER TABLE offer_banners ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0');
      } else {
        await query.exec('ALTER TABLE offer_banners ADD COLUMN sort_order INTEGER DEFAULT 0');
      }
    } catch (e) {}

    // Seed default branches
    const defaultBranches = [
      { id: 1, name: 'Indiranagar (Flagship)', code: 'INDIRA', address: '100 Feet Rd, Indiranagar, Bengaluru, 560038', phone: '+91 98765 43210' },
      { id: 2, name: 'Koramangala', code: 'KORA', address: '80 Feet Rd, 5th Block, Koramangala, Bengaluru, 560095', phone: '+91 98765 43211' },
      { id: 3, name: 'HSR Layout', code: 'HSR', address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru, 560102', phone: '+91 98765 43212' },
      { id: 4, name: 'Whitefield', code: 'WHITE', address: 'ITPB Main Road, Whitefield, Bengaluru, 560066', phone: '+91 98765 43213' }
    ];

    for (const b of defaultBranches) {
      if (isPg) {
        await query.run(
          'INSERT INTO branches (id, name, code, address, phone, is_active) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT (id) DO NOTHING',
          [b.id, b.name, b.code, b.address, b.phone]
        );
      } else {
        await query.run(
          'INSERT OR IGNORE INTO branches (id, name, code, address, phone, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [b.id, b.name, b.code, b.address, b.phone]
        );
      }
    }

    // Seed default restaurant settings
    const defaultSettings = [
      { key: 'timing_text', value: 'Open Daily: 10:00 AM – 11:30 PM' },
      { key: 'days_open', value: 'Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)' },
      { key: 'delivery_text', value: 'Express 30 Min Delivery' },
      { key: 'contact_address', value: '100 Feet Rd, Indiranagar, Bengaluru, 560038' },
      { key: 'contact_phone', value: '+91 98765 43210' },
      { key: 'contact_email', value: 'hello@cometoeat.com' }
    ];

    for (const s of defaultSettings) {
      if (isPg) {
        await query.run(
          'INSERT INTO restaurant_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT (setting_key) DO NOTHING',
          [s.key, s.value]
        );
      } else {
        await query.run(
          'INSERT OR IGNORE INTO restaurant_settings (setting_key, setting_value) VALUES (?, ?)',
          [s.key, s.value]
        );
      }
    }

    // Seed initial admin user if no users exist
    const adminCheck = await query.get('SELECT id FROM admins WHERE email = ?', ['admin@cometoeat.com']);
    if (!adminCheck) {
      const bcrypt = require('bcryptjs');
      const hashedPass = await bcrypt.hash('admin123', 10);
      await query.run(
        'INSERT INTO admins (name, email, password, role, branch_id) VALUES (?, ?, ?, ?, 1)',
        ['Executive Admin', 'admin@cometoeat.com', hashedPass, 'admin']
      );
    }
    
    // Seed Categories
    const defaultCategories = [
      { id: 1, name: 'Burgers and Sandwiches', slug: 'burgers-and-sandwiches', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', description: 'Flame-grilled smash burgers, gourmet subs, and toasted panini', sort_order: 1 },
      { id: 2, name: 'Momos', slug: 'momos', image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', description: 'Steamed, fried, and pan-seared Darjeeling momos', sort_order: 2 },
      { id: 3, name: 'Maggi', slug: 'maggi', image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80', description: 'Classic, cheesy, and spicy loaded cafe-style Maggi', sort_order: 3 },
      { id: 4, name: 'Snacks', slug: 'snacks', image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80', description: 'Crispy french fries, nuggets, garlic bread, and finger bites', sort_order: 4 },
      { id: 5, name: 'Cold Beverages', slug: 'cold-beverages', image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', description: 'Chilled iced coffees, cold brews, and fruit coolers', sort_order: 5 },
      { id: 6, name: 'Mojito', slug: 'mojito', image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', description: 'Refreshing muddled mint & lime mocktails', sort_order: 6 },
      { id: 7, name: 'Pizzas', slug: 'pizzas', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', description: 'Wood-fired hand-tossed Neapolitan pizzas', sort_order: 7 },
      { id: 8, name: 'Boba Tea', slug: 'boba-tea', image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=800&q=80', description: 'Authentic Taiwanese boba & bubble milk teas', sort_order: 8 },
      { id: 9, name: 'Pasta', slug: 'pasta', image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', description: 'Italian creamy Alfredo, Arrabbiata, and Pink sauce pastas', sort_order: 9 }
    ];

    for (const c of defaultCategories) {
      if (isPg) {
        await query.run(
          'INSERT INTO categories (id, name, slug, image_url, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT (id) DO NOTHING',
          [c.id, c.name, c.slug, c.image_url, c.description, c.sort_order]
        );
      } else {
        await query.run(
          'INSERT OR IGNORE INTO categories (id, name, slug, image_url, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
          [c.id, c.name, c.slug, c.image_url, c.description, c.sort_order]
        );
      }
    }

    // Seed Food Items
    const defaultFoods = [
      { id: 1, name: 'Double Smash Gourmet Burger', slug: 'double-smash-burger', description: 'Double crisp-edged smash patties, molten cheddar, caramelized butter onions, and house secret sauce on brioche.', category_id: 1, price: 249, discount_price: 219, is_veg: 0, is_featured: 1, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
      { id: 2, name: 'Truffle Mushroom Swiss Burger', slug: 'truffle-mushroom-burger', description: 'Sauteed wild mushrooms, swiss cheese melt, and white truffle aioli on toasted sesame bun.', category_id: 1, price: 269, discount_price: 239, is_veg: 1, is_featured: 1, rating: 4.7, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
      { id: 3, name: 'Brown Sugar Tiger Boba Milk', slug: 'brown-sugar-tiger-boba', description: 'Slow-simmered dark caramel streaks, organic fresh dairy, and warm chewy tapioca pearls.', category_id: 2, price: 219, discount_price: 199, is_veg: 1, is_featured: 1, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=800&q=80' },
      { id: 4, name: 'Matcha Green Tea Cheese Foam', slug: 'matcha-cheese-foam', description: 'Ceremonial Uji matcha tea blended with fresh milk and topped with sea salt cheese foam.', category_id: 2, price: 239, discount_price: 209, is_veg: 1, is_featured: 0, rating: 4.6, image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80' },
      { id: 5, name: 'Steamed Darjeeling Chicken Momos', slug: 'steamed-chicken-momos', description: 'Hand-folded juicy minced chicken momos served with fiery red chili sesame chutney.', category_id: 3, price: 189, discount_price: 169, is_veg: 0, is_featured: 1, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
      { id: 6, name: 'Pan-Fried Schezwan Paneer Momos', slug: 'pan-fried-paneer-momos', description: 'Crispy pan-seared cottage cheese momos tossed in spicy house schezwan sauce.', category_id: 3, price: 179, discount_price: 159, is_veg: 1, is_featured: 0, rating: 4.7, image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
      { id: 7, name: 'Neapolitan Margherita Pizza', slug: 'neapolitan-margherita', description: 'San Marzano tomato sauce, fresh buffalo mozzarella, virgin olive oil, and sweet basil leaves.', category_id: 4, price: 349, discount_price: 319, is_veg: 1, is_featured: 1, rating: 4.8, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
      { id: 8, name: 'Belgian Choco Molten Lava Cake', slug: 'belgian-choco-lava', description: 'Warm dark Belgian chocolate cake with a gooey oozing molten chocolate core.', category_id: 5, price: 179, discount_price: 149, is_veg: 1, is_featured: 1, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80' }
    ];

    for (const f of defaultFoods) {
      if (isPg) {
        await query.run(
          'INSERT INTO food_items (id, name, slug, description, category_id, price, discount_price, is_veg, is_featured, rating, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT (id) DO NOTHING',
          [f.id, f.name, f.slug, f.description, f.category_id, f.price, f.discount_price, f.is_veg, f.is_featured, f.rating, f.image_url]
        );
      } else {
        await query.run(
          'INSERT OR IGNORE INTO food_items (id, name, slug, description, category_id, price, discount_price, is_veg, is_featured, rating, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [f.id, f.name, f.slug, f.description, f.category_id, f.price, f.discount_price, f.is_veg, f.is_featured, f.rating, f.image_url]
        );
      }
    }

    // Seed Hero Slides
    const defaultHeroSlides = [
      {
        id: 1,
        tag: 'ORGANIC BLEND',
        script: 'Healthy Smoothie',
        title: 'Good Food. Good Mood. Come To Eat.',
        desc_text: 'Crafted with ripe hand-picked fruits, Greek yogurt, and pure mountain honey. Fuel your day with vibrant goodness.',
        image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
        button_text: 'Explore Menu',
        bg_color: '#949E7C',
        target_category: 'Boba Tea & Drinks',
        sort_order: 1
      },
      {
        id: 2,
        tag: 'CHEF SIGNATURE',
        script: 'Gourmet Burgers',
        title: 'Flame-Grilled Juicy Smash Burgers',
        desc_text: 'Double crisp-edged patties, molten aged cheddar, caramelized butter onions, and house secret sauce on warm brioche.',
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
        button_text: 'Explore Burgers',
        bg_color: '#8B9474',
        target_category: 'Burgers and Sandwiches',
        sort_order: 2
      },
      {
        id: 3,
        tag: 'TAIWANESE AUTHENTIC',
        script: 'Tiger Milk Boba',
        title: 'Brown Sugar Tapioca Bubble Tea',
        desc_text: 'Slow-simmered dark caramel streaks, organic fresh dairy, and warm chewy tapioca pearls brewed fresh daily.',
        image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=900&q=80',
        button_text: 'Taste Boba',
        bg_color: '#969F82',
        target_category: 'Boba Tea & Drinks',
        sort_order: 3
      }
    ];

    for (const h of defaultHeroSlides) {
      if (isPg) {
        await query.run(
          'INSERT INTO hero_slides (id, tag, script, title, desc_text, image_url, button_text, bg_color, target_category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT (id) DO NOTHING',
          [h.id, h.tag, h.script, h.title, h.desc_text, h.image_url, h.button_text, h.bg_color, h.target_category, h.sort_order]
        );
      } else {
        await query.run(
          'INSERT OR IGNORE INTO hero_slides (id, tag, script, title, desc_text, image_url, button_text, bg_color, target_category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [h.id, h.tag, h.script, h.title, h.desc_text, h.image_url, h.button_text, h.bg_color, h.target_category, h.sort_order]
        );
      }
    }

    // Seed Offer Banners
    const defaultOffers = [
      {
        id: 1,
        title: 'Flat 50% OFF First Order',
        tag: 'WELCOME SPECIAL',
        description: 'Unlock 50% discount on gourmet smash burgers, momos, and fresh coolers prepared live.',
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        button_text: 'Order Burgers Now',
        target_category: 'Burgers and Sandwiches',
        bg_color: '#85926B'
      },
      {
        id: 2,
        title: 'Free Boba Topping & Drink Upgrade',
        tag: 'BOBA FESTIVAL',
        description: 'Buy any signature Brown Sugar Tiger Boba and receive a complimentary cheese foam top layer.',
        image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=800&q=80',
        button_text: 'Explore Boba Drinks',
        target_category: 'Boba Tea & Drinks',
        bg_color: '#969F82'
      },
      {
        id: 3,
        title: 'Darjeeling Momo Platter Combo',
        tag: 'SNACKING BUNDLE',
        description: 'Order 2 Momo plates & get 1 fresh Lime Mojito completely free with rapid table delivery.',
        image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        button_text: 'View Momo Combos',
        target_category: 'Momos & Dumplings',
        bg_color: '#8B9474'
      }
    ];

    for (const o of defaultOffers) {
      if (isPg) {
        await query.run(
          'INSERT INTO offer_banners (id, title, tag, description, image_url, button_text, target_category, bg_color, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT (id) DO NOTHING',
          [o.id, o.title, o.tag, o.description, o.image_url, o.button_text, o.target_category, o.bg_color]
        );
      } else {
        await query.run(
          'INSERT OR IGNORE INTO offer_banners (id, title, tag, description, image_url, button_text, target_category, bg_color, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [o.id, o.title, o.tag, o.description, o.image_url, o.button_text, o.target_category, o.bg_color]
        );
      }
    }
    
    console.log(`[Database] Tables & rich seed data initialized successfully on ${isPg ? 'Supabase PostgreSQL' : 'SQLite'}.`);
  } catch (err) {
    console.error('[Database] Failed to init schema:', err);
  }
}

module.exports = {
  db: isPg ? pool : sqliteDb,
  query,
  initSchema
};
