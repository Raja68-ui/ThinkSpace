const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Apply auth and admin middleware to all routes in this file
router.use(auth, admin);

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/ban
// @desc    Toggle user active status (ban/unban)
// @access  Private/Admin
router.put('/users/:id/ban', async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent banning yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot ban yourself' });
    }
    
    // Prevent banning other admins
    if (user.role === 'admin') {
       return res.status(400).json({ message: 'Cannot ban another admin' });
    }

    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ message: `User account ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user completely
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
       return res.status(400).json({ message: 'Cannot delete another admin' });
    }

    await user.deleteOne();
    
    // Ideally, also delete user's posts and comments, handled separately or via DB cascading in real apps
    res.json({ message: 'User removed completely' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
