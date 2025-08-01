const express = require('express');
const { OpenAI } = require('openai');
const llamaService = require('../services/llamaService');
const auth = require('../middleware/auth');

const router = express.Router();

// Utilisation dynamique de l'API (Llama local, OpenAI ou DeepSeek)
function getAIService() {
  // Priorité: Llama local > DeepSeek > OpenAI
  if (llamaService.isAvailable) {
    return { type: 'llama', service: llamaService };
  }
  
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      type: 'openai',
      instance: new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      }),
      model: 'deepseek-chat',
    };
  }
  
  if (process.env.OPENAI_API_KEY) {
    return {
      type: 'openai',
      instance: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: 'gpt-3.5-turbo',
    };
  }
  
  throw new Error('Aucun service IA disponible');
}

// Génération automatique de sous-tâches
router.post('/subtasks', auth, async (req, res) => {
  const { description } = req.body;
  try {
    const aiService = getAIService();
    let result;

    if (aiService.type === 'llama') {
      result = await aiService.service.generateSubtasks(description);
    } else {
      const completion = await aiService.instance.chat.completions.create({
        model: aiService.model,
        messages: [
          { role: 'system', content: 'Tu es un assistant de gestion de tâches.' },
          { role: 'user', content: `Génère une liste de sous-tâches pour : ${description}` },
        ],
        max_tokens: 200,
      });
      result = completion.choices[0].message.content;
    }

    res.json({ subtasks: result });
  } catch (err) {
    console.error('Erreur génération sous-tâches:', err);
    res.status(500).json({ message: 'Erreur IA', error: err.message });
  }
});

// Reformulation intelligente
router.post('/rephrase', auth, async (req, res) => {
  const { description } = req.body;
  try {
    const aiService = getAIService();
    let result;

    if (aiService.type === 'llama') {
      result = await aiService.service.rephraseTask(description);
    } else {
      const completion = await aiService.instance.chat.completions.create({
        model: aiService.model,
        messages: [
          { role: 'system', content: 'Tu es un assistant de gestion de tâches.' },
          { role: 'user', content: `Reformule cette tâche pour plus de clarté : ${description}` },
        ],
        max_tokens: 100,
      });
      result = completion.choices[0].message.content;
    }

    res.json({ rephrased: result });
  } catch (err) {
    console.error('Erreur reformulation:', err);
    res.status(500).json({ message: 'Erreur IA', error: err.message });
  }
});

// Analyse de priorité et estimation du temps
router.post('/analyze', auth, async (req, res) => {
  const { description } = req.body;
  try {
    const aiService = getAIService();
    let result;

    if (aiService.type === 'llama') {
      result = await aiService.service.analyzeTask(description);
    } else {
      const completion = await aiService.instance.chat.completions.create({
        model: aiService.model,
        messages: [
          { role: 'system', content: 'Tu es un assistant de gestion de tâches.' },
          { role: 'user', content: `Analyse la priorité et estime le temps pour : ${description}` },
        ],
        max_tokens: 100,
      });
      result = completion.choices[0].message.content;
    }

    res.json({ analysis: result });
  } catch (err) {
    console.error('Erreur analyse:', err);
    res.status(500).json({ message: 'Erreur IA', error: err.message });
  }
});

module.exports = router;
