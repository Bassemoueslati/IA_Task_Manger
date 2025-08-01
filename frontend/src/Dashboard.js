import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Dashboard = ({ selectedProject }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [editData, setEditData] = useState({ title: '', status: 'todo', labels: '' });

  useEffect(() => {
    const fetchData = async () => {
      const resTasks = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
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
  }, [token]);

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

  // Filtrage des tâches selon le projet sélectionné
  const filteredTasks = selectedProject
    ? tasks.filter(t => t.project === selectedProject)
    : tasks;

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Tâches</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(t => (
          <li key={t._id}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transform transition-transform hover:-translate-y-1 hover:scale-105 duration-300 group">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-lg text-purple-700 dark:text-purple-300 drop-shadow">{t.title}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.status} - {t.labels?.join(', ')}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditTask(t)} className="text-green-600 hover:text-green-800 px-2 py-1 rounded">✎</button>
                  <button onClick={() => handleDeleteTask(t)} className="text-red-600 hover:text-red-800 px-2 py-1 rounded">🗑</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-xl font-bold mb-2">Modifier la tâche</h2>
            <input className="border rounded p-2" placeholder="Titre" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} required />
            <select className="border rounded p-2" value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>
              <option value="todo">À faire</option>
              <option value="in progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
            <input className="border rounded p-2" placeholder="Labels (séparés par des virgules)" value={editData.labels} onChange={e => setEditData({ ...editData, labels: e.target.value })} />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Enregistrer</button>
              <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => setEditTask(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
