const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
require('dotenv').config();

// Import database to initialize tables
const db = require('./backend/config/database');

const authRoutes = require('./backend/routes/auth');
const contactRoutes = require('./backend/routes/contacts');
const dashboardRoutes = require('./backend/routes/dashboard');
const contactFormRoutes = require('./backend/routes/contact-form');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    upload.single('profile_image')(req, res, next);
  } else {
    next();
  }
}, contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', contactFormRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve the main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacts.html'));
});

app.get('/add-contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'add-contact.html'));
});

app.get('/contact-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact-detail.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

 app.listen(PORT, () => {
   console.log(`Frontend server running on http://localhost:${PORT}`);
 });