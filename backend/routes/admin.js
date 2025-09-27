const express = require('express');
const User = require('../models/user');
const Contact = require('../models/contact');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/admin');

const router = express.Router();

// All admin routes require authentication first
router.use(authenticateToken);

// Get all users (admin only)
router.get('/users', authenticateAdmin, (req, res) => {
  try {
    const users = User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const deleted = User.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contacts (admin only)
router.get('/contacts', authenticateAdmin, (req, res) => {
  try {
    const contacts = Contact.getAll();
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact (admin only)
router.delete('/contacts/:id', authenticateAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const deleted = Contact.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
