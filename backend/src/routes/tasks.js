const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

// Get all tasks for a project with filtering and search
router.get('/projects/:id/tasks', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 10 } = req.query;
    
    let filter = { project: req.params.id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'fullName email')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: tasks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks assigned to logged-in user
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'title')
      .populate('assignedTo', 'fullName email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, priority, project } = req.body;
    const task = new Task({ title, priority, project });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status only
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign task to a member
router.patch('/:id/assign', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.userId },
      { new: true }
    ).populate('assignedTo', 'fullName email');
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;




