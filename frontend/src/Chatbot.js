import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Chatbot = () => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour, comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
      <h2 className="font-bold mb-2">Chat IA</h2>
      <div className="h-48 overflow-y-auto mb-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={m.role === 'user' ? 'text-blue-600' : 'text-green-600'}>{m.content}</span>
          </div>
        ))}
        {loading && <div className="text-gray-400">Assistant écrit...</div>}
      </div>
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
      <form onSubmit={sendMessage} className="flex">
        <input className="flex-1 border rounded p-2 mr-2" value={input} onChange={e => setInput(e.target.value)} placeholder="Votre message..." />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
      </form>
    </div>
  );
};

export default Chatbot;
