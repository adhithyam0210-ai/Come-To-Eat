const { query } = require('../database');
const { PaymentService } = require('../services/paymentService');
const { DeliveryIntegrationService } = require('../services/deliveryService');
const { NotificationService } = require('../services/notificationService');
const { broadcastLiveEvent } = require('../supabase');

class OrderController {
  /**
   * Create and validate an order with strict server-side calculations
   */
  static async createOrder(req, res) {
    try {
      const {
        items,
        delivery_type,
        address,
        coupon_code,
        payment_method,
        payment_details,
        customer_name,
        customer_email,
        customer_phone,
        branch_id,
        branch_name
      } = req.body;

      const finalBranchId = branch_id ? Number(branch_id) : 1;
      const finalBranchName = branch_name || 'Indiranagar (Flagship)';

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart cannot be empty.' });
      }

      let userId = req.user ? req.user.id : null;
      if (!userId) {
        const anyUser = await query.get('SELECT id FROM users LIMIT 1');
        userId = anyUser ? anyUser.id : 1;
      }
      const finalCustName = customer_name || (req.user ? req.user.name : 'Guest Customer');
      const finalCustEmail = customer_email || (req.user ? req.user.email : 'guest@cometoeat.com');
      const finalCustPhone = customer_phone || (req.user ? req.user.phone : '+91 99999 99999');

      // 1. Re-fetch and strictly validate all food items from the DB
      let calculatedItemTotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const food = await query.get(
          `SELECT id, name, price, discount_price, is_available FROM food_items WHERE id = ?`,
          [item.food_id]
        );

        if (!food) {
          return res.status(400).json({
            success: false,
            message: `Food item with ID ${item.food_id} no longer exists in our menu.`
          });
        }

        if (!food.is_available) {
          return res.status(400).json({
            success: false,
            message: `"${food.name}" is currently sold out and unavailable. Please remove it from your cart.`
          });
        }

        const unitBasePrice = food.discount_price !== null ? food.discount_price : food.price;
        let addonsPrice = 0;
        const selectedAddons = [];

        if (Array.isArray(item.selected_addons) && item.selected_addons.length > 0) {
          for (const ad of item.selected_addons) {
            // Verify addon price from DB if available or validate against food_addons table
            const dbAddon = await query.get(
              `SELECT id, name, price FROM food_addons WHERE food_id = ? AND name = ?`,
              [food.id, ad.name]
            );
            if (dbAddon) {
              addonsPrice += Number(dbAddon.price);
              selectedAddons.push({ name: dbAddon.name, price: Number(dbAddon.price) });
            }
          }
        }

        const finalUnitItemPrice = unitBasePrice + addonsPrice;
        const itemQuantity = Math.max(1, parseInt(item.quantity) || 1);
        const itemSubtotal = finalUnitItemPrice * itemQuantity;

        calculatedItemTotal += itemSubtotal;
        validatedItems.push({
          food_id: food.id,
          food_name: food.name,
          unit_price: finalUnitItemPrice,
          quantity: itemQuantity,
          subtotal: itemSubtotal,
          selected_addons: selectedAddons
        });
      }

      // 2. Validate Coupon Code if provided
      let discountAmount = 0;
      let validCouponCode = null;

      if (coupon_code) {
        const coupon = await query.get(
          `SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1`,
          [coupon_code.trim().toUpperCase()]
        );

        if (coupon) {
          if (calculatedItemTotal >= coupon.min_order_value) {
            if (coupon.discount_type === 'percentage') {
              const calcDiscount = (calculatedItemTotal * coupon.discount_value) / 100;
              discountAmount = Math.min(calcDiscount, coupon.max_discount);
            } else {
              discountAmount = Math.min(coupon.discount_value, coupon.max_discount);
            }
            validCouponCode = coupon.code;
            // Record usage
            await query.run(`UPDATE coupons SET times_used = times_used + 1 WHERE id = ?`, [coupon.id]);
          }
        }
      }

      // 3. Taxes & Delivery Fee
      const taxes = parseFloat(((calculatedItemTotal - discountAmount) * 0.05).toFixed(2)); // 5% GST
      const isDelivery = delivery_type !== 'pickup';
      let deliveryFee = isDelivery ? 40 : 0;

      // Free shipping coupon check
      if (validCouponCode === 'FREESHIP') {
        deliveryFee = 0;
      }

      const finalAmount = parseFloat(
        Math.max(0, calculatedItemTotal - discountAmount + taxes + deliveryFee).toFixed(2)
      );

      // 4. Generate Unique Order Number
      const orderNumber = 'CTE-' + Math.floor(100000 + Math.random() * 900000);

