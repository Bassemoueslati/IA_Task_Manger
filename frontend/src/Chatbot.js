import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const Chatbot = () => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour, comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setError('');
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messages: newMessages })
      });
      if (!res.ok) {
        let msg = 'Erreur serveur';
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.aiMessage }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Erreur: ${err.message}` }]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-button group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center relative"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🤖</span>
          
          {/* Badge de notification */}
          <div className="notification-badge absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          
          {/* Effet de pulsation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Conteneur principal style Messenger */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
        
        {/* En-tête du chat */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Assistant IA</h3>
              <p className="text-blue-100 text-sm">
                {loading ? 'En train d\'écrire...' : 'En ligne'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
              title={isMinimized ? 'Agrandir' : 'Réduire'}
            >
              <span className="text-white text-sm">
                {isMinimized ? '⬆️' : '⬇️'}
              </span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
              title="Fermer"
            >
              <span className="text-white text-sm">✕</span>
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 chat-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`message-animation flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`message-hover max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transition-all duration-200 ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600'
                  }`}>
                    {/* Avatar pour l'assistant */}
                    {m.role === 'assistant' && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs text-white">🤖</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{m.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Message utilisateur */}
                    {m.role === 'user' && (
                      <p className="text-sm leading-relaxed">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Indicateur de frappe */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">🤖</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Zone de saisie */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    disabled={loading}
                  />
                  
                  {/* Bouton emoji */}
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <span className="text-lg">😊</span>
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    loading || !input.trim()
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <span className="text-white text-lg">
                    {loading ? '⏳' : '🚀'}
                  </span>
                </button>
              </form>
              
              {/* Suggestions rapides */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Aide', 'Créer tâche', 'Statistiques', 'Conseils'].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
