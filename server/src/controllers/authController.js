const bcrypt = require('bcryptjs');
const { query } = require('../database');
const { generateToken } = require('../middleware/auth');

class AuthController {
  /**
   * Unified login for both Customers and Restaurant Admins.
   * Directly satisfies: "same login page for both user and admin"
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // 1. Check if the user is an Admin or Kitchen Employee
      const admin = await query.get(
        `SELECT a.*, b.name AS branch_name, b.code AS branch_code,
                pb.name AS pending_branch_name
         FROM admins a
         LEFT JOIN branches b ON a.branch_id = b.id
         LEFT JOIN branches pb ON a.pending_branch_id = pb.id
         WHERE LOWER(a.email) = ?`,
        [cleanEmail]
      );
      if (admin) {
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (passwordMatch) {
          const role = admin.role || 'admin';
          const token = generateToken({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: role,
            branch_id: admin.branch_id || 1
          });

          return res.json({
            success: true,
            message: role === 'employee' ? 'Kitchen Employee login successful' : 'Admin login successful',
            token,
            user: {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: role,
              branch_id: admin.branch_id || 1,
              branch_name: admin.branch_name || 'Indiranagar (Flagship)',
              branch_code: admin.branch_code || 'INDIRA',
              pending_branch_id: admin.pending_branch_id || null,
              pending_branch_name: admin.pending_branch_name || null,
              transfer_status: admin.transfer_status || 'none'
            },
            redirect: role === 'employee' ? '/employee' : '/admin'
          });
        }
      }

      // 2. Check if the user is a Customer
      const user = await query.get(`SELECT * FROM users WHERE LOWER(email) = ?`, [cleanEmail]);
      if (user) {
        if (user.is_blocked) {
          return res.status(403).json({
            success: false,
            message: 'Your account has been temporarily suspended. Please contact restaurant support.'
          });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: 'user'
          });

          return res.json({
            success: true,
            message: 'Welcome back to Come To Eat!',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: 'user'
            },
            redirect: '/'
          });
        }
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.'
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  }

  /**
   * Customer Registration
   */
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existingUser = await query.get(`SELECT id FROM users WHERE LOWER(email) = ?`, [cleanEmail]);
      const existingAdmin = await query.get(`SELECT id FROM admins WHERE LOWER(email) = ?`, [cleanEmail]);

      if (existingUser || existingAdmin) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await query.run(
        `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')`,
        [name.trim(), cleanEmail, hashedPassword, phone ? phone.trim() : null]
      );

      const userId = result.lastID;
      const token = generateToken({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        role: 'user'
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Come To Eat.',
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: cleanEmail,
          phone: phone ? phone.trim() : null,
          role: 'user'
        },
        redirect: '/'
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: 'Failed to create user account.' });
    }
  }

  /**
   * Fetch current authenticated user session
   */
  static async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      if (req.user.role === 'admin' || req.user.role === 'employee') {
        const admin = await query.get(
          `SELECT a.id, a.name, a.email, a.role, a.branch_id, a.pending_branch_id, a.transfer_status, a.created_at,
                  b.name AS branch_name, b.code AS branch_code,
                  pb.name AS pending_branch_name
           FROM admins a
           LEFT JOIN branches b ON a.branch_id = b.id
           LEFT JOIN branches pb ON a.pending_branch_id = pb.id
           WHERE a.id = ?`,
          [req.user.id]
        );
        return res.json({ success: true, user: admin });
      }

      const user = await query.get(
        `SELECT id, name, email, phone, role, is_blocked, created_at FROM users WHERE id = ?`,
        [req.user.id]
      );
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      res.json({ success: true, user });
    } catch (err) {
      console.error('Auth me error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }

  /**
   * Saved Addresses Management
   */
  static async getAddresses(req, res) {
    try {
      const addresses = await query.all(
        `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
        [req.user.id]
      );
      res.json({ success: true, addresses });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
    }
  }

  static async addAddress(req, res) {
    try {
      const { label, street, city, landmark, phone, is_default } = req.body;
      if (!street || !city || !phone) {
        return res.status(400).json({ success: false, message: 'Street, city, and contact phone are required.' });
      }

      if (is_default) {
        await query.run(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`, [req.user.id]);
      }

      const result = await query.run(
        `INSERT INTO addresses (user_id, label, street, city, landmark, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, label || 'Home', street, city, landmark || null, phone, is_default ? 1 : 0]
      );

      const newAddress = await query.get(`SELECT * FROM addresses WHERE id = ?`, [result.lastID]);
      res.status(201).json({ success: true, address: newAddress });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to save address.' });
    }
  }

  static async deleteAddress(req, res) {
    try {
      await query.run(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id]);
      res.json({ success: true, message: 'Address deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete address.' });
    }
  }
}

module.exports = { AuthController };
