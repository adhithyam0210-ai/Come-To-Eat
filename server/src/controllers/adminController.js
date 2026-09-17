const { query } = require('../database');
const { PaymentService } = require('../services/paymentService');

class AdminController {
  /**
   * Comprehensive Operational Metrics for Dashboard
   */
  static async getDashboardStats(req, res) {
    try {
      const { branch_id } = req.query;
      const bFilter = (branch_id && branch_id !== 'all') ? ` AND o.branch_id = ${Number(branch_id)}` : '';
      const bWhere = (branch_id && branch_id !== 'all') ? ` WHERE branch_id = ${Number(branch_id)}` : '';
      const bAnd = (branch_id && branch_id !== 'all') ? ` AND branch_id = ${Number(branch_id)}` : '';

      // 1. Total & Today's Orders
      const totalOrdersRow = await query.get(`SELECT COUNT(id) as count FROM orders${bWhere}`);
      const todayOrdersRow = await query.get(
        `SELECT COUNT(id) as count, COALESCE(SUM(final_amount), 0) as revenue 
         FROM orders 
         WHERE date(created_at) = date('now') AND order_status != 'Cancelled'${bAnd}`
      );

      // 2. Pending Kitchen Orders
      const pendingRow = await query.get(
        `SELECT COUNT(id) as count 
         FROM orders 
         WHERE order_status IN ('Order Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery')${bAnd}`
      );

      // 3. Completed & Cancelled Orders
      const completedRow = await query.get(
        `SELECT COUNT(id) as count FROM orders WHERE order_status = 'Delivered'${bAnd}`
      );
      const cancelledRow = await query.get(
        `SELECT COUNT(id) as count FROM orders WHERE order_status = 'Cancelled'${bAnd}`
      );

      // 4. Monthly Revenue
      const monthlyRow = await query.get(
        `SELECT COALESCE(SUM(final_amount), 0) as revenue 
         FROM orders 
         WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND order_status != 'Cancelled'${bAnd}`
      );

      const totalRevenueRow = await query.get(
        `SELECT COALESCE(SUM(final_amount), 0) as revenue 
         FROM orders 
         WHERE order_status != 'Cancelled'${bAnd}`
      );

      // 5. Popular Food Items
      const popularItems = await query.all(
        `SELECT oi.food_name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_revenue, fi.image_url
         FROM order_items oi
         LEFT JOIN food_items fi ON oi.food_id = fi.id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.order_status != 'Cancelled'${bFilter}
         GROUP BY oi.food_id, oi.food_name
         ORDER BY total_sold DESC
         LIMIT 5`
      );

      // 6. Recent Orders
      const recentOrders = await query.all(
        `SELECT o.id, o.order_number, o.customer_name, o.final_amount, o.order_status, o.payment_method, o.created_at, o.branch_name
         FROM orders o
         WHERE 1=1${bFilter}
         ORDER BY o.created_at DESC
         LIMIT 8`
      );

      // 7. Last 7 Days Sales Trend
      const last7Days = await query.all(
        `SELECT date(created_at) as date, COUNT(id) as orders, COALESCE(SUM(final_amount), 0) as revenue
         FROM orders
         WHERE created_at >= date('now', '-6 days') AND order_status != 'Cancelled'${bAnd}
         GROUP BY date(created_at)
         ORDER BY date(created_at) ASC`
      );

      const isEmployee = req.user && req.user.role === 'employee';

      const stats = {
        totalOrders: totalOrdersRow.count,
        todayOrders: todayOrdersRow.count,
        pendingOrders: pendingRow.count,
        completedOrders: completedRow.count,
        cancelledOrders: cancelledRow.count,
        popularItems: isEmployee
          ? popularItems.map(({ food_name, total_sold, image_url }) => ({ food_name, total_sold, image_url }))
          : popularItems,
        recentOrders,
        last7Days: isEmployee
          ? last7Days.map(({ date, orders }) => ({ date, orders }))
          : last7Days
      };

      if (!isEmployee) {
        stats.todayRevenue = todayOrdersRow.revenue;
        stats.monthlyRevenue = monthlyRow.revenue;
        stats.totalRevenue = totalRevenueRow.revenue;
      }

      res.json({
        success: true,
        stats
      });
    } catch (err) {
      console.error('getDashboardStats error:', err);
      res.status(500).json({ success: false, message: 'Failed to generate dashboard metrics.' });
    }
  }

  /**
   * Customer Management: List registered customers
   */
  static async getCustomers(req, res) {
    try {
      const customers = await query.all(
        `SELECT u.id, u.name, u.email, u.phone, u.is_blocked, u.created_at,
                COUNT(o.id) as order_count,
                COALESCE(SUM(o.final_amount), 0) as total_spent
         FROM users u
         LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'Cancelled'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      res.json({ success: true, customers });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
    }
  }

  /**
   * Toggle Customer block/active status
   */
  static async toggleCustomerBlock(req, res) {
    try {
      const { id } = req.params;
      const user = await query.get(`SELECT id, name, is_blocked FROM users WHERE id = ?`, [id]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const newStatus = user.is_blocked ? 0 : 1;
      await query.run(`UPDATE users SET is_blocked = ? WHERE id = ?`, [newStatus, id]);

      res.json({
        success: true,
        message: `Customer ${user.name} is now ${newStatus ? 'BLOCKED' : 'ACTIVE'}.`,
        is_blocked: newStatus
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update customer status.' });
    }
  }

  /**
   * Payment Management
   */
  static async getPayments(req, res) {
    try {
      const payments = await query.all(
        `SELECT p.*, o.order_number, o.customer_name, o.customer_email
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         ORDER BY p.created_at DESC`
      );
      res.json({ success: true, payments });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
    }
  }

  /**
   * Process Refund
   */
  static async refundPayment(req, res) {
    try {
      const { orderId } = req.params;
      const { amount, reason } = req.body;

      const order = await query.get(`SELECT * FROM orders WHERE id = ?`, [orderId]);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const result = await PaymentService.processRefund(orderId, amount || order.final_amount, reason);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to process refund.' });
    }
  }

  /**
   * Delivery Fleet & Partner Tracking View
   */
  static async getDeliveries(req, res) {
    try {
      const deliveries = await query.all(
        `SELECT d.*, o.order_number, o.customer_name, o.customer_phone, o.final_amount, o.order_status
         FROM delivery_orders d
         JOIN orders o ON d.order_id = o.id
         ORDER BY d.created_at DESC`
      );
      res.json({ success: true, deliveries });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch deliveries.' });
    }
  }
}

module.exports = { AdminController };
