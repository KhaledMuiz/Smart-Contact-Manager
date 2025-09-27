const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Create users table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

class User {
  static create(userData) {
    const { name, email, password, role = 'user' } = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, hashedPassword, role);
    return result.lastInsertRowid;
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  static getAllUsers() {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  static deleteById(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = User;
