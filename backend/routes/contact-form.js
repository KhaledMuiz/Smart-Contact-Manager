const express = require('express');
const router = express.Router();

// Handle contact form submission
router.post('/contact', (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    console.log('Contact form submission:', { firstName, lastName, email, phone, message });
    res.json({ success: true, message: 'Thank you for your message!' });
});

module.exports = router;
