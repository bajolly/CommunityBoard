const express = require('express');
const { body, validationResult } = require('express-validator');
const Story = require('../models/Story');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'fullname')
      .populate('comments.author', 'fullname')
      .sort({ createdAt: -1 });
    
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching stories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'fullname')
      .populate('comments.author', 'fullname');
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching story' });
  }
});

router.post('/', authenticateToken, requireRole(['editor', 'admin']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;

    const story = new Story({
      title,
      content,
      author: req.user._id
    });

    await story.save();
    await story.populate('author', 'fullname');

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating story' });
  }
});

router.put('/:id', authenticateToken, requireRole(['editor', 'admin']), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this story' });
    }

    const { title, content } = req.body;
    
    if (title) story.title = title;
    if (content) story.content = content;
    
    await story.save();
    await story.populate('author', 'fullname');

    res.json(story);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating story' });
  }
});

router.delete('/:id', authenticateToken, requireRole(['editor', 'admin']), async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting story' });
  }
});

router.post('/:id/comments', authenticateToken, [
  body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const comment = {
      author: req.user._id,
      content: req.body.content
    };

    story.comments.push(comment);
    await story.save();
    await story.populate('comments.author', 'fullname');

    const newComment = story.comments[story.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

module.exports = router;