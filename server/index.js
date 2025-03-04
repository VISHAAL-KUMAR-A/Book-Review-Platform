const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./db.js");
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
