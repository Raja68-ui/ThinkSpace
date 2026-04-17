const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

// @route   GET api/users/:id/profile
// @desc    Get user profile data including associated posts
// @access  Public
router.get('/:id/profile', async (req, res) => {
  try {
    // 1. Fetch user data (exclude password)
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Fetch all posts authored by this user
    const posts = await Post.find({ author: req.params.id })
                            .populate('author', 'username')
                            .sort({ createdAt: -1 });

    // 3. Return aggregated profile bundle
    res.json({ user, posts });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
