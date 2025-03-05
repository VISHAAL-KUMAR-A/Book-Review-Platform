const { body, query } = require('express-validator');

const createReviewValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required'),
    // .isMongoId()
    // .withMessage('Invalid book ID')
  
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
];

const getReviewsValidation = [
  query('bookId')
    .optional(),
    // .isMongoId()
    // .withMessage('Invalid book ID'),
  
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

module.exports = {
  createReviewValidation,
  getReviewsValidation
}; 