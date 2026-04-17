const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID with comments
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comments = await Comment.find({ postId: req.params.id })
      .populate('user', 'username')
      .sort({ createdAt: 1 });
      
    res.json({ post, comments });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Filter = require('bad-words');
const filter = new Filter();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const newPost = new Post({
      title,
      description,
      category: category || 'General',
      author: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ""
    });

    if (filter.isProfane(title) || filter.isProfane(description)) {
      newPost.reports = [{ reason: 'Inappropriate Language' }];
    }

    const post = await newPost.save();
    const populatedPost = await Post.findById(post._id).populate('author', 'username');
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user (only author or admin can delete)
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne();
    
    // Also delete associated comments
    await Comment.deleteMany({ postId: req.params.id });

    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/:id/like
// @desc    Like a post
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post has already been liked by this user
    if (post.likes.filter(like => like.toString() === req.user.id).length > 0) {
      // Unlike it
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Add like
      post.likes.unshift(req.user.id);
      // Remove from dislikes if present
      post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes, dislikes: post.dislikes });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/:id/dislike
// @desc    Dislike a post
// @access  Private
router.put('/:id/dislike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post has already been disliked by this user
    if (post.dislikes.filter(dislike => dislike.toString() === req.user.id).length > 0) {
      // Undislike it
      post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== req.user.id);
    } else {
      // Add dislike
      post.dislikes.unshift(req.user.id);
      // Remove from likes if present
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes, dislikes: post.dislikes });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/:id/report
// @desc    Report a post
// @access  Private
router.put('/:id/report', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { reason } = req.body;
    const reportReason = reason || 'Other';

    // Check if the post has already been reported by this user
    if (post.reports && post.reports.filter(report => {
      // Handle both new schema (object with user) and old schema (just ObjectId)
      return (report.user && report.user.toString() === req.user.id) || (!report.user && report.toString() === req.user.id);
    }).length > 0) {
       return res.status(400).json({ message: 'You have already reported this post' });
    }

    if (!post.reports) {
      post.reports = [];
    }

    post.reports.unshift({ user: req.user.id, reason: reportReason });

    await post.save();
    res.json(post.reports);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
