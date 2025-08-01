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

```
├── backend/
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── services/        # Service Ollama
│   ├── middleware/      # Authentification
│   └── server.js        # Serveur Express
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── Kanban.js    # Board principal
│   │   ├── TaskDetail.js # Détails des tâches
│   │   └── ProjectStats.js # Statistiques
└── install-ollama.ps1   # Script d'installation IA
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
1. Vérifiez la section dépannage ci-dessus
2. Consultez les logs du backend et frontend
3. Vérifiez que Ollama fonctionne : `ollama list`

---

**Développé avec ❤️ en utilisant MERN Stack + Ollama**