require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Notification = require('./models/Notification');
const Chat = require('./models/Chat');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-task-manager';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');

  // Création d'un utilisateur test
  const password = await bcrypt.hash('test1234', 10);
  let user = await User.findOne({ email: 'test@demo.com' });
  if (!user) {
    user = await User.create({ name: 'Test User', email: 'test@demo.com', password });
    console.log('Utilisateur test créé');
  }

  // Création d'un projet test
  let project = await Project.findOne({ name: 'Projet Démo' });
  if (!project) {
    project = await Project.create({ name: 'Projet Démo', description: 'Projet de test', owner: user._id });
    console.log('Projet test créé');
  }

  // Création de tâches tests
  const taskCount = await Task.countDocuments({ owner: user._id });
  if (taskCount === 0) {
    await Task.create([
      { title: 'Tâche 1', description: 'Première tâche', owner: user._id, project: project._id, status: 'todo', labels: ['urgent'] },
      { title: 'Tâche 2', description: 'Deuxième tâche', owner: user._id, project: project._id, status: 'in progress', labels: ['normal'] },
      { title: 'Tâche 3', description: 'Troisième tâche', owner: user._id, project: project._id, status: 'done', labels: ['info'] },
    ]);
    console.log('Tâches tests créées');
  }

  // Notification test
  const notifCount = await Notification.countDocuments({ user: user._id });
  if (notifCount === 0) {
    await Notification.create({ user: user._id, message: 'Bienvenue sur la plateforme !' });
    console.log('Notification test créée');
  }

  // Chat test
  const chatCount = await Chat.countDocuments({ user: user._id });
  if (chatCount === 0) {
    await Chat.create({ user: user._id, messages: [{ role: 'assistant', content: 'Bonjour, comment puis-je vous aider ?' }] });
    console.log('Chat test créé');
  }

  console.log('Migration terminée.');
  process.exit();
}

migrate();
