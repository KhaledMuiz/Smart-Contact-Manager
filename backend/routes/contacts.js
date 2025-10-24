const express = require('express');
const Contact = require('../models/contact');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all contacts for user
router.get('/', (req, res) => {
  try {
    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const contacts = Contact.findByUserId(userId);
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single contact by id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.user.id, 10);
    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    console.log(`User ${userId} requesting contact ${id}`);
    const contact = Contact.findById(id);
    if (!contact) {
      console.log(`Contact ${id} not found`);
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (contact.user_id != userId) {
      console.log(`Contact ${id} access denied for user ${userId}`);
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new contact
router.post('/', (req, res) => {
  try {
    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const { name, email, phone, address, category, is_favorite, notes } = req.body;
    let profile_image = null;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Handle profile_image from file upload or body
    if (req.file) {
      profile_image = req.file.filename;
    } else if (req.body.existing_image !== undefined) {
      profile_image = req.body.existing_image || null;
    } else if (req.body.profile_image) {
      profile_image = req.body.profile_image;
    }

    const contactId = Contact.create({
      user_id: userId,
      name,
      email,
      phone,
      address,
      category,
      is_favorite,
      notes,
      profile_image
    });

    const newContact = Contact.findById(contactId);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.user.id, 10);
    const updates = req.body;

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    if (!updates.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if contact belongs to user
    const contact = Contact.findById(id);
    if (!contact || contact.user_id != userId) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Handle profile_image from file upload or body
    if (req.file) {
      updates.profile_image = req.file.filename;
    } else if (updates.existing_image !== undefined) {
      updates.profile_image = updates.existing_image || null;
      delete updates.existing_image; // Remove from updates
    } else if (updates.profile_image === undefined) {
      updates.profile_image = contact.profile_image || null;
    }

    const updated = Contact.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = Contact.findById(id);
    res.json(updatedContact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Check if contact belongs to user
    const contact = Contact.findById(id);
    if (!contact || contact.user_id != userId) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const newFavorite = contact.is_favorite ? 0 : 1;
    const updated = Contact.update(id, { is_favorite: Number(newFavorite) }); // ensure integer
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = Contact.findById(id);
    res.json(updatedContact);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // Check if contact belongs to user
    const contact = Contact.findById(id);
    if (!contact || contact.user_id != userId) {
      return res.status(404).json({ error: 'Contact not found' });
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
