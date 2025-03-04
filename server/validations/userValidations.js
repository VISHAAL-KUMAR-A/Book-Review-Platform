const { body, param } = require('express-validator');

const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and hyphens'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
];

const getUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

module.exports = {
  updateUserValidation,
  getUserValidation
}; 