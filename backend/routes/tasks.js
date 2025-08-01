const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user (with optional project filter)
router.get('/', auth, async (req, res) => {
  try {
    const { project } = req.query;
    let query = { owner: req.user.id };
    
    if (project) {
      query.project = project;
    }
    
    const tasks = await Task.find(query).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      project: req.params.projectId,
      owner: req.user.id 
    }).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tâches du projet', error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user.id });
  await task.save();
  res.json(task);
});

// Update task
router.put('/:id', auth, async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
  res.json(task);
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    task.comments.push({
      user: req.user.id,
      content: content
    });
    
    await task.save();
    await task.populate('comments.user', 'name email');
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire', error: error.message });
  }
});

// Get task comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id })
      .populate('comments.user', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json(task.comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error: error.message });
  }
});

// Update subtask
router.put('/:id/subtasks/:subtaskId', auth, async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Sous-tâche non trouvée' });
    }

    subtask.completed = completed;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la sous-tâche', error: error.message });
  }
});

// Assign task to users
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { assignedTo } = req.body; // Array of user IDs
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { assignedTo: assignedTo },
      { new: true }
    ).populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'assignation', error: error.message });
  }
});

module.exports = router;
