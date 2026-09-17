const { query } = require('../database');

class PaymentService {
  /**
   * Processes or simulates gateway payment authorization.
   * Ensures no card numbers or CVVs are ever stored in the database.
   */
  static async processPayment({ orderId, userId, amount, paymentMethod, paymentDetails = {} }) {
    // Generate secure idempotency & transaction reference
    const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);

    // Sanitize metadata - NEVER store raw card numbers or CVV
    const sanitizedMetadata = {
      gateway: 'ComeToEat Payment Bridge',
      method: paymentMethod,
      timestamp: new Date().toISOString(),
      authorized: true
    };

    if (paymentMethod === 'UPI') {
      sanitizedMetadata.vpa = paymentDetails.vpa || 'customer@upi';
    } else if (paymentMethod.includes('Card')) {
      // Store ONLY the last 4 digits and brand if provided
      sanitizedMetadata.cardLast4 = paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : '4242';
      sanitizedMetadata.cardBrand = paymentDetails.cardBrand || 'Visa';
    } else if (paymentMethod === 'Net Banking') {
      sanitizedMetadata.bankName = paymentDetails.bankName || 'HDFC Bank';
    } else if (paymentMethod === 'Cash on Delivery') {
      sanitizedMetadata.codCollected = false;
    }

    const status = paymentMethod === 'Cash on Delivery' ? 'pending_cod' : 'successful';

    const res = await query.run(
      `INSERT INTO payments (
        order_id, user_id, amount, payment_method, transaction_id, status, gateway_response_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        amount,
        paymentMethod,
        transactionId,
        status,
        JSON.stringify(sanitizedMetadata)
      ]
    );

    return {
      paymentId: res.lastID,
      transactionId,
      status,
      amount,
      paymentMethod
    };
  }

  /**
   * Issue a refund for cancelled orders
   */
  static async processRefund(orderId, refundAmount, reason = 'Order Cancelled') {
    const payment = await query.get(`SELECT * FROM payments WHERE order_id = ?`, [orderId]);
    if (!payment) {
      return { success: false, message: 'No payment record found for this order.' };
    }

    if (payment.payment_method === 'Cash on Delivery') {
      await query.run(
        `UPDATE payments SET refund_status = 'cancelled_cod' WHERE order_id = ?`,
        [orderId]
      );
      return { success: true, message: 'COD Order cancelled with no cash due.' };
    }

    await query.run(
      `UPDATE payments SET refund_status = 'refunded', refund_amount = ? WHERE order_id = ?`,
      [refundAmount, orderId]
    );

    return {
      success: true,
      refundId: 'REF_' + Date.now(),
      amount: refundAmount,
      reason
    };
  }

  static async getPaymentByOrderId(orderId) {
    return await query.get(`SELECT * FROM payments WHERE order_id = ?`, [orderId]);
  }
}

module.exports = { PaymentService };
