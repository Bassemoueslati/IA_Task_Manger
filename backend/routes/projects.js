const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', 'name email')
      .populate('members.user', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des projets', error: error.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  const project = new Project({ ...req.body, owner: req.user.id });
  await project.save();
  res.json(project);
});

// Update project
router.put('/:id', auth, async (req, res) => {
  const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
  res.json(project);
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userEmail, role = 'member' } = req.body;
    const User = require('../models/User');
    
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = project.members.find(m => m.user.toString() === user._id.toString());
    if (existingMember) {
      return res.status(400).json({ message: 'Utilisateur déjà membre du projet' });
    }

    project.members.push({ user: user._id, role });
    await project.save();
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du membre', error: error.message });
  }
});

// Remove member from project
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du membre', error: error.message });
  }
});

// Get project statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const Task = require('../models/Task');
    
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const tasks = await Task.find({ project: req.params.id });
    
    const stats = {
      totalTasks: tasks.length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      inProgressTasks: tasks.filter(t => t.status === 'in progress').length,
      doneTasks: tasks.filter(t => t.status === 'done').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
      overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length,
      totalEstimatedTime: tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0),
      totalActualTime: tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
});

module.exports = router;
