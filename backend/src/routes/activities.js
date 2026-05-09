const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const auth = require('../middleware/authMiddleware');

// Get activities for a project
router.get('/projects/:id/activities', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Log activity (internal use)
router.post('/', auth, async (req, res) => {
  try {
    const { type, project, description } = req.body;
    const activity = new Activity({
      type,
      project,
      user: req.user.id,
      description
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;



