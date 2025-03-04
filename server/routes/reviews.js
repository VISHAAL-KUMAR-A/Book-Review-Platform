const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewValidation, getReviewsValidation } = require('../validations/reviewValidations');

// GET /reviews - Retrieve reviews for a book or by a user
router.get('/', validate(getReviewsValidation), async (req, res) => {
  try {
    const bookId = req.query.bookId;
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on parameters
    const query = {};
    if (bookId) query.book = bookId;
    if (userId) query.user = userId;

    // If neither bookId nor userId is provided, return an error
    if (!bookId && !userId) {
      return res.status(400).json({ message: 'Either bookId or userId is required' });
    }

    const reviews = await Review.find(query)
      .populate('user', 'username')
      .populate('book', 'title author')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /reviews - Submit a new review
router.post('/', [auth, validate(createReviewValidation)], async (req, res) => {
  try {
    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      book: req.body.bookId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = new Review({
      book: req.body.bookId,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    const newReview = await review.save();
    await newReview.populate('user', 'username');
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 