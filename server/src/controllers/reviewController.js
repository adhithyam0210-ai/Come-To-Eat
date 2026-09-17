const { query } = require('../database');

class ReviewController {
  static async getFoodReviews(req, res) {
    try {
      const { foodId } = req.params;
      const reviews = await query.all(
        `SELECT * FROM reviews WHERE food_id = ? ORDER BY created_at DESC`,
        [foodId]
      );
      res.json({ success: true, reviews });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
  }

  static async getAllReviewsAdmin(req, res) {
    try {
      const reviews = await query.all(
        `SELECT r.*, f.name as food_name, f.image_url as food_image
         FROM reviews r
         JOIN food_items f ON r.food_id = f.id
         ORDER BY r.created_at DESC`
      );
      res.json({ success: true, reviews });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
  }

  static async addReview(req, res) {
    try {
      const { food_id, rating, comment } = req.body;
      if (!food_id || !rating) {
        return res.status(400).json({ success: false, message: 'Food item and rating (1-5) required.' });
      }

      const userName = req.user ? req.user.name : 'Verified Customer';
      const userId = req.user ? req.user.id : 1;

      const result = await query.run(
        `INSERT INTO reviews (food_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)`,
        [food_id, userId, userName, Math.min(5, Math.max(1, Number(rating))), comment || '']
      );

      // Recalculate average rating on food item
      const avgRow = await query.get(
        `SELECT AVG(rating) as avg_rating, COUNT(id) as count FROM reviews WHERE food_id = ?`,
        [food_id]
      );

      if (avgRow) {
        await query.run(
          `UPDATE food_items SET rating = ?, rating_count = ? WHERE id = ?`,
          [parseFloat(avgRow.avg_rating.toFixed(1)), avgRow.count, food_id]
        );
      }

      const created = await query.get(`SELECT * FROM reviews WHERE id = ?`, [result.lastID]);
      res.status(201).json({ success: true, review: created });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
  }
}

module.exports = { ReviewController };
