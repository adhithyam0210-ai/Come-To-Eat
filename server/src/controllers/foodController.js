const { query } = require('../database');

class FoodController {
  // =================== CATEGORIES ===================
  static async getCategories(req, res) {
    try {
      const categories = await query.all(
        `SELECT c.*, COUNT(f.id) as item_count 
         FROM categories c 
         LEFT JOIN food_items f ON c.id = f.category_id AND f.is_available = 1
         WHERE c.is_active = 1
         GROUP BY c.id
         ORDER BY c.sort_order ASC, c.name ASC`
      );
      res.json({ success: true, categories });
    } catch (err) {
      console.error('getCategories error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
  }

  static async getAllCategoriesAdmin(req, res) {
    try {
      const categories = await query.all(
        `SELECT c.*, COUNT(f.id) as item_count 
         FROM categories c 
         LEFT JOIN food_items f ON c.id = f.category_id
         GROUP BY c.id
         ORDER BY c.sort_order ASC, c.id ASC`
      );
      res.json({ success: true, categories });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
  }

  static async createCategory(req, res) {
    try {
      const { name, description, image_url, sort_order } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const result = await query.run(
        `INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)`,
        [
          name.trim(),
          slug,
          description || '',
          image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          sort_order || 0
        ]
      );

      const newCat = await query.get(`SELECT * FROM categories WHERE id = ?`, [result.lastID]);
      res.status(201).json({ success: true, category: newCat });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create category. Name must be unique.' });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, image_url, sort_order, is_active } = req.body;

      const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

      await query.run(
        `UPDATE categories 
         SET name = COALESCE(?, name),
             slug = COALESCE(?, slug),
             description = COALESCE(?, description),
             image_url = COALESCE(?, image_url),
             sort_order = COALESCE(?, sort_order),
             is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [name ? name.trim() : null, slug, description, image_url, sort_order, is_active, id]
      );

      const updated = await query.get(`SELECT * FROM categories WHERE id = ?`, [id]);
      res.json({ success: true, category: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await query.run(`DELETE FROM categories WHERE id = ?`, [id]);
      res.json({ success: true, message: 'Category deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete category.' });
    }
  }

  // =================== FOOD ITEMS ===================
  static async getFoods(req, res) {
    try {
      const { category, search, veg, max_price, featured, available_only } = req.query;

      let sql = `
        SELECT f.*, c.name as category_name, c.slug as category_slug
        FROM food_items f
        JOIN categories c ON f.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      // For public menu by default or when available_only is true
      if (available_only === 'true') {
        sql += ` AND f.is_available = 1 AND c.is_active = 1`;
      }

      if (category && category !== 'all') {
        if (isNaN(category)) {
          sql += ` AND (c.slug = ? OR LOWER(c.name) = LOWER(?))`;
          params.push(category, category);
        } else {
          sql += ` AND f.category_id = ?`;
          params.push(category);
        }
      }

      if (search) {
        sql += ` AND (f.name LIKE ? OR f.description LIKE ? OR f.tags LIKE ?)`;
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      if (veg !== undefined && veg !== '' && veg !== 'all') {
        sql += ` AND f.is_veg = ?`;
        params.push(veg === '1' || veg === 'true' ? 1 : 0);
      }

      if (max_price) {
        sql += ` AND COALESCE(f.discount_price, f.price) <= ?`;
        params.push(Number(max_price));
      }

      if (featured === '1' || featured === 'true') {
        sql += ` AND f.is_featured = 1`;
      }

      sql += ` ORDER BY f.is_featured DESC, f.rating DESC, f.name ASC`;

      const foods = await query.all(sql, params);

      // Attach add-ons to each food item
      const foodIds = foods.map((f) => f.id);
      let addonsMap = {};
      if (foodIds.length > 0) {
        const placeholders = foodIds.map(() => '?').join(',');
        const addons = await query.all(
          `SELECT * FROM food_addons WHERE food_id IN (${placeholders})`,
          foodIds
        );
        for (const ad of addons) {
          if (!addonsMap[ad.food_id]) addonsMap[ad.food_id] = [];
          addonsMap[ad.food_id].push(ad);
        }
      }

      const enrichedFoods = foods.map((f) => ({
        ...f,
        addons: addonsMap[f.id] || []
      }));

      res.json({ success: true, foods: enrichedFoods });
    } catch (err) {
      console.error('getFoods error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch food items.' });
    }
  }

  static async getFoodById(req, res) {
    try {
      const { id } = req.params;
      const food = await query.get(
        `SELECT f.*, c.name as category_name, c.slug as category_slug
         FROM food_items f
         JOIN categories c ON f.category_id = c.id
         WHERE f.id = ? OR f.slug = ?`,
        [id, id]
      );

      if (!food) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }

      const addons = await query.all(`SELECT * FROM food_addons WHERE food_id = ?`, [food.id]);
      const reviews = await query.all(
        `SELECT * FROM reviews WHERE food_id = ? ORDER BY created_at DESC LIMIT 10`,
        [food.id]
      );

      res.json({
        success: true,
        food: {
          ...food,
          addons,
          reviews
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve food details.' });
    }
  }

  static async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const food = await query.get(`SELECT id, is_available, name FROM food_items WHERE id = ?`, [id]);
      if (!food) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }

      const newStatus = food.is_available ? 0 : 1;
      await query.run(`UPDATE food_items SET is_available = ? WHERE id = ?`, [newStatus, id]);

      res.json({
        success: true,
        message: `${food.name} is now ${newStatus ? 'AVAILABLE' : 'UNAVAILABLE'} on the customer menu.`,
        is_available: newStatus
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to toggle availability.' });
    }
  }

  static async createFood(req, res) {
    try {
      const {
        name,
        description,
        category_id,
        price,
        discount_price,
        is_veg,
        is_available,
        prep_time,
        is_featured,
        image_url,
        tags,
        addons
      } = req.body;

      if (!name || !category_id || !price) {
        return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

      const result = await query.run(
        `INSERT INTO food_items (
          name, slug, description, category_id, price, discount_price, is_veg, is_available, prep_time, is_featured, image_url, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          slug,
          description || '',
          category_id,
          Number(price),
          discount_price ? Number(discount_price) : null,
          is_veg !== undefined ? (is_veg ? 1 : 0) : 1,
          is_available !== undefined ? (is_available ? 1 : 0) : 1,
          prep_time || '15 min',
          is_featured ? 1 : 0,
          image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          tags || ''
        ]
      );

      const foodId = result.lastID;

      // Insert addons if provided
      if (Array.isArray(addons) && addons.length > 0) {
        for (const ad of addons) {
          if (ad.name && ad.price !== undefined) {
            await query.run(
              `INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`,
              [foodId, ad.name, Number(ad.price)]
            );
          }
        }
      }

      const created = await query.get(`SELECT * FROM food_items WHERE id = ?`, [foodId]);
      res.status(201).json({ success: true, food: created });
    } catch (err) {
      console.error('createFood error:', err);
      res.status(500).json({ success: false, message: 'Failed to create food item.' });
    }
  }

  static async updateFood(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        category_id,
        price,
        discount_price,
        is_veg,
        is_available,
        prep_time,
        is_featured,
        image_url,
        tags,
        addons
      } = req.body;

      await query.run(
        `UPDATE food_items 
         SET name = COALESCE(?, name),
             description = COALESCE(?, description),
             category_id = COALESCE(?, category_id),
             price = COALESCE(?, price),
             discount_price = ?,
             is_veg = COALESCE(?, is_veg),
             is_available = COALESCE(?, is_available),
             prep_time = COALESCE(?, prep_time),
             is_featured = COALESCE(?, is_featured),
             image_url = COALESCE(?, image_url),
             tags = COALESCE(?, tags)
         WHERE id = ?`,
        [
          name ? name.trim() : null,
          description,
          category_id,
          price ? Number(price) : null,
          discount_price !== undefined ? (discount_price ? Number(discount_price) : null) : null,
          is_veg !== undefined ? (is_veg ? 1 : 0) : null,
          is_available !== undefined ? (is_available ? 1 : 0) : null,
          prep_time,
          is_featured !== undefined ? (is_featured ? 1 : 0) : null,
          image_url,
          tags,
          id
        ]
      );

      // If addons are provided, replace them
      if (Array.isArray(addons)) {
        await query.run(`DELETE FROM food_addons WHERE food_id = ?`, [id]);
        for (const ad of addons) {
          if (ad.name && ad.price !== undefined) {
            await query.run(
              `INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`,
              [id, ad.name, Number(ad.price)]
            );
          }
        }
      }

      const updated = await query.get(`SELECT * FROM food_items WHERE id = ?`, [id]);
      res.json({ success: true, food: updated });
    } catch (err) {
      console.error('updateFood error:', err);
      res.status(500).json({ success: false, message: 'Failed to update food item.' });
    }
  }

  static async deleteFood(req, res) {
    try {
      const { id } = req.params;
      await query.run(`DELETE FROM food_items WHERE id = ?`, [id]);
      res.json({ success: true, message: 'Food item deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete food item.' });
    }
  }
}

module.exports = { FoodController };