      // 5. Insert Order
      const orderRes = await query.run(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone, delivery_type,
          delivery_address_json, item_total, taxes, delivery_fee, discount_amount, coupon_code,
          final_amount, payment_method, payment_status, order_status, estimated_delivery_minutes,
          branch_id, branch_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          finalCustName,
          finalCustEmail,
          finalCustPhone,
          isDelivery ? 'delivery' : 'pickup',
          address ? JSON.stringify(address) : null,
          calculatedItemTotal,
          taxes,
          deliveryFee,
          discountAmount,
          validCouponCode,
          finalAmount,
          payment_method || 'UPI',
          payment_method === 'Cash on Delivery' ? 'pending_cod' : 'completed',
          'Order Placed',
          isDelivery ? 35 : 15,
          finalBranchId,
          finalBranchName
        ]
      );

      const orderId = orderRes.lastID;

      // 6. Insert Order Items
      for (const vi of validatedItems) {
        await query.run(
          `INSERT INTO order_items (order_id, food_id, food_name, unit_price, quantity, subtotal, selected_addons_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            vi.food_id,
            vi.food_name,
            vi.unit_price,
            vi.quantity,
            vi.subtotal,
            JSON.stringify(vi.selected_addons)
          ]
        );
      }

      // 7. Initial Status History Audit
      await query.run(
        `INSERT INTO order_status_history (order_id, old_status, new_status, comment) VALUES (?, ?, ?, ?)`,
        [orderId, null, 'Order Placed', `Order received from ${finalCustName} for ₹${finalAmount}`]
      );

      // 8. Process Payment Record
      const paymentResult = await PaymentService.processPayment({
        orderId,
        userId,
        amount: finalAmount,
        paymentMethod: payment_method || 'UPI',
        paymentDetails: payment_details || {}
      });

      // 9. Dispatch Delivery Layer (if delivery requested)
      let deliveryData = null;
      if (isDelivery) {
        const dropAddressString = address
          ? `${address.street}, ${address.city}${address.landmark ? ' (Landmark: ' + address.landmark + ')' : ''}`
          : 'Customer Address';

        deliveryData = await DeliveryIntegrationService.dispatchOrder(
          {
            id: orderId,
            order_number: orderNumber,
            customer_name: finalCustName,
            customer_phone: finalCustPhone
          },
          dropAddressString
        );
      }

      // 10. Send Notification
      await NotificationService.notifyOrderStateChange(
        {
          id: orderId,
          order_number: orderNumber,
          user_id: userId,
          customer_name: finalCustName,
          final_amount: finalAmount,
          delivery_type: isDelivery ? 'delivery' : 'pickup'
        },
        'Order Placed'
      );

      // Return full order object with confirmation details
      const placedOrder = await OrderController.fetchFullOrder(orderId);

      // Realtime live reflection broadcast to Employee and Admin portals
      broadcastLiveEvent('ORDER_CREATED', placedOrder);

      res.status(201).json({
        success: true,
        message: 'Your order has been placed successfully!',
        order: placedOrder,
        payment: paymentResult,
        delivery: deliveryData
      });
    } catch (err) {
      console.error('createOrder error:', err);
      res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
    }
  }

  /**
   * Helper to assemble full order with items, tracking, history
   */
  static async fetchFullOrder(orderId) {
    const order = await query.get(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    if (!order) return null;

    const items = await query.all(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);
    const parsedItems = items.map((it) => ({
      ...it,
      selected_addons: it.selected_addons_json ? JSON.parse(it.selected_addons_json) : []
    }));

    const history = await query.all(
      `SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC`,
      [orderId]
    );

    const payment = await query.get(`SELECT * FROM payments WHERE order_id = ?`, [orderId]);
    const delivery = await query.get(`SELECT * FROM delivery_orders WHERE order_id = ?`, [orderId]);

    return {
      ...order,
      delivery_address: order.delivery_address_json ? JSON.parse(order.delivery_address_json) : null,
      items: parsedItems,
      history,
      payment,
      delivery
    };
  }

  /**
   * Get Customer's Orders
   */
  static async getUserOrders(req, res) {
    try {
      const orders = await query.all(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [req.user.id]
      );

      const fullOrders = [];
      for (const ord of orders) {
        const full = await OrderController.fetchFullOrder(ord.id);
        fullOrders.push(full);
      }

      res.json({ success: true, orders: fullOrders });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch your orders.' });
    }
  }

  /**
   * Get single order by ID or order_number
   */
  static async getOrderDetails(req, res) {
    try {
      const { id } = req.params;
      const order = await query.get(
        `SELECT id, user_id FROM orders WHERE id = ? OR order_number = ?`,
        [id, id]
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check permissions: user can only view their own orders unless admin
      if (req.user && req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied to this order.' });
      }

      const fullOrder = await OrderController.fetchFullOrder(order.id);
      res.json({ success: true, order: fullOrder });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
    }
  }

  /**
   * Customer or Admin Order Cancellation
   */
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await query.get(`SELECT * FROM orders WHERE id = ?`, [id]);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Permission check
      if (req.user && req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      // Cancellation rules: cannot cancel once in or after Preparing stage
      const nonCancellable = ['Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];
      if (nonCancellable.includes(order.order_status) && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order at stage: "${order.order_status}". Food preparation has already started in the kitchen.`
        });
      }

      const oldStatus = order.order_status;
      await query.run(
        `UPDATE orders SET order_status = 'Cancelled', cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [reason || 'Cancelled by customer', id]
      );

      await query.run(
        `INSERT INTO order_status_history (order_id, old_status, new_status, comment) VALUES (?, ?, ?, ?)`,
        [id, oldStatus, 'Cancelled', reason || 'Order cancelled']
      );

      // Process automatic refund if already paid
      if (order.payment_status === 'completed') {
        await PaymentService.processRefund(id, order.final_amount, reason);
      }

      // Notify
      await NotificationService.notifyOrderStateChange(
        { ...order, cancellation_reason: reason },
        'Cancelled'
      );

      const updated = await OrderController.fetchFullOrder(id);
      broadcastLiveEvent('ORDER_UPDATED', updated);
      res.json({ success: true, message: 'Order cancelled successfully.', order: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to cancel order.' });
    }
  }

  /**
   * Update Order Status
   * Note: In admin side, live orders is view-only; employee performs workflow actions.
   */
  static async updateOrderStatus(req, res) {
    try {
      // If caller is Manager Admin, live order actions are restricted (view-only per spec)
      if (req.user && req.user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin is view-only for live orders. Operational status transitions must be executed by Kitchen Employee.'
        });
      }

      const { id } = req.params;
      const { status, comment } = req.body;

      const validStatuses = [
        'Order Placed',
        'Confirmed',
        'Preparing',
        'Ready',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
      }

      const order = await query.get(`SELECT * FROM orders WHERE id = ?`, [id]);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const oldStatus = order.order_status;

      // Update order table
      await query.run(
        `UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, id]
      );

      // Audit status history
      await query.run(
        `INSERT INTO order_status_history (order_id, old_status, new_status, comment) VALUES (?, ?, ?, ?)`,
        [id, oldStatus, status, comment || `Status updated to ${status} by café admin.`]
      );

      // Sync delivery layer
      if (status === 'Out for Delivery') {
        await DeliveryIntegrationService.updateStatus(id, 'in_transit');
      } else if (status === 'Delivered') {
        await DeliveryIntegrationService.updateStatus(id, 'delivered');
        // If COD, mark payment completed
        if (order.payment_method === 'Cash on Delivery') {
          await query.run(`UPDATE orders SET payment_status = 'completed' WHERE id = ?`, [id]);
          await query.run(
            `UPDATE payments SET status = 'successful', gateway_response_json = json_set(gateway_response_json, '$.codCollected', true) WHERE order_id = ?`,
            [id]
          );
        }
      }

      // Notify customer
      await NotificationService.notifyOrderStateChange(order, status);

      const updated = await OrderController.fetchFullOrder(id);
      broadcastLiveEvent('ORDER_UPDATED', updated);

      res.json({
        success: true,
        message: `Order #${order.order_number} status updated to ${status}`,
        order: updated
      });
    } catch (err) {
      console.error('updateOrderStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
  }

  /**
   * Admin & Kitchen Staff: List All Orders with filters, branch routing & search
   */
  static async getAllOrdersAdmin(req, res) {
    try {
      const { status, search, limit = 50, offset = 0, branch_id } = req.query;

      let sql = `SELECT * FROM orders WHERE 1=1`;
      let countSql = `SELECT COUNT(id) as total FROM orders WHERE 1=1`;
      const params = [];
      const countParams = [];

      if (branch_id && branch_id !== 'all') {
        sql += ` AND branch_id = ?`;
        countSql += ` AND branch_id = ?`;
        params.push(Number(branch_id));
        countParams.push(Number(branch_id));
      }

      if (status && status !== 'all') {
        sql += ` AND order_status = ?`;
        countSql += ` AND order_status = ?`;
        params.push(status);
        countParams.push(status);
      }

      if (search) {
        sql += ` AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)`;
        countSql += ` AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)`;
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
        countParams.push(term, term, term);
      }

      sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const orders = await query.all(sql, params);

      const fullOrders = [];
      for (const ord of orders) {
        const full = await OrderController.fetchFullOrder(ord.id);
        fullOrders.push(full);
      }

      const totalCountRow = await query.get(countSql, countParams);

      res.json({
        success: true,
        orders: fullOrders,
        total: totalCountRow ? totalCountRow.total : 0
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
    }
  }
}

module.exports = { OrderController };
