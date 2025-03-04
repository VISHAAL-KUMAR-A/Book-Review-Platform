const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../validations/authValidations');

// POST /auth/register - Register a new user
router.post('/register', validate(registerValidation), register);

// POST /auth/login - Login user
router.post('/login', validate(loginValidation), login);

module.exports = router; 