const axios = require('axios');

class LlamaService {
  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      this.isAvailable = true;
      console.log('✅ Ollama est disponible');
      
      // Vérifier si le modèle est installé
      const models = response.data.models || [];
      const modelExists = models.some(m => m.name.includes(this.model.split(':')[0]));
      
      if (!modelExists) {
        console.log(`⚠️  Modèle ${this.model} non trouvé. Tentative de téléchargement...`);
        await this.pullModel();
      }
    } catch (error) {
      this.isAvailable = false;
      console.log('❌ Ollama non disponible:', error.message);
      console.log('💡 Pour installer Ollama: https://ollama.ai/download');
    }
  }

  async pullModel() {
    try {
      console.log(`📥 Téléchargement du modèle ${this.model}...`);
      await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: this.model
      });
      console.log(`✅ Modèle ${this.model} téléchargé avec succès`);
    } catch (error) {
      console.error(`❌ Erreur lors du téléchargement du modèle:`, error.message);
    }
  }

  async generateResponse(messages, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Ollama n\'est pas disponible. Veuillez l\'installer et le démarrer.');
    }

    try {
      // Convertir les messages au format Ollama
      const prompt = this.formatMessages(messages);
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 500
        }
      });

      return response.data.response;
    } catch (error) {
      console.error('Erreur Ollama:', error.message);
      throw new Error(`Erreur lors de la génération de la réponse: ${error.message}`);
    }
  }

  formatMessages(messages) {
    // Convertir les messages en format de prompt pour Ollama
    let prompt = '';
    
    messages.forEach(message => {
      if (message.role === 'system') {
        prompt += `Système: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `Utilisateur: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    });
    
    prompt += 'Assistant: ';
    return prompt;
  }

  // Méthodes spécialisées pour la gestion de tâches
  async generateSubtasks(taskDescription) {
    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant spécialisé dans la gestion de tâches. Génère une liste de sous-tâches claires et actionables.'
      },
      {
        role: 'user',
        content: `Génère 3-5 sous-tâches pour cette tâche: "${taskDescription}". Réponds uniquement avec une liste numérotée, sans texte supplémentaire.`
      }
    ];

    return await this.generateResponse(messages, { max_tokens: 200 });
  }

  async rephraseTask(taskDescription) {
    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant qui aide à reformuler les tâches pour les rendre plus claires et actionables.'
      },
      {
        role: 'user',
        content: `Reformule cette tâche pour la rendre plus claire et précise: "${taskDescription}". Réponds uniquement avec la tâche reformulée.`
      }
    ];

    return await this.generateResponse(messages, { max_tokens: 100 });
  }

  async analyzeTask(taskDescription) {
    const messages = [
      {
        role: 'system',
        content: 'Tu es un expert en gestion de projet. Analyse les tâches et fournis des recommandations sur la priorité et l\'estimation du temps.'
      },
      {
        role: 'user',
        content: `Analyse cette tâche et fournis: 1) Priorité recommandée (low/medium/high), 2) Estimation du temps en heures, 3) Brève justification. Tâche: "${taskDescription}"`
      }
    ];

    return await this.generateResponse(messages, { max_tokens: 150 });
  }

  async chatResponse(messages) {
    const systemMessage = {
      role: 'system',
      content: 'Tu es un assistant IA spécialisé dans la gestion de tâches et de projets. Tu aides les utilisateurs à organiser leur travail, planifier leurs projets et optimiser leur productivité. Réponds de manière concise et utile.'
    };

    const fullMessages = [systemMessage, ...messages];
    return await this.generateResponse(fullMessages);
  }
}

module.exports = new LlamaService();