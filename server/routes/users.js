const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateUserValidation, getUserValidation } = require('../validations/userValidations');

// GET /users/:id - Retrieve user profile
router.get('/:id', [auth, validate(getUserValidation)], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only allow users to view their own profile or admin users
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /users/:id - Update user profile
router.put('/:id', [auth, validate(updateUserValidation)], async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {
      username: req.body.username,
      email: req.body.email,
      bio: req.body.bio
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 