const express = require('express');
const Chat = require('../models/Chat');
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

// Get chat history for user
router.get('/', auth, async (req, res) => {
  const chats = await Chat.find({ user: req.user.id });
  res.json(chats);
});

// Send a message to the chatbot and save the conversation
router.post('/', auth, async (req, res) => {
  const { messages } = req.body; // [{role, content}]
  try {
    const aiService = getAIService();
    let aiMessage;

    if (aiService.type === 'llama') {
      aiMessage = await aiService.service.chatResponse(messages);
    } else {
      const completion = await aiService.instance.chat.completions.create({
        model: aiService.model,
        messages,
        max_tokens: 200,
      });
      aiMessage = completion.choices[0].message.content;
    }

    // Save chat
    let chat = await Chat.findOne({ user: req.user.id });
    if (!chat) {
      chat = new Chat({ user: req.user.id, messages: [] });
    }
    chat.messages.push({ role: 'user', content: messages[messages.length-1].content });
    chat.messages.push({ role: 'assistant', content: aiMessage });
    await chat.save();
    res.json({ aiMessage, chat });
  } catch (err) {
    console.error('Erreur IA:', err);
    res.status(500).json({ message: 'Erreur IA', error: err.message });
  }
});

module.exports = router;
