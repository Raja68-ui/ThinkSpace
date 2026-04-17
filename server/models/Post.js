const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  imageUrl: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    enum: ['General', 'Tech', 'News', 'Question', 'Debate'],
    default: 'General'
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['Spam', 'Violence', 'Hatred', 'Inappropriate Language', 'Other'],
      default: 'Other'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
