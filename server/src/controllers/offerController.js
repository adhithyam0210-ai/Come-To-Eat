const { query } = require('../database');

class OfferController {
  /**
   * Get active offer banners for customer offers page (supports branch_id filtering)
   */
  static async getOffers(req, res) {
    try {
      const { branch_id } = req.query;
      let sql = `SELECT * FROM offer_banners WHERE is_active = 1`;
      const params = [];

      if (branch_id && branch_id !== 'all') {
        sql += ` AND (branch_id = ? OR branch_id IS NULL)`;
        params.push(Number(branch_id));
      }

      sql += ` ORDER BY sort_order ASC, id ASC`;
      const offers = await query.all(sql, params);
      res.json({ success: true, offers });
    } catch (err) {
      console.error('getOffers error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch offer banners.' });
    }
  }

  /**
   * Admin: Get all offer banners
   */
  static async getAllOffersAdmin(req, res) {
    try {
      const offers = await query.all(`SELECT * FROM offer_banners ORDER BY sort_order ASC, id ASC`);
      res.json({ success: true, offers });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch offers for admin.' });
    }
  }

  /**
   * Admin: Create a new offer banner
   */
  static async createOffer(req, res) {
    try {
      const {
        title,
        tag,
        description,
        image_url,
        button_text,
        target_category,
        bg_color,
        sort_order,
        branch_id
      } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Offer banner title is required.' });
      }

      const result = await query.run(
        `INSERT INTO offer_banners 
         (title, tag, description, image_url, button_text, target_category, bg_color, sort_order, branch_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          tag || 'PROMO',
          description || '',
          image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
          button_text || 'Claim Offer & Order',
          target_category || 'Burgers and Sandwiches',
          bg_color || '#85926B',
          sort_order ? Number(sort_order) : 0,
          branch_id ? Number(branch_id) : null
        ]
      );

      const created = await query.get(`SELECT * FROM offer_banners WHERE id = ?`, [result.lastID]);
      res.status(201).json({ success: true, offer: created, message: 'Offer banner created successfully.' });
    } catch (err) {
      console.error('createOffer error:', err);
      res.status(500).json({ success: false, message: 'Failed to create offer banner.' });
    }
  }

  /**
   * Admin: Update an existing offer banner
   */
  static async updateOffer(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        tag,
        description,
        image_url,
        button_text,
        target_category,
        bg_color,
        sort_order,
        is_active,
        branch_id
      } = req.body;

      await query.run(
        `UPDATE offer_banners
         SET title = COALESCE(?, title),
             tag = COALESCE(?, tag),
             description = COALESCE(?, description),
             image_url = COALESCE(?, image_url),
             button_text = COALESCE(?, button_text),
             target_category = COALESCE(?, target_category),
             bg_color = COALESCE(?, bg_color),
             sort_order = COALESCE(?, sort_order),
             is_active = COALESCE(?, is_active),
             branch_id = COALESCE(?, branch_id)
         WHERE id = ?`,
        [
          title ? title.trim() : null,
          tag || null,
          description !== undefined ? description : null,
          image_url || null,
          button_text || null,
          target_category || null,
          bg_color || null,
          sort_order !== undefined ? Number(sort_order) : null,
          is_active !== undefined ? Number(is_active) : null,
          branch_id !== undefined ? (branch_id ? Number(branch_id) : null) : null,
          id
        ]
      );

      const updated = await query.get(`SELECT * FROM offer_banners WHERE id = ?`, [id]);
      res.json({ success: true, offer: updated, message: 'Offer banner updated successfully.' });
    } catch (err) {
      console.error('updateOffer error:', err);
      res.status(500).json({ success: false, message: 'Failed to update offer banner.' });
    }
  }

  /**
   * Admin: Delete an offer banner
   */
  static async deleteOffer(req, res) {
    try {
      await query.run(`DELETE FROM offer_banners WHERE id = ?`, [req.params.id]);
      res.json({ success: true, message: 'Offer banner deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete offer banner.' });
    }
  }
}

module.exports = { OfferController };
