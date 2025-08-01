// Script d'initialisation MongoDB
db = db.getSiblingDB('ai_task_manager');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ai_task_manager'
    }
  ]
});

// Créer les collections avec des index
db.createCollection('users');
db.createCollection('projects');
db.createCollection('tasks');
db.createCollection('chats');
db.createCollection('notifications');

// Créer des index pour optimiser les performances
db.users.createIndex({ email: 1 }, { unique: true });
db.projects.createIndex({ owner: 1 });
db.tasks.createIndex({ project: 1 });
db.tasks.createIndex({ assignedTo: 1 });
db.chats.createIndex({ user: 1 });
db.notifications.createIndex({ user: 1 });

print('Base de données AI Task Manager initialisée avec succès !');