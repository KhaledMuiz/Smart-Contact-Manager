const express = require('express');
const Contact = require('../models/contact');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    console.log('Dashboard request for user:', req.user);
    console.log('User ID:', req.user.id);
    const stats = Contact.getStats(req.user.id);
    console.log('Stats result:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

