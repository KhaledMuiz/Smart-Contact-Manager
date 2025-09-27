const db = require('../config/database');

// Create contacts table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT DEFAULT 'personal',
    is_favorite BOOLEAN DEFAULT 0,
    notes TEXT,
    profile_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Add notes column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE contacts ADD COLUMN notes TEXT`);
} catch (error) {
  // Column might already exist, ignore error
}

try {
  db.exec(`ALTER TABLE contacts ADD COLUMN profile_image TEXT`);
} catch (error) {
  // Column might already exist, ignore error
}

class Contact {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC');
    return stmt.all();
  }

  static create(contactData) {
    const { user_id, name, email, phone, address, category, is_favorite, notes, profile_image } = contactData;

    const stmt = db.prepare(`
      INSERT INTO contacts (user_id, name, email, phone, address, category, is_favorite, notes, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(user_id, name, email || null, phone || null, address || null, category || 'personal', is_favorite || 0, notes || null, profile_image || null);
    return result.lastInsertRowid;
  }

  static findByUserId(user_id) {
    const stmt = db.prepare('SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(user_id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
    return stmt.get(id);
  }

  static update(id, contactData) {
    const fields = [];
    const values = [];

    if (contactData.name !== undefined) {
      fields.push('name = ?');
      values.push(contactData.name);
    }
    if (contactData.email !== undefined) {
      fields.push('email = ?');
      values.push(contactData.email || null);
    }
    if (contactData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(contactData.phone || null);
    }
    if (contactData.address !== undefined) {
      fields.push('address = ?');
      values.push(contactData.address || null);
    }
    if (contactData.category !== undefined) {
      fields.push('category = ?');
      values.push(contactData.category || 'personal');
    }
    if (contactData.is_favorite !== undefined) {
      fields.push('is_favorite = ?');
      values.push(contactData.is_favorite || 0);
    }
    if (contactData.notes !== undefined) {
      fields.push('notes = ?');
      values.push(contactData.notes || null);
    }
    if (contactData.profile_image !== undefined) {
      fields.push('profile_image = ?');
      values.push(contactData.profile_image || null);
    }

    if (fields.length === 0) {
      return false; // No fields to update
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE contacts
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getStats(user_id) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM contacts WHERE user_id = ?');
    const favoritesStmt = db.prepare('SELECT COUNT(*) as favorites FROM contacts WHERE user_id = ? AND is_favorite = 1');
    const workStmt = db.prepare('SELECT COUNT(*) as work FROM contacts WHERE user_id = ? AND category = "work"');
    const personalStmt = db.prepare('SELECT COUNT(*) as personal FROM contacts WHERE user_id = ? AND category = "personal"');

    const total = totalStmt.get(user_id).total;
    const favorites = favoritesStmt.get(user_id).favorites;
    const work = workStmt.get(user_id).work;
    const personal = personalStmt.get(user_id).personal;

    return { total, favorites, work, personal };
  }
}

module.exports = Contact;
