import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import TaskDetail from './TaskDetail';
import ProjectStats from './ProjectStats';
import ProjectMembers from './ProjectMembers';

const columns = [
  { key: 'todo', label: 'À faire' },
  { key: 'in progress', label: 'En cours' },
  { key: 'done', label: 'Terminé' }
];

const Kanban = ({ selectedProject, projectAdded, renderAddProjectButton }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo', labels: '' });
  const [editTask, setEditTask] = useState(null);
  const [editData, setEditData] = useState({ title: '', status: 'todo', labels: '' });
  // Ajout d'un état pour la liste des projets
  const [projects, setProjects] = useState([]);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [showMembers, setShowMembers] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      let url = '/api/tasks';
      if (selectedProject) {
        url += `?project=${selectedProject}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(await res.json());
    };
    fetchTasks();
    // Synchronisation suppression depuis Dashboard
    const onTaskDeleted = (e) => {
      setTasks(tasks => tasks.filter(t => t._id !== e.detail.id));
    };
    window.addEventListener('taskDeleted', onTaskDeleted);
    return () => window.removeEventListener('taskDeleted', onTaskDeleted);
  }, [token, selectedProject]);

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
      setProjects(await res.json());
    };
    fetchProjects();
  }, [token, projectAdded]);

  const onDragStart = (task) => setDragged(task);
  const onDrop = async (status) => {
    if (!dragged) return;
    await fetch(`/api/tasks/${dragged._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...dragged, status })
    });
    setTasks(tasks.map(t => t._id === dragged._id ? { ...t, status } : t));
    setDragged(null);
  };

  // Ajout synchronisation ajout/modification
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: newTask.title,
        status: newTask.status,
        labels: newTask.labels.split(',').map(l => l.trim()).filter(Boolean),
        project: selectedProject || undefined
      })
    });
    const created = await res.json();
    setTasks([...tasks, created]);
    setShowAdd(false);
    setNewTask({ title: '', status: 'todo', labels: '' });
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('taskAdded', { detail: { task: created } }));
    }
  };

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
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: { task: updated } }));
    }
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await fetch(`/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== task._id));
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTaskDetail(task);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
  };

  const getSelectedProjectName = () => {
    const project = projects.find(p => p._id === selectedProject);
    return project ? project.name : '';
  };

  const getSelectedProject = () => {
    return projects.find(p => p._id === selectedProject);
  };

  const handleProjectUpdate = (updatedProject) => {
    setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
  };

  // Les tâches sont déjà filtrées par le backend
  const filteredTasks = tasks;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* En-tête Kanban moderne */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">📋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tableau Kanban
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {selectedProject ? `Projet: ${getSelectedProjectName()}` : 'Toutes les tâches'}
              </p>
            </div>
          </div>
          
          {selectedProject && (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-semibold">Projet Actif</span>
            </div>
          )}
        </div>

        {/* Boutons d'action modernes */}
        <div className="flex gap-4 flex-wrap">
          <button
            className="btn-bounce group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-3"
            onClick={() => setShowAdd(true)}
          >
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <span className="text-xl">+</span>
            </div>
            Nouvelle Tâche
          </button>
          
          {renderAddProjectButton && renderAddProjectButton({
            style: { background: 'linear-gradient(135deg, #10b981, #059669)' },
            className: 'group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-3',
          })}
          
          <button
            className={`group px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-3 ${
              showStats 
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
            }`}
            onClick={() => setShowStats(!showStats)}
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
              📊
            </span>
            {showStats ? 'Masquer Stats' : 'Afficher Stats'}
          </button>
          
          {selectedProject && (
            <button
              className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center gap-3"
              onClick={() => setShowMembers(getSelectedProject())}
            >
              <span className="text-xl group-hover:bounce transition-transform duration-300">
                👥
              </span>
              Gérer Équipe
            </button>
          )}
        </div>
      </div>

      {/* Statistiques du projet */}
      {showStats && (
        <ProjectStats 
          projectId={selectedProject} 
          projectName={getSelectedProjectName()}
        />
      )}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[500px] max-w-2xl mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white">✨</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Créer une Nouvelle Tâche
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Organisez votre travail efficacement</p>
            </div>
            
            <form onSubmit={handleAddTask} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Titre de la tâche *
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 font-medium" 
                  placeholder="Ex: Développer la nouvelle fonctionnalité..." 
                  value={newTask.title} 
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                  required 
                />
              </div>
              
              {/* Statut */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Statut initial
                </label>
                <select 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 font-medium cursor-pointer"
                  value={newTask.status} 
                  onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                >
                  {columns.map(col => (
                    <option key={col.key} value={col.key} className="font-medium py-2">
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Labels */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Étiquettes
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300" 
                  placeholder="Ex: urgent, frontend, bug (séparés par des virgules)" 
                  value={newTask.labels} 
                  onChange={e => setNewTask({ ...newTask, labels: e.target.value })} 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Séparez les étiquettes par des virgules pour une meilleure organisation
                </p>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🚀</span>
                  Créer la Tâche
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-3" 
                  onClick={() => setShowAdd(false)}
                >
                  <span className="text-xl">❌</span>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[500px] max-w-2xl mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white">✏️</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Modifier la Tâche
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Peaufinez les détails de votre tâche</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Titre de la tâche *
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-300 font-medium" 
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
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-300 font-medium cursor-pointer"
                  value={editData.status} 
                  onChange={e => setEditData({ ...editData, status: e.target.value })}
                >
                  {columns.map(col => (
                    <option key={col.key} value={col.key} className="font-medium py-2">
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Labels */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Étiquettes
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-lg bg-white dark:bg-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-300" 
                  placeholder="Labels séparés par des virgules" 
                  value={editData.labels} 
                  onChange={e => setEditData({ ...editData, labels: e.target.value })} 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Modifiez les étiquettes pour une meilleure organisation
                </p>
              </div>
              
              {/* Informations de la tâche actuelle */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  Informations actuelles
                </h3>
                <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
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
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
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
      {/* Colonnes Kanban modernes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {columns.map((col, index) => {
          const columnColors = {
            'todo': {
              bg: 'from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
              border: 'border-slate-300 dark:border-gray-600',
              header: 'from-slate-500 to-gray-600',
              icon: '📝',
              count: filteredTasks.filter(t => t.status === col.key).length
            },
            'in progress': {
              bg: 'from-amber-50 to-yellow-100 dark:from-yellow-900/20 dark:to-amber-900/20',
              border: 'border-amber-300 dark:border-yellow-600',
              header: 'from-amber-500 to-yellow-600',
              icon: '⚡',
              count: filteredTasks.filter(t => t.status === col.key).length
            },
            'done': {
              bg: 'from-emerald-50 to-green-100 dark:from-green-900/20 dark:to-emerald-900/20',
              border: 'border-emerald-300 dark:border-green-600',
              header: 'from-emerald-500 to-green-600',
              icon: '✅',
              count: filteredTasks.filter(t => t.status === col.key).length
            }
          };
          
          const colStyle = columnColors[col.key];
          
          return (
            <div
              key={col.key}
              className={`kanban-column flex-1 bg-gradient-to-br ${colStyle.bg} rounded-2xl p-6 min-h-[500px] shadow-xl border-2 ${colStyle.border} transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
            >
              {/* En-tête de colonne moderne */}
              <div className={`bg-gradient-to-r ${colStyle.header} text-white p-4 rounded-xl mb-6 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{colStyle.icon}</span>
                    <h3 className="font-bold text-lg tracking-wide">{col.label}</h3>
                  </div>
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <span className="font-bold text-sm">{colStyle.count}</span>
                  </div>
                </div>
              </div>
              
              {/* Zone de drop avec indicateur */}
              <div className="space-y-4 min-h-[400px] relative">
                {filteredTasks.filter(t => t.status === col.key).length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 bg-opacity-50">
                      <span className="text-4xl mb-2 block opacity-50">{colStyle.icon}</span>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Aucune tâche
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        Glissez une tâche ici
                      </p>
                    </div>
                  </div>
                )}
                {filteredTasks.filter(t => t.status === col.key).map(t => {
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
                  
                  return (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={() => onDragStart(t)}
                      className={`task-card group relative overflow-hidden bg-gradient-to-r ${taskStyle.bg} rounded-2xl shadow-lg hover:shadow-2xl border-l-4 ${taskStyle.border} border border-gray-200 dark:border-gray-600 cursor-move transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] mb-4`}
                    >
                      {/* Badge de priorité */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${taskStyle.priorityColor} bg-white dark:bg-gray-800 shadow-md`}>
                          {taskStyle.priority}
                        </div>
                      </div>
                      
                      {/* Contenu principal */}
                      <div className="p-5">
                        <div className="cursor-pointer" onClick={() => handleTaskClick(t)}>
                          {/* Titre de la tâche */}
                          <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3 pr-16 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {t.title}
                          </h4>
                          
                          {/* Description si présente */}
                          {t.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {t.description}
                            </p>
                          )}
                          
                          {/* Labels */}
                          {t.labels && t.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
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
                          <div className="space-y-2">
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
                            
                            {/* Assignation */}
                            {t.assignedTo && t.assignedTo.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>👤</span>
                                <span>Assigné à {t.assignedTo.length} personne(s)</span>
                              </div>
                            )}
                            
                            {/* Temps estimé */}
                            {t.estimatedTime && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>⏱️</span>
                                <span>{t.estimatedTime}h estimées</span>
                              </div>
                            )}
                            
                            {/* Sous-tâches */}
                            {t.subtasks && t.subtasks.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>📋</span>
                                <span>
                                  {t.subtasks.filter(st => st.completed).length}/{t.subtasks.length} sous-tâches
                                </span>
                              </div>
                            )}
                            
                            {/* Commentaires */}
                            {t.comments && t.comments.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>💬</span>
                                <span>{t.comments.length} commentaire(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Boutons d'action */}
                        <div className="flex justify-end gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleTaskClick(t); }} 
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200" 
                            title="Voir détails"
                          >
                            👁️
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditTask(t); }} 
                            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200" 
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(t); }} 
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200" 
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {/* Indicateur de drag */}
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl border-2 border-blue-500 border-dashed"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détails de tâche */}
      {selectedTaskDetail && (
        <TaskDetail
          task={selectedTaskDetail}
          onClose={() => setSelectedTaskDetail(null)}
          onUpdate={handleTaskUpdate}
        />
      )}

      {/* Modal de gestion des membres */}
      {showMembers && (
        <ProjectMembers
          project={showMembers}
          onClose={() => setShowMembers(null)}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default Kanban;
