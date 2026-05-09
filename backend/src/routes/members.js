const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Invite member by email
router.post('/:projectId/members', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.projectId, 
      owner: req.user.id 
    });
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (!project.members) project.members = [];
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'Membre déjà ajouté' });
    }

    project.members.push(user._id);
    await project.save();

    res.json({ message: 'Membre ajouté avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove member
router.delete('/:projectId/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.projectId, 
      owner: req.user.id 
    });
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

    project.members = project.members.filter(
      m => m.toString() !== req.params.userId
    );
    await project.save();

    res.json({ message: 'Membre retiré avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get project members
router.get('/:projectId/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members', 'fullName email');
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

    res.json(project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;



