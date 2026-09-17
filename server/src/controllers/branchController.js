const { query } = require('../database');

class BranchController {
  /**
   * Get all active branches (or all for admin)
   */
  static async getBranches(req, res) {
    try {
      const { all } = req.query;
      let sql = 'SELECT * FROM branches';
      if (!all) {
        sql += ' WHERE is_active = 1';
      }
      sql += ' ORDER BY id ASC';

      const branches = await query.all(sql);
      res.json({ success: true, branches });
    } catch (err) {
      console.error('getBranches error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch restaurant branches.' });
    }
  }

  /**
   * Get single branch by ID
   */
  static async getBranchById(req, res) {
    try {
      const { id } = req.params;
      const branch = await query.get('SELECT * FROM branches WHERE id = ?', [id]);
      if (!branch) {
        return res.status(404).json({ success: false, message: 'Branch not found.' });
      }
      res.json({ success: true, branch });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch branch details.' });
    }
  }

  /**
   * Admin: Update branch information
   */
  static async updateBranch(req, res) {
    try {
      const { id } = req.params;
      const { name, code, address, phone, is_active } = req.body;

      const existing = await query.get('SELECT * FROM branches WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Branch not found.' });
      }

      await query.run(
        `UPDATE branches SET 
          name = COALESCE(?, name),
          code = COALESCE(?, code),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [name, code, address, phone, is_active !== undefined ? is_active : existing.is_active, id]
      );

      const updated = await query.get('SELECT * FROM branches WHERE id = ?', [id]);
      res.json({ success: true, message: 'Branch updated successfully.', branch: updated });
    } catch (err) {
      console.error('updateBranch error:', err);
      res.status(500).json({ success: false, message: 'Failed to update branch.' });
    }
  }

  /**
   * Admin: Add new branch
   */
  static async createBranch(req, res) {
    try {
      const { name, code, address, phone } = req.body;
      if (!name || !code || !address) {
        return res.status(400).json({ success: false, message: 'Branch name, code, and address are required.' });
      }

      const result = await query.run(
        `INSERT INTO branches (name, code, address, phone, is_active) VALUES (?, ?, ?, ?, 1)`,
        [name.trim(), code.trim().toUpperCase(), address.trim(), phone || '']
      );

      const newBranch = await query.get('SELECT * FROM branches WHERE id = ?', [result.lastID]);
      res.status(201).json({ success: true, message: 'New branch added.', branch: newBranch });
    } catch (err) {
      console.error('createBranch error:', err);
      res.status(500).json({ success: false, message: 'Failed to create branch.' });
    }
  }

  /**
   * Admin: Delete branch outlet
   */
  static async deleteBranch(req, res) {
    try {
      const { id } = req.params;
      const existing = await query.get('SELECT * FROM branches WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Branch outlet not found.' });
      }

      // Check if this is the only branch left
      const countRow = await query.get('SELECT COUNT(*) as count FROM branches');
      if (countRow && countRow.count <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only remaining café branch outlet.' });
      }

      await query.run('DELETE FROM branches WHERE id = ?', [id]);
      res.json({ success: true, message: `Branch "${existing.name}" deleted successfully.` });
    } catch (err) {
      console.error('deleteBranch error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete branch outlet.' });
    }
  }
}

module.exports = { BranchController };
