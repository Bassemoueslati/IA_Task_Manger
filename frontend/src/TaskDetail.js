import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const TaskDetail = ({ task, onClose, onUpdate }) => {
  const { token } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingTask, setEditingTask] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedTime: task.estimatedTime || '',
    labels: (task.labels || []).join(', ')
  });
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  const handleSaveTask = async () => {
    try {
      const updatedTask = {
        ...editingTask,
        labels: editingTask.labels.split(',').map(l => l.trim()).filter(Boolean),
        dueDate: editingTask.dueDate || null,
        estimatedTime: editingTask.estimatedTime ? Number(editingTask.estimatedTime) : null,
        subtasks: subtasks
      };

      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const generateSubtasks = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: editingTask.title + ' ' + editingTask.description })
      });

      if (res.ok) {
        const data = await res.json();
        // Parser la réponse IA pour extraire les sous-tâches
        const aiSubtasks = data.subtasks.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+\.?\s*/, '').trim())
          .filter(line => line.length > 0)
          .map(title => ({ title, completed: false }));
        
        setSubtasks([...subtasks, ...aiSubtasks]);
      }
    } catch (error) {
      console.error('Erreur génération IA:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const rephraseTask = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: editingTask.title })
      });

      if (res.ok) {
        const data = await res.json();
        setEditingTask({ ...editingTask, title: data.rephrased });
      }
    } catch (error) {
      console.error('Erreur reformulation IA:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const analyzeTask = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: editingTask.title + ' ' + editingTask.description })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Analyse IA:\n${data.analysis}`);
      }
    } catch (error) {
      console.error('Erreur analyse IA:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Détails de la tâche</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations de base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="flex-1 border rounded-lg p-2"
                  />
                  <button
                    onClick={rephraseTask}
                    disabled={aiLoading}
                    className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    title="Reformuler avec IA"
                  >
                    ✨
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full border rounded-lg p-2 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priorité</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="todo">À faire</option>
                    <option value="in progress">En cours</option>
                    <option value="done">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date d'échéance</label>
                  <input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Temps estimé (h)</label>
                  <input
                    type="number"
                    value={editingTask.estimatedTime}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedTime: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Labels</label>
                <input
                  type="text"
                  value={editingTask.labels}
                  onChange={(e) => setEditingTask({ ...editingTask, labels: e.target.value })}
                  placeholder="Séparés par des virgules"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={analyzeTask}
                  disabled={aiLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  🤖 Analyser avec IA
                </button>
              </div>
            </div>

            {/* Colonne droite - Sous-tâches et commentaires */}
            <div className="space-y-6">
              {/* Sous-tâches */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Sous-tâches</h3>
                  <button
                    onClick={generateSubtasks}
                    disabled={aiLoading}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    ✨ Générer avec IA
                  </button>
                </div>
                
                <div className="space-y-2 mb-3">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(index)}
                        className="rounded"
                      />
                      <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => removeSubtask(index)}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Nouvelle sous-tâche"
                    className="flex-1 border rounded p-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Commentaires */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Commentaires</h3>
                
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {comments.map((comment, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {comment.user?.name || 'Utilisateur'} - {new Date(comment.createdAt).toLocaleString()}
                      </div>
                      <div>{comment.content}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 border rounded p-2"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveTask}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;