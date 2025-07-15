const express = require('express');
const { body, validationResult } = require('express-validator');
const BoardConfig = require('../models/BoardConfig');
const Story = require('../models/Story');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/config', authenticateToken, async (req, res) => {
  try {
    let config = await BoardConfig.findOne().populate('createdBy', 'fullname');
    
    if (!config) {
      const defaultLanes = [
        { id: '0', title: 'To Do', order: 0 },
        { id: '1', title: 'In Progress', order: 1 },
        { id: '2', title: 'Done', order: 2 }
      ];
      
      return res.json({ lanes: defaultLanes });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching board configuration' });
  }
});

router.put('/config', authenticateToken, requireRole(['admin']), [
  body('lanes').isArray().withMessage('Lanes must be an array'),
  body('lanes.*.id').notEmpty().withMessage('Lane ID is required'),
  body('lanes.*.title').notEmpty().withMessage('Lane title is required'),
  body('lanes.*.order').isNumeric().withMessage('Lane order must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lanes } = req.body;
    
    let oldConfig = await BoardConfig.findOne();
    const oldLanes = oldConfig ? oldConfig.lanes : [
      { id: '0', title: 'To Do', order: 0 },
      { id: '1', title: 'In Progress', order: 1 },
      { id: '2', title: 'Done', order: 2 }
    ];
    
    const newLanes = lanes.sort((a, b) => a.order - b.order);
    const newLaneIds = newLanes.map(lane => lane.id);
    
    const laneMapping = {};
    oldLanes.forEach((oldLane, index) => {
      if (newLaneIds.includes(oldLane.id)) {
        laneMapping[oldLane.id] = oldLane.id;
      } else {
        const newLaneByOrder = newLanes.find(newLane => newLane.order === oldLane.order);
        if (newLaneByOrder) {
          laneMapping[oldLane.id] = newLaneByOrder.id;
        } else {
          laneMapping[oldLane.id] = newLanes[0].id;
        }
      }
    });
    
    for (const [oldLaneId, newLaneId] of Object.entries(laneMapping)) {
      if (oldLaneId !== newLaneId) {
        const storiesInOldLane = await Story.find({ lane: oldLaneId });
        const basePosition = await Story.countDocuments({ lane: newLaneId });
        
        for (let i = 0; i < storiesInOldLane.length; i++) {
          storiesInOldLane[i].lane = newLaneId;
          storiesInOldLane[i].position = basePosition + i;
          await storiesInOldLane[i].save();
        }
      }
    }
    
    let config = oldConfig;
    if (!config) {
      config = new BoardConfig({
        lanes: newLanes,
        createdBy: req.user._id
      });
    } else {
      config.lanes = newLanes;
      config.createdBy = req.user._id;
    }
    
    await config.save();
    await config.populate('createdBy', 'fullname');
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating board configuration' });
  }
});

router.put('/stories/:id/move', authenticateToken, requireRole(['editor', 'admin']), [
  body('lane').notEmpty().withMessage('Lane is required'),
  body('position').isNumeric().withMessage('Position must be a number')
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

    const { lane, position } = req.body;
    
    if (lane !== story.lane) {
      const storiesInNewLane = await Story.find({ lane }).sort({ position: 1 });
      
      for (let i = position; i < storiesInNewLane.length; i++) {
        storiesInNewLane[i].position = i + 1;
        await storiesInNewLane[i].save();
      }
    } else {
      const oldPosition = story.position;
      if (position !== oldPosition) {
        if (position < oldPosition) {
          await Story.updateMany(
            { lane, position: { $gte: position, $lt: oldPosition } },
            { $inc: { position: 1 } }
          );
        } else {
          await Story.updateMany(
            { lane, position: { $gt: oldPosition, $lte: position } },
            { $inc: { position: -1 } }
          );
        }
      }
    }
    
    story.lane = lane;
    story.position = position;
    await story.save();
    await story.populate('author', 'fullname');
    await story.populate('comments.author', 'fullname');
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: 'Server error moving story' });
  }
});

module.exports = router;