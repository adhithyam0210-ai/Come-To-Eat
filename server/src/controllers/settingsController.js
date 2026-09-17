const { query } = require('../database');

class SettingsController {
  /**
   * Get all restaurant settings (timings, delivery, contacts)
   * Publicly accessible for Navbar, Landing, Footer, and Admin
   */
  static async getSettings(req, res) {
    try {
      const rows = await query.all(`SELECT setting_key, setting_value FROM restaurant_settings`);
      const settings = {};
      rows.forEach(r => {
        settings[r.setting_key] = r.setting_value;
      });

      // Defaults if empty
      const response = {
        timing_text: settings.timing_text || 'Open Daily: 10:00 AM – 11:30 PM',
        days_open: settings.days_open || 'Monday – Sunday: 10:00 AM – 11:30 PM (No weekly off)',
        delivery_text: settings.delivery_text || 'Express 30 Min Delivery',
        contact_address: settings.contact_address || '100 Feet Rd, Indiranagar, Bengaluru, 560038',
        contact_phone: settings.contact_phone || '+91 98765 43210',
        contact_email: settings.contact_email || 'hello@cometoeat.com'
      };

      res.json({ success: true, settings: response });
    } catch (err) {
      console.error('getSettings error:', err);
      res.status(500).json({ success: false, message: 'Failed to load restaurant settings.' });
    }
  }

  /**
   * Update restaurant settings & timings
   * Admin only
   */
  static async updateSettings(req, res) {
    try {
      const allowedKeys = [
        'timing_text',
        'days_open',
        'delivery_text',
        'contact_address',
        'contact_phone',
        'contact_email'
      ];

      const updates = req.body;
      for (const [key, value] of Object.entries(updates)) {
        if (allowedKeys.includes(key) && typeof value === 'string') {
          await query.run(
            `INSERT INTO restaurant_settings (setting_key, setting_value, updated_at) 
             VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(setting_key) DO UPDATE SET 
               setting_value = excluded.setting_value,
               updated_at = CURRENT_TIMESTAMP`,
            [key, value.trim()]
          );
        }
      }

      // Return updated settings
      const rows = await query.all(`SELECT setting_key, setting_value FROM restaurant_settings`);
      const settings = {};
      rows.forEach(r => {
        settings[r.setting_key] = r.setting_value;
      });

      res.json({
        success: true,
        settings,
        message: 'Store timings and settings updated successfully.'
      });
    } catch (err) {
      console.error('updateSettings error:', err);
      res.status(500).json({ success: false, message: 'Failed to update restaurant settings.' });
    }
  }
}

module.exports = { SettingsController };
