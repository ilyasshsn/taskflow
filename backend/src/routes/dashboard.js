const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Nombre de projets actifs
    const activeProjects = await Project.countDocuments({ 
      owner: userId, 
      status: 'actif' 
    });

    // Tâches assignées à l'utilisateur
    const assignedTasks = await Task.countDocuments({ 
      assignedTo: userId 
    });

    // Tâches terminées
    const completedTasks = await Task.countDocuments({ 
      assignedTo: userId, 
      status: 'terminé' 
    });

    // Tâches en retard
    const lateTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: 'terminé' },
      deadline: { $lt: new Date() }
    });

    // Tâches en cours triées par priorité
    const tasks = await Task.find({ 
      assignedTo: userId,
      status: 'en cours'
    })
    .populate('project', 'title')
    .sort({ priority: -1, createdAt: 1 });

    res.json({
      activeProjects,
      assignedTasks,
      completedTasks,
      lateTasks,
      tasks
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;





