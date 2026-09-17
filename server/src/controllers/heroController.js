const { query } = require('../database');

class HeroController {
  /**
   * Get active hero slides for customer banner
   */
  static async getHeroSlides(req, res) {
    try {
      const slides = await query.all(
        `SELECT id, tag, script, title, desc_text AS desc, image_url, button_text, bg_color, accent_text, target_category, sort_order, is_active
         FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`
      );
      res.json({ success: true, slides });
    } catch (err) {
      console.error('getHeroSlides error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch hero banner slides.' });
    }
  }

  /**
   * Admin: Get all hero slides
   */
  static async getAllHeroSlidesAdmin(req, res) {
    try {
      const slides = await query.all(
        `SELECT id, tag, script, title, desc_text AS desc, image_url, button_text, bg_color, accent_text, target_category, sort_order, is_active
         FROM hero_slides ORDER BY sort_order ASC, id ASC`
      );
      res.json({ success: true, slides });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch hero slides for admin.' });
    }
  }

  /**
   * Admin: Create a new hero slide
   */
  static async createHeroSlide(req, res) {
    try {
      const {
        tag,
        script,
        title,
        desc,
        image_url,
        button_text,
        bg_color,
        accent_text,
        target_category,
        sort_order
      } = req.body;

      if (!title || !script) {
        return res.status(400).json({ success: false, message: 'Slide title and cursive script are required.' });
      }

      const result = await query.run(
        `INSERT INTO hero_slides 
         (tag, script, title, desc_text, image_url, button_text, bg_color, accent_text, target_category, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tag || 'CHEF SIGNATURE',
          script,
          title,
          desc || '',
          image_url || 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
          button_text || 'Order Now',
          bg_color || '#949E7C',
          accent_text || '',
          target_category || 'Burgers and Sandwiches',
          sort_order || 0
        ]
      );

      const created = await query.get(
        `SELECT id, tag, script, title, desc_text AS desc, image_url, button_text, bg_color, accent_text, target_category, sort_order, is_active
         FROM hero_slides WHERE id = ?`,
        [result.lastID]
      );
      res.status(201).json({ success: true, slide: created, message: 'Hero slide created successfully.' });
    } catch (err) {
      console.error('createHeroSlide error:', err);
      res.status(500).json({ success: false, message: 'Failed to create hero slide.' });
    }
  }

  /**
   * Admin: Update an existing hero slide
   */
  static async updateHeroSlide(req, res) {
    try {
      const { id } = req.params;
      const {
        tag,
        script,
        title,
        desc,
        image_url,
        button_text,
        bg_color,
        accent_text,
        target_category,
        sort_order,
        is_active
      } = req.body;

      await query.run(
        `UPDATE hero_slides
         SET tag = COALESCE(?, tag),
             script = COALESCE(?, script),
             title = COALESCE(?, title),
             desc_text = COALESCE(?, desc_text),
             image_url = COALESCE(?, image_url),
             button_text = COALESCE(?, button_text),
             bg_color = COALESCE(?, bg_color),
             accent_text = COALESCE(?, accent_text),
             target_category = COALESCE(?, target_category),
             sort_order = COALESCE(?, sort_order),
             is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [
          tag || null,
          script || null,
          title || null,
          desc !== undefined ? desc : null,
          image_url || null,
          button_text || null,
          bg_color || null,
          accent_text !== undefined ? accent_text : null,
          target_category || null,
          sort_order !== undefined ? Number(sort_order) : null,
          is_active !== undefined ? Number(is_active) : null,
          id
        ]
      );

      const updated = await query.get(
        `SELECT id, tag, script, title, desc_text AS desc, image_url, button_text, bg_color, accent_text, target_category, sort_order, is_active
         FROM hero_slides WHERE id = ?`,
        [id]
      );
      res.json({ success: true, slide: updated, message: 'Hero slide updated successfully.' });
    } catch (err) {
      console.error('updateHeroSlide error:', err);
      res.status(500).json({ success: false, message: 'Failed to update hero slide.' });
    }
  }

  /**
   * Admin: Delete a hero slide
   */
  static async deleteHeroSlide(req, res) {
    try {
      await query.run(`DELETE FROM hero_slides WHERE id = ?`, [req.params.id]);
      res.json({ success: true, message: 'Hero slide deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete hero slide.' });
    }
  }
}

module.exports = { HeroController };
