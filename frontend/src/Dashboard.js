import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Dashboard = ({ selectedProject }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [editData, setEditData] = useState({ title: '', status: 'todo', labels: '' });

  useEffect(() => {
    const fetchData = async () => {
      let url = '/api/tasks';
      if (selectedProject) {
        url += `?project=${selectedProject}`;
      }
      const resTasks = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(await resTasks.json());
    };
    fetchData();
    // Synchronisation suppression depuis Kanban
    const onTaskDeleted = (e) => {
      setTasks(tasks => tasks.filter(t => t._id !== e.detail.id));
    };
    // Synchronisation ajout depuis Kanban
    const onTaskAdded = (e) => {
      setTasks(tasks => [...tasks, e.detail.task]);
    };
    // Synchronisation modification depuis Kanban
    const onTaskUpdated = (e) => {
      setTasks(tasks => tasks.map(t => t._id === e.detail.task._id ? e.detail.task : t));
    };
    window.addEventListener('taskDeleted', onTaskDeleted);
    window.addEventListener('taskAdded', onTaskAdded);
    window.addEventListener('taskUpdated', onTaskUpdated);
    return () => {
      window.removeEventListener('taskDeleted', onTaskDeleted);
      window.removeEventListener('taskAdded', onTaskAdded);
      window.removeEventListener('taskUpdated', onTaskUpdated);
    };
  }, [token, selectedProject]);

  const handleEditTask = (task) => {
    setEditTask(task);
    setEditData({
      title: task.title,
      status: task.status,
      labels: (task.labels || []).join(', ')
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/tasks/${editTask._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...editTask,
        title: editData.title,
        status: editData.status,
        labels: editData.labels.split(',').map(l => l.trim()).filter(Boolean)
      })
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t._id === updated._id ? updated : t));
    setEditTask(null);
  };

  const handleDeleteTask = async (task) => {
    await fetch(`/api/tasks/${task._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(tasks.filter(t => t._id !== task._id)); // Suppression immédiate
    // Met à jour le Kanban si besoin via un callback ou un event (voir ci-dessous)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('taskDeleted', { detail: { id: task._id } }));
    }
  };

  // Les tâches sont déjà filtrées par le backend
  const filteredTasks = tasks;

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* En-tête moderne */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white">📋</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Vue Liste des Tâches
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {selectedProject ? 'Projet sélectionné' : 'Tous les projets'} • {filteredTasks.length} tâche(s)
            </p>
          </div>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">À faire</p>
                <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
                  {filteredTasks.filter(t => t.status === 'todo').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En cours</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {filteredTasks.filter(t => t.status === 'in progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Terminées</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {filteredTasks.filter(t => t.status === 'done').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progression</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Aucune tâche trouvée
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {selectedProject ? 'Ce projet ne contient pas encore de tâches' : 'Créez votre première tâche pour commencer'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(t => {
            const priorityStyles = {
              'high': {
                border: 'border-l-red-500',
                bg: 'from-red-50 to-white dark:from-red-900/10 dark:to-gray-800',
                priority: '🔥 Urgent',
                priorityColor: 'text-red-600 dark:text-red-400'
              },
              'medium': {
                border: 'border-l-yellow-500',
                bg: 'from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-800',
                priority: '⚡ Moyen',
                priorityColor: 'text-yellow-600 dark:text-yellow-400'
              },
              'low': {
                border: 'border-l-green-500',
                bg: 'from-green-50 to-white dark:from-green-900/10 dark:to-gray-800',
                priority: '🌱 Faible',
                priorityColor: 'text-green-600 dark:text-green-400'
              }
            };
            
            const taskStyle = priorityStyles[t.priority] || priorityStyles['medium'];
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
            
            const statusStyles = {
              'todo': { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', icon: '📝' },
              'in progress': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: '⚡' },
              'done': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' }
            };
            
            const statusStyle = statusStyles[t.status] || statusStyles['todo'];
            
            return (
              <div key={t._id} className={`task-card group relative overflow-hidden bg-gradient-to-r ${taskStyle.bg} rounded-2xl shadow-lg hover:shadow-2xl border-l-4 ${taskStyle.border} border border-gray-200 dark:border-gray-600 transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]`}>
                {/* Badge de priorité */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${taskStyle.priorityColor} bg-white dark:bg-gray-800 shadow-md`}>
                    {taskStyle.priority}
                  </div>
                </div>
                
                {/* Contenu principal */}
                <div className="p-6">
                  {/* Titre de la tâche */}
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-3 pr-20 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {t.title}
                  </h3>
                  
                  {/* Description si présente */}
                  {t.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  
                  {/* Statut */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} mb-4`}>
                    <span>{statusStyle.icon}</span>
                    <span className="capitalize">{t.status === 'in progress' ? 'En cours' : t.status === 'todo' ? 'À faire' : 'Terminé'}</span>
                  </div>
                  
                  {/* Labels */}
                  {t.labels && t.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {t.labels.slice(0, 3).map((label, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                          {label}
                        </span>
                      ))}
                      {t.labels.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                          +{t.labels.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Informations de la tâche */}
                  <div className="space-y-2 mb-4">
                    {/* Date d'échéance */}
                    {t.dueDate && (
                      <div className={`flex items-center gap-2 text-xs font-medium ${
                        isOverdue 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span>{isOverdue ? '⚠️' : '📅'}</span>
                        <span>
                          {isOverdue ? 'En retard: ' : 'Échéance: '}
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {/* Temps estimé */}
                    {t.estimatedTime && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️</span>
                        <span>{t.estimatedTime}h estimées</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleEditTask(t)} 
                      className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200" 
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(t)} 
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200" 
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {/* Indicateur de hover */}
                <div className="absolute inset-0 bg-blue-500 bg-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
              </div>
            );
          })}
        </div>
      )}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[500px] max-w-2xl mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white">✏️</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Modifier la Tâche
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Mettez à jour les détails de votre tâche</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Titre de la tâche *
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300 font-medium" 
                  placeholder="Titre de la tâche" 
                  value={editData.title} 
                  onChange={e => setEditData({ ...editData, title: e.target.value })} 
                  required 
                />
              </div>
              
              {/* Statut */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Statut de la tâche
                </label>
                <select 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300 font-medium cursor-pointer"
                  value={editData.status} 
                  onChange={e => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="todo" className="font-medium py-2">📝 À faire</option>
                  <option value="in progress" className="font-medium py-2">⚡ En cours</option>
                  <option value="done" className="font-medium py-2">✅ Terminé</option>
                </select>
              </div>
              
              {/* Labels */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Étiquettes
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300" 
                  placeholder="Labels séparés par des virgules" 
                  value={editData.labels} 
                  onChange={e => setEditData({ ...editData, labels: e.target.value })} 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Modifiez les étiquettes pour une meilleure organisation
                </p>
              </div>
              
              {/* Informations de la tâche actuelle */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  Informations actuelles
                </h3>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <p><strong>Créée le:</strong> {new Date(editTask.createdAt).toLocaleDateString()}</p>
                  {editTask.dueDate && (
                    <p><strong>Échéance:</strong> {new Date(editTask.dueDate).toLocaleDateString()}</p>
                  )}
                  {editTask.priority && (
                    <p><strong>Priorité:</strong> {editTask.priority}</p>
                  )}
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">💾</span>
                  Enregistrer
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-3" 
                  onClick={() => setEditTask(null)}
                >
                  <span className="text-xl">❌</span>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
