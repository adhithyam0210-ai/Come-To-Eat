const { query } = require('../database');

/**
 * Modular Delivery Partner Interface
 * Any third-party courier (Dunzo, Shadowfax, Shiprocket, Porter) implements this contract.
 */
class BaseDeliveryProvider {
  async createDeliveryOrder(payload) {
    throw new Error('createDeliveryOrder must be implemented');
  }
  async getTrackingDetails(trackingCode) {
    throw new Error('getTrackingDetails must be implemented');
  }
  async cancelDelivery(trackingCode, reason) {
    throw new Error('cancelDelivery must be implemented');
  }
}

/**
 * Standard Development Integration Provider
 * Simulates a production partner API with realistic dispatch, rider assignment and location telemetry.
 */
class DevelopmentDeliveryProvider extends BaseDeliveryProvider {
  constructor() {
    super();
    this.name = 'ComeToEat Express Dispatch';
    this.pickupAddress = 'Come To Eat Café, 100 Feet Road, Indiranagar, Bengaluru, 560038';
    this.drivers = [
      { name: 'Rohan Sharma', phone: '+91 91234 56789' },
      { name: 'Karthik Nair', phone: '+91 98321 45670' },
      { name: 'Vikram Singh', phone: '+91 97112 34567' },
      { name: 'Ankit Patel', phone: '+91 99887 76655' }
    ];
  }

  async createDeliveryOrder({ orderId, orderNumber, customerName, customerPhone, dropAddress }) {
    const driver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
    const trackingCode = 'CTE-EXP-' + Math.floor(100000 + Math.random() * 900000);
    const etaMinutes = 20 + Math.floor(Math.random() * 15);

    return {
      provider: this.name,
      trackingCode,
      driverName: driver.name,
      driverPhone: driver.phone,
      pickupAddress: this.pickupAddress,
      dropAddress,
      etaMinutes,
      status: 'driver_assigned',
      currentLat: 12.9716 + (Math.random() - 0.5) * 0.02,
      currentLng: 77.5946 + (Math.random() - 0.5) * 0.02
    };
  }

  async getTrackingDetails(trackingCode) {
    return {
      trackingCode,
      status: 'in_transit',
      updatedAt: new Date().toISOString()
    };
  }

  async cancelDelivery(trackingCode, reason) {
    return {
      trackingCode,
      cancelled: true,
      reason
    };
  }
}

// Active provider instance (can be swapped in production via process.env.DELIVERY_PROVIDER)
const activeProvider = new DevelopmentDeliveryProvider();

class DeliveryIntegrationService {
  /**
   * Dispatches a new delivery order to the active delivery provider
   */
  static async dispatchOrder(order, dropAddress) {
    try {
      const deliveryData = await activeProvider.createDeliveryOrder({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        dropAddress
      });

      const res = await query.run(
        `INSERT INTO delivery_orders (
          order_id, provider, driver_name, driver_phone, tracking_code, pickup_address, drop_address, current_lat, current_lng, status, eta_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          deliveryData.provider,
          deliveryData.driverName,
          deliveryData.driverPhone,
          deliveryData.trackingCode,
          deliveryData.pickupAddress,
          deliveryData.dropAddress,
          deliveryData.currentLat,
          deliveryData.currentLng,
          deliveryData.status,
          deliveryData.etaMinutes
        ]
      );

      return { id: res.lastID, ...deliveryData };
    } catch (err) {
      console.error('Failed to dispatch order with delivery provider:', err);
      return null;
    }
  }

  static async getOrderDelivery(orderId) {
    return await query.get(`SELECT * FROM delivery_orders WHERE order_id = ?`, [orderId]);
  }

  static async updateStatus(orderId, status) {
    return await query.run(
      `UPDATE delivery_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
      [status, orderId]
    );
  }
}

module.exports = {
  DeliveryIntegrationService,
  BaseDeliveryProvider
};
