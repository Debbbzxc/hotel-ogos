const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123!', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // 1. Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    // 2. Check duplicate email
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // 3. Check duplicate username
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'This username is already taken.' });
    }

    // 4. Create User
    const user = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: 'guest' // default role is guest
    });

    if (user) {
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data provided.' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body; // username can be username or email

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email and Password are required.' });
    }

    // Find by username OR email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all users list (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/auth/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['guest', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot demote yourself from admin.' });
    }
    user.role = role;
    await user.save();
    return res.json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile (Admin only)
 * @route   PUT /api/auth/users/:id
 * @access  Private/Admin
 */
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, username, email } = req.body;
    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use.' });
      }
    }
    if (username.toLowerCase() !== user.username.toLowerCase()) {
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username already in use.' });
      }
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username.toLowerCase();
    user.email = email.toLowerCase();

    await user.save();
    return res.json({
      success: true,
      message: 'User profile updated successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const Reservation = require('../models/Reservation');
    const activeReservation = await Reservation.findOne({
      user: user._id,
      'paymentDetails.status': { $in: ['paid', 'pending'] }
    });
    if (activeReservation) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user. They have active reservations. Please cancel their reservations first.'
      });
    }

    await User.findByIdAndDelete(user._id);
    return res.json({ success: true, message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRole,
  updateUserProfile,
  deleteUser
};
