const { body, query, param } = require('express-validator');

const createBookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author name must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required')
    .matches(/^[\d-]{10,17}$/)
    .withMessage('Invalid ISBN format'),
  
  body('genre')
    .trim()
    .notEmpty()
    .withMessage('Genre is required'),
  
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const getBookValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid book ID')
];

const getBooksValidation = [
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
  createBookValidation,
  getBookValidation,
  getBooksValidation
}; 