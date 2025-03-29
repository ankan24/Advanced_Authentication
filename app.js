const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Routes
app.use('/', require('./routes/authRoutes'));

// Home route redirects to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});