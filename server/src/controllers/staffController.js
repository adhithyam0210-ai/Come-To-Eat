const bcrypt = require('bcryptjs');
const { query } = require('../database');

class StaffController {
  /**
   * Admin: List all staff employees with assigned and pending branch
   */
  static async getEmployees(req, res) {
    try {
      const employees = await query.all(
        `SELECT a.id, a.name, a.email, a.role, a.branch_id, a.pending_branch_id, a.transfer_status, a.created_at,
                b.name AS branch_name, b.code AS branch_code,
                pb.name AS pending_branch_name
         FROM admins a
         LEFT JOIN branches b ON a.branch_id = b.id
         LEFT JOIN branches pb ON a.pending_branch_id = pb.id
         WHERE a.role = 'employee'
         ORDER BY a.id ASC`
      );
      res.json({ success: true, employees });
    } catch (err) {
      console.error('getEmployees error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch employee list.' });
    }
  }

  /**
   * Admin: Create new staff employee credentials with assigned branch
   */
  static async createEmployee(req, res) {
    try {
      const { name, email, password, branch_id } = req.body;
      if (!name || !email || !password || !branch_id) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and assigned branch are required.'
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if email already registered
      const existingAdmin = await query.get('SELECT id FROM admins WHERE LOWER(email) = ?', [cleanEmail]);
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      const existingUser = await query.get('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'A customer account with this email already exists.' });
      }

      // Verify branch exists
      const branch = await query.get('SELECT id, name FROM branches WHERE id = ?', [Number(branch_id)]);
      if (!branch) {
        return res.status(404).json({ success: false, message: 'Specified branch not found.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await query.run(
        `INSERT INTO admins (name, email, password, role, branch_id, transfer_status)
         VALUES (?, ?, ?, 'employee', ?, 'none')`,
        [name.trim(), cleanEmail, hashedPassword, Number(branch_id)]
      );

      const newEmp = await query.get(
        `SELECT a.id, a.name, a.email, a.role, a.branch_id, a.transfer_status, a.created_at,
                b.name AS branch_name
         FROM admins a
         LEFT JOIN branches b ON a.branch_id = b.id
         WHERE a.id = ?`,
        [result.lastID]
      );

      res.status(201).json({
        success: true,
        message: `Employee account created successfully for ${newEmp.name} at ${branch.name}.`,
        employee: newEmp
      });
    } catch (err) {
      console.error('createEmployee error:', err);
      res.status(500).json({ success: false, message: 'Failed to create employee account.' });
    }
  }

  /**
   * Admin: Initiate branch transfer with two-way verification workflow
   */
  static async initiateTransfer(req, res) {
    try {
      const employeeId = Number(req.params.id);
      const targetBranchId = req.body.new_branch_id || req.body.branch_id;

      if (!targetBranchId) {
        return res.status(400).json({ success: false, message: 'Target branch is required.' });
      }

      const employee = await query.get('SELECT * FROM admins WHERE id = ? AND role = "employee"', [employeeId]);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }

      const newBranch = await query.get('SELECT id, name FROM branches WHERE id = ?', [Number(targetBranchId)]);
      if (!newBranch) {
        return res.status(404).json({ success: false, message: 'Target branch does not exist.' });
      }

      if (employee.branch_id === Number(targetBranchId)) {
        return res.status(400).json({ success: false, message: 'Employee is already assigned to this branch.' });
      }

      // Set pending transfer status requiring employee side confirmation
      await query.run(
        `UPDATE admins 
         SET pending_branch_id = ?, transfer_status = 'pending_employee_confirmation'
         WHERE id = ?`,
        [Number(targetBranchId), employeeId]
      );

      res.json({
        success: true,
        message: `Transfer initiated to ${newBranch.name}. Awaiting two-way confirmation from employee on their portal.`
      });
    } catch (err) {
      console.error('initiateTransfer error:', err);
      res.status(500).json({ success: false, message: 'Failed to initiate branch transfer.' });
    }
  }

  /**
   * Admin: Cancel pending transfer
   */
  static async cancelTransfer(req, res) {
    try {
      const employeeId = Number(req.params.id);
      await query.run(
        `UPDATE admins SET pending_branch_id = NULL, transfer_status = 'none' WHERE id = ?`,
        [employeeId]
      );
      res.json({ success: true, message: 'Pending branch transfer cancelled.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to cancel transfer.' });
    }
  }

  /**
   * Employee: Confirm & accept branch transfer (Two-way verification Step 2)
   */
  static async confirmTransfer(req, res) {
    try {
      const employeeId = req.user.id;
      const employee = await query.get('SELECT * FROM admins WHERE id = ? AND role = "employee"', [employeeId]);

      if (!employee || !employee.pending_branch_id) {
        return res.status(400).json({ success: false, message: 'No pending transfer request found.' });
      }

      const targetBranch = await query.get('SELECT id, name, code FROM branches WHERE id = ?', [employee.pending_branch_id]);

      // Complete transfer
      await query.run(
        `UPDATE admins 
         SET branch_id = pending_branch_id, pending_branch_id = NULL, transfer_status = 'confirmed'
         WHERE id = ?`,
        [employeeId]
      );

      res.json({
        success: true,
        message: `Branch location transfer confirmed! You are now operating from ${targetBranch?.name || 'new station'}.`,
        branch_id: employee.pending_branch_id,
        branch_name: targetBranch?.name
      });
    } catch (err) {
      console.error('confirmTransfer error:', err);
      res.status(500).json({ success: false, message: 'Failed to confirm branch transfer.' });
    }
  }

  /**
   * Employee: Decline branch transfer
   */
  static async declineTransfer(req, res) {
    try {
      const employeeId = req.user.id;
      await query.run(
        `UPDATE admins SET pending_branch_id = NULL, transfer_status = 'declined' WHERE id = ?`,
        [employeeId]
      );
      res.json({ success: true, message: 'Transfer request declined.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to decline transfer.' });
    }
  }
}

module.exports = StaffController;
