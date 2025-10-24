const express = require('express');
const Contact = require('../models/contact');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    console.log('Dashboard request received');
    console.log('Auth header:', req.headers.authorization);
    console.log('req.user:', req.user);
    if (!req.user || !req.user.id) {
      console.error('No user or user ID in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      console.error('Invalid user ID:', req.user.id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    console.log('User ID:', userId);
    const stats = Contact.getStats(userId);
    console.log('Stats result:', stats);
    console.log('Sending stats response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    console.error(error.stack);
    const defaultStats = { total: 0, work: 0, personal: 0, favorites: 0 };
    console.log('Sending default stats due to error:', defaultStats);
    res.json(defaultStats);
  }
});

module.exports = router;

