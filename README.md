# 🚀 Plateforme de Gestion de Tâches Intelligente (AI Task Manager)

Une application MERN complète avec IA locale pour la gestion de projets et de tâches.

## ✨ Fonctionnalités

### 🎯 Gestion des Tâches
- **Kanban Board** interactif avec drag & drop
- **Détails complets** des tâches avec commentaires
- **Sous-tâches** avec suivi de progression
- **Priorités** et dates d'échéance
- **Labels** et catégorisation
- **Assignation** aux membres du projet

### 🤖 Intelligence Artificielle Locale
- **Ollama** intégré (pas besoin de clés API externes)
- **Génération automatique** de sous-tâches
- **Reformulation** intelligente des tâches
- **Analyse** de priorité et estimation du temps
- **Chatbot** d'assistance

### 📊 Gestion de Projets
- **Projets multiples** avec membres
- **Statistiques** détaillées et métriques
- **Rapports** de progression
- **Gestion des rôles** (admin, membre, viewer)

### 🔔 Notifications
- **Notifications en temps réel**
- **Alertes** pour les tâches en retard
- **Suivi** des tâches prioritaires

## 🛠️ Installation

### Prérequis
- Node.js (v16+)
- MongoDB
- Git

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd "Plateforme de gestion de tâches intelligente (AI Task Manager)"
```

### 2. Installer Ollama (IA Locale)
```powershell
# Sur Windows (PowerShell en tant qu'administrateur)
.\install-ollama.ps1
```

Ou manuellement :
1. Télécharger Ollama : https://ollama.ai/download
2. Installer et démarrer : `ollama serve`
3. Télécharger le modèle : `ollama pull llama3.2:3b`

### 3. Configuration Backend
```bash
cd backend
npm install
```

Créer le fichier `.env` :
```env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=votre_secret_jwt_super_securise
PORT=5000

# Configuration Ollama (IA locale)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Optionnel : APIs externes (si Ollama indisponible)
# OPENAI_API_KEY=votre_cle_openai
# DEEPSEEK_API_KEY=votre_cle_deepseek
```

### 4. Configuration Frontend
```bash
cd ../frontend
npm install
```

### 5. Démarrage
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Ollama (si pas démarré automatiquement)
ollama serve
```

L'application sera accessible sur : http://localhost:3000

## 🐳 Installation avec Docker (Recommandée)

### Prérequis Docker
- Docker Desktop installé et démarré
- Git

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd "Plateforme de gestion de tâches intelligente (AI Task Manager)"
```

### 2. Installer Ollama (IA Locale) - Optionnel
```powershell
# Sur Windows (PowerShell en tant qu'administrateur)
.\install-ollama.ps1
```

Ou manuellement :
1. Télécharger Ollama : https://ollama.ai/download
2. Installer et démarrer : `ollama serve`
3. Télécharger le modèle : `ollama pull llama3.2:3b`

### 3. Démarrage avec Docker
```bash
# Construire et démarrer tous les services
docker-compose up --build -d

# Ou démarrer service par service (si problème de build)
docker-compose up mongodb -d
docker-compose up backend --build -d
docker-compose up frontend --build -d
```

### 4. Vérifier le déploiement
```bash
# Voir le statut des conteneurs
docker ps

# Voir les logs
docker-compose logs -f
```

### 🌐 Accès aux services Docker
- **Application Frontend** : http://localhost:3000
- **API Backend** : http://localhost:5000
- **MongoDB** : localhost:27017

### 🔧 Commandes Docker utiles
```bash
# Arrêter tous les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Reconstruire complètement
docker-compose down
docker-compose up --build -d

# Nettoyer complètement Docker
docker system prune -af --volumes
```

### 📊 Architecture Docker
```
├── MongoDB (Port 27017)
│   ├── Base de données : ai_task_manager
│   ├── Utilisateur : admin/password123
│   └── Volume persistant : mongodb_data
├── Backend (Port 5000)
│   ├── Node.js + Express
│   ├── Connexion MongoDB automatique
│   └── Intégration Ollama via host.docker.internal
└── Frontend (Port 3000)
    ├── React + Design moderne
    ├── Connexion API automatique
    └── Hot reload activé
