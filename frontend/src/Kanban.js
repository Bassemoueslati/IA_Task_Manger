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
      {/* Statistiques du projet */}
      {showStats && (
        <ProjectStats 
          projectId={selectedProject} 
          projectName={getSelectedProjectName()}
        />
      )}

      <div className="flex gap-4 mb-4 flex-wrap">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition text-lg font-bold"
          onClick={() => setShowAdd(true)}
        >
          + Ajouter une tâche
        </button>
        {renderAddProjectButton && renderAddProjectButton({
          style: { background: '#10b981', color: 'white' },
          className: 'bg-green-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-green-700 transition text-lg font-bold',
        })}
        <button
          className={`px-6 py-3 rounded-full shadow-xl transition text-lg font-bold ${
            showStats 
              ? 'bg-gray-600 text-white hover:bg-gray-700' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? '📊 Masquer stats' : '📊 Afficher stats'}
        </button>
        {selectedProject && (
          <button
            className="bg-orange-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-orange-700 transition text-lg font-bold"
            onClick={() => setShowMembers(getSelectedProject())}
          >
            👥 Gérer les membres
          </button>
        )}
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleAddTask} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-xl font-bold mb-2">Nouvelle tâche</h2>
            <input className="border rounded p-2" placeholder="Titre" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
            <select className="border rounded p-2" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
              {columns.map(col => <option key={col.key} value={col.key}>{col.label}</option>)}
            </select>
            <input className="border rounded p-2" placeholder="Labels (séparés par des virgules)" value={newTask.labels} onChange={e => setNewTask({ ...newTask, labels: e.target.value })} />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Ajouter</button>
              <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => setShowAdd(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-xl font-bold mb-2">Modifier la tâche</h2>
            <input className="border rounded p-2" placeholder="Titre" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} required />
            <select className="border rounded p-2" value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>
              {columns.map(col => <option key={col.key} value={col.key}>{col.label}</option>)}
            </select>
            <input className="border rounded p-2" placeholder="Labels (séparés par des virgules)" value={editData.labels} onChange={e => setEditData({ ...editData, labels: e.target.value })} />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Enregistrer</button>
              <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => setEditTask(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}
      <div className="flex gap-4 p-4 min-h-[400px]">
        {columns.map(col => (
          <div
            key={col.key}
            className="flex-1 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-4 min-h-[320px] shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-3xl"
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(col.key)}
          >
            <h3 className="font-bold mb-4 text-center text-lg tracking-wide text-gray-700 dark:text-gray-200 drop-shadow">{col.label}</h3>
            {filteredTasks.filter(t => t.status === col.key).map(t => (
              <div
                key={t._id}
                draggable
                onDragStart={() => onDragStart(t)}
                className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600 cursor-move transform transition-transform hover:-translate-y-1 hover:scale-105 duration-300 group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 cursor-pointer" onClick={() => handleTaskClick(t)}>
                    <div className="font-semibold text-base text-blue-700 dark:text-blue-300 drop-shadow mb-1">{t.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">{t.labels?.join(', ')}</div>
                    {t.dueDate && (
                      <div className={`text-xs ${new Date(t.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                        📅 {new Date(t.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {t.priority === 'high' && (
                      <div className="text-xs text-red-600 font-bold">🔥 Priorité élevée</div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); handleTaskClick(t); }} className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded" title="Détails">👁</button>
                    <button onClick={(e) => { e.stopPropagation(); handleEditTask(t); }} className="text-green-600 hover:text-green-800 px-2 py-1 rounded" title="Modifier">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(t); }} className="text-red-600 hover:text-red-800 px-2 py-1 rounded" title="Supprimer">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Projets</h2>
        <ul className="mb-8 flex flex-col gap-2">
          {projects.map(p => (
            <li key={p._id}>
              <button
                className={`w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transform transition-transform hover:-translate-y-1 hover:scale-105 duration-300 font-semibold text-lg drop-shadow ${selectedProject === p._id ? 'text-green-600 border-green-600 ring-2 ring-green-200 dark:ring-green-400' : 'text-blue-700 dark:text-blue-300'}`}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const event = new CustomEvent('selectProject', { detail: { id: p._id } });
                    window.dispatchEvent(event);
                  }
                }}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
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
