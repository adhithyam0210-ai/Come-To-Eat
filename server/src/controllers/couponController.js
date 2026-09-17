const { query } = require('../database');

class CouponController {
  static async getActiveCoupons(req, res) {
    try {
      const coupons = await query.all(
        `SELECT code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, expires_at 
         FROM coupons 
         WHERE is_active = 1 
           AND (start_date IS NULL OR start_date <= date('now'))
           AND (end_date IS NULL OR end_date >= date('now'))
           AND (expires_at IS NULL OR expires_at >= date('now'))`
      );
      res.json({ success: true, coupons });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
    }
  }

  static async validateCoupon(req, res) {
    try {
      const { code, order_amount } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required.' });
      }

      const coupon = await query.get(
        `SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1`,
        [code.trim().toUpperCase()]
      );

      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
      }

      const today = new Date().toISOString().split('T')[0];
      if (coupon.start_date && coupon.start_date > today) {
        return res.status(400).json({
          success: false,
          message: `This coupon offer begins on ${coupon.start_date}.`
        });
      }

      if (coupon.end_date && coupon.end_date < today) {
        return res.status(400).json({
          success: false,
          message: `This coupon offer expired on ${coupon.end_date}.`
        });
      }

      if (coupon.expires_at && coupon.expires_at < today) {
        return res.status(400).json({
          success: false,
          message: `This coupon offer expired on ${coupon.expires_at}.`
        });
      }

      const amount = Number(order_amount) || 0;
      if (amount < coupon.min_order_value) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.min_order_value} required to apply this coupon.`
        });
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        const calculated = (amount * coupon.discount_value) / 100;
        discount = Math.min(calculated, coupon.max_discount);
      } else {
        discount = Math.min(coupon.discount_value, coupon.max_discount);
      }

      res.json({
        success: true,
        coupon: {
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          discount_amount: parseFloat(discount.toFixed(2)),
          min_order_value: coupon.min_order_value || 0,
          max_discount: coupon.max_discount,
          start_date: coupon.start_date,
          end_date: coupon.end_date
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
    }
  }

  static async getAllCouponsAdmin(req, res) {
    try {
      const coupons = await query.all(`SELECT * FROM coupons ORDER BY id DESC`);
      res.json({ success: true, coupons });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
    }
  }

  static async createCoupon(req, res) {
    try {
      const { code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, expires_at } = req.body;
      if (!code || !discount_value) {
        return res.status(400).json({ success: false, message: 'Code and discount value required.' });
      }

      const result = await query.run(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code.trim().toUpperCase(),
          discount_type || 'percentage',
          Number(discount_value),
          Number(min_order_value || 0),
          Number(max_discount || 500),
          start_date || null,
          end_date || expires_at || null,
          expires_at || end_date || null
        ]
      );

      const created = await query.get(`SELECT * FROM coupons WHERE id = ?`, [result.lastID]);
      res.status(201).json({ success: true, coupon: created, message: 'Coupon created successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create coupon. Code must be unique.' });
    }
  }

  static async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      const { code, discount_type, discount_value, min_order_value, max_discount, is_active, start_date, end_date, expires_at } = req.body;

      await query.run(
        `UPDATE coupons 
         SET code = COALESCE(?, code),
             discount_type = COALESCE(?, discount_type),
             discount_value = COALESCE(?, discount_value),
             min_order_value = COALESCE(?, min_order_value),
             max_discount = COALESCE(?, max_discount),
             is_active = COALESCE(?, is_active),
             start_date = COALESCE(?, start_date),
             end_date = COALESCE(?, end_date),
             expires_at = COALESCE(?, expires_at)
         WHERE id = ?`,
        [
          code ? code.trim().toUpperCase() : null,
          discount_type || null,
          discount_value !== undefined ? Number(discount_value) : null,
          min_order_value !== undefined ? Number(min_order_value) : null,
          max_discount !== undefined ? Number(max_discount) : null,
          is_active !== undefined ? Number(is_active) : null,
          start_date !== undefined ? start_date : null,
          end_date !== undefined ? end_date : null,
          expires_at !== undefined ? expires_at : null,
          id
        ]
      );

      const updated = await query.get(`SELECT * FROM coupons WHERE id = ?`, [id]);
      res.json({ success: true, coupon: updated, message: 'Coupon updated successfully.' });
    } catch (err) {
      console.error('updateCoupon error:', err);
      res.status(500).json({ success: false, message: 'Failed to update coupon. Code may already exist.' });
    }
  }

  static async deleteCoupon(req, res) {
    try {
      await query.run(`DELETE FROM coupons WHERE id = ?`, [req.params.id]);
      res.json({ success: true, message: 'Coupon deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
    }
  }
}

module.exports = { CouponController };
