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

  static async getAllPublicReviews(req, res) {
    try {
      const reviews = await query.all(
        `SELECT r.*, f.name as food_name, f.image_url as food_image
         FROM reviews r
         LEFT JOIN food_items f ON r.food_id = f.id
         ORDER BY r.created_at DESC LIMIT 50`
      );
      res.json({ success: true, reviews });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
  }

  static async addReview(req, res) {
    try {
      const { food_id, rating, comment, guest_name } = req.body;
      const targetFoodId = food_id || 1;
      const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

      let userName = req.user ? req.user.name : (guest_name || 'Valued Guest');
      let userId = req.user ? req.user.id : 1;

      const result = await query.run(
        `INSERT INTO reviews (food_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)`,
        [targetFoodId, userId, userName, numericRating, comment || '']
      );

      // Recalculate average rating on food item
      const avgRow = await query.get(
        `SELECT AVG(rating) as avg_rating, COUNT(id) as count FROM reviews WHERE food_id = ?`,
        [targetFoodId]
      );

      if (avgRow) {
        await query.run(
          `UPDATE food_items SET rating = ?, rating_count = ? WHERE id = ?`,
          [parseFloat(avgRow.avg_rating.toFixed(1)), avgRow.count, targetFoodId]
        );
      }

      const created = await query.get(
        `SELECT r.*, f.name as food_name, f.image_url as food_image 
         FROM reviews r 
         LEFT JOIN food_items f ON r.food_id = f.id 
         WHERE r.id = ?`, 
        [result.lastID]
      );
      res.status(201).json({ success: true, review: created });
    } catch (err) {
      console.error('addReview error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
  }
}

module.exports = { ReviewController };
