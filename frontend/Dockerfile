# Frontend Dockerfile
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV CHOKIDAR_USEPOLLING=true
ENV REACT_APP_API_URL=http://localhost:5000

# Commande de démarrage
CMD ["npm", "start"]