```

## 🎮 Utilisation

### Première utilisation
1. **Créer un compte** ou se connecter
2. **Créer un projet** avec le bouton vert
3. **Ajouter des tâches** avec le bouton bleu
4. **Cliquer sur une tâche** pour voir les détails complets

### Fonctionnalités IA
- **Génération de sous-tâches** : Cliquez sur "✨ Générer avec IA" dans les détails d'une tâche
- **Reformulation** : Utilisez le bouton "✨" à côté du titre
- **Analyse** : Bouton "🤖 Analyser avec IA" pour obtenir des recommandations
- **Chat** : Utilisez le chatbot en bas à droite

### Gestion de projet
- **Sélectionner un projet** : Cliquez sur un projet dans la liste
- **Voir les statistiques** : Activez/désactivez avec le bouton "📊"
- **Ajouter des membres** : (Fonctionnalité backend prête, interface à venir)

## 🏗️ Architecture

### Structure du projet
```
├── backend/
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── services/        # Service Ollama
│   ├── middleware/      # Authentification
│   ├── Dockerfile       # Configuration Docker Backend
│   └── server.js        # Serveur Express
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── Kanban.js    # Board principal (Design moderne)
│   │   ├── TaskDetail.js # Détails des tâches
│   │   ├── ProjectStats.js # Dashboard avec statistiques
│   │   └── ChatBot.js   # Chatbot style Messenger
│   ├── Dockerfile       # Configuration Docker Frontend
│   └── public/          # Assets statiques
├── docker-compose.yml   # Orchestration Docker
└── install-ollama.ps1   # Script d'installation IA
```

### Architecture Docker
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   MongoDB   │  │   Backend   │  │      Frontend       │  │
│  │   Port:     │  │   Port:     │  │      Port:          │  │
│  │   27017     │◄─┤   5000      │◄─┤      3000           │  │
│  │             │  │             │  │                     │  │
│  │ Database:   │  │ Express +   │  │ React + Modern UI   │  │
│  │ ai_task_    │  │ Node.js     │  │ + Chatbot Messenger │  │
│  │ manager     │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Ollama (Host)   │
                    │   Port: 11434     │
                    │   Model: llama3.2 │
                    └───────────────────┘
```

## 🔧 APIs Disponibles

### Tâches
- `GET /api/tasks` - Liste des tâches (avec filtre projet)
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche
- `POST /api/tasks/:id/comments` - Ajouter un commentaire
- `PUT /api/tasks/:id/assign` - Assigner des utilisateurs

### Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/:id/stats` - Statistiques du projet
- `POST /api/projects/:id/members` - Ajouter un membre

### IA (Ollama)
- `POST /api/ai/subtasks` - Générer des sous-tâches
- `POST /api/ai/rephrase` - Reformuler une tâche
- `POST /api/ai/analyze` - Analyser une tâche
- `POST /api/chat` - Chat avec l'IA

## 🚨 Dépannage

### Ollama ne fonctionne pas
```bash
# Vérifier le statut
curl http://localhost:11434/api/tags

# Redémarrer Ollama
ollama serve

# Retélécharger le modèle
ollama pull llama3.2:3b
```

### Erreurs de connexion MongoDB
```bash
# Démarrer MongoDB
mongod

# Ou avec Docker
docker run -d -p 27017:27017 mongo
```

### Port déjà utilisé
```bash
# Changer le port dans backend/.env
PORT=5001

# Ou tuer le processus
npx kill-port 5000
```

### 🐳 Problèmes Docker

#### Conteneurs qui ne démarrent pas
```bash
# Vérifier les logs d'erreur
docker-compose logs [service-name]

# Redémarrer un service spécifique
docker-compose restart [service-name]

# Reconstruire complètement
docker-compose down
docker-compose up --build -d
```

#### Problèmes de build
```bash
# Nettoyer le cache Docker
docker builder prune -af

# Construire service par service
docker-compose up mongodb -d
docker-compose up backend --build -d
docker-compose up frontend --build -d
```

#### Erreurs de connexion entre services
```bash
# Vérifier le réseau Docker
docker network ls
docker network inspect [network-name]

# Redémarrer avec nouveau réseau
docker-compose down
docker-compose up -d
```

#### Problèmes de volumes/données
```bash
# Supprimer les volumes (ATTENTION: perte de données)
docker-compose down -v

# Lister les volumes
docker volume ls

# Nettoyer les volumes orphelins
docker volume prune
```

#### MongoDB ne se connecte pas
```bash
# Vérifier les logs MongoDB
docker logs ai-task-manager-mongodb

# Se connecter manuellement à MongoDB
docker exec -it ai-task-manager-mongodb mongosh -u admin -p password123
```

## 🎯 Fonctionnalités à venir

- [ ] Interface de gestion des membres de projet
- [ ] Notifications push en temps réel
- [ ] Export de rapports PDF
- [ ] Intégration calendrier
- [ ] Mode hors ligne
- [ ] Application mobile

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

### Installation traditionnelle
1. Vérifiez la section dépannage ci-dessus
2. Consultez les logs du backend et frontend
3. Vérifiez que Ollama fonctionne : `ollama list`

### Installation Docker
1. Vérifiez que Docker Desktop est démarré
2. Consultez les logs : `docker-compose logs -f`
3. Vérifiez le statut : `docker ps`
4. Testez la connectivité : http://localhost:3000

### Logs utiles
```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker logs ai-task-manager-frontend
docker logs ai-task-manager-backend
docker logs ai-task-manager-mongodb
```

---

**Développé avec ❤️ en utilisant MERN Stack + Ollama**