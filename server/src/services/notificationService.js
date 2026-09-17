const { query } = require('../database');

class NotificationService {
  static async send({ userId, isAdmin = 0, title, message, type = 'order', orderId = null }) {
    try {
      await query.run(
        `INSERT INTO notifications (user_id, is_admin, title, message, type, order_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId || null, isAdmin ? 1 : 0, title, message, type, orderId]
      );
      // In production, integrate dispatch to SMS (Twilio), Email (Nodemailer / SendGrid), or Web Push (Firebase Cloud Messaging)
      console.log(`[Notification ${isAdmin ? 'ADMIN' : 'USER'}]: ${title} - ${message}`);
    } catch (err) {
      console.error('Failed to store notification:', err);
    }
  }

  static async notifyOrderStateChange(order, newStatus) {
    const statusMessages = {
      'Order Placed': 'Your order has been placed and received by the café.',
      'Confirmed': 'Your order has been confirmed by Come To Eat.',
      'Preparing': 'Chef is currently preparing your meal.',
      'Ready': order.delivery_type === 'pickup' ? 'Your order is packed and ready for pickup!' : 'Your order is ready and waiting for courier dispatch.',
      'Out for Delivery': 'Our delivery partner is on the way with your hot meal!',
      'Delivered': 'Your order has been delivered. Enjoy your meal!',
      'Cancelled': `Your order was cancelled. ${order.cancellation_reason ? 'Reason: ' + order.cancellation_reason : ''}`
    };

    const message = statusMessages[newStatus] || `Your order status is now: ${newStatus}`;

    // Notify Customer
    if (order.user_id) {
      await this.send({
        userId: order.user_id,
        isAdmin: 0,
        title: `Order #${order.order_number}: ${newStatus}`,
        message,
        type: 'status_update',
        orderId: order.id
      });
    }

    // Notify Admin on critical events
    if (['Order Placed', 'Cancelled'].includes(newStatus)) {
      await this.send({
        userId: null,
        isAdmin: 1,
        title: `Order #${order.order_number} ${newStatus}`,
        message: `Customer ${order.customer_name} - ₹${order.final_amount}`,
        type: 'admin_alert',
        orderId: order.id
      });
    }
  }
}

module.exports = { NotificationService };
