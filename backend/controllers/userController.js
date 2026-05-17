const User = require('../models/User');

// @route  GET /api/users
// @access Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/users/members
// @access Private/Admin
const getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getMembers };
