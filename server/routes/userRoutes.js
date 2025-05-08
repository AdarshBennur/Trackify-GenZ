const express = require('express');
const { check } = require('express-validator');
const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteUser,
  getUsers
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail()
  ],
  updateUserProfile
);

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  updatePassword
);

// @route   DELETE /api/users
// @desc    Delete current user
// @access  Private
router.delete('/', deleteUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authorize('admin'), getUsers);

module.exports = router; 