import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const ProjectSelector = ({ selectedProject, setSelectedProject, onProjectAdded, onlyButton }) => {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
      setProjects(await res.json());
    };
    fetchProjects();
  }, [token, onProjectAdded]);

  useEffect(() => {
    if (!onlyButton && typeof window !== 'undefined') {
      const handler = (e) => setSelectedProject(e.detail.id);
      window.addEventListener('selectProject', handler);
      return () => window.removeEventListener('selectProject', handler);
    }
  }, [setSelectedProject, onlyButton]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newProject)
    });
    const created = await res.json();
    setProjects([...projects, created]);
    setShowAdd(false);
    setNewProject({ name: '', description: '' });
    if (onProjectAdded) onProjectAdded(created);
  };

  if (onlyButton) {
    return (
      <>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-green-700 transition text-lg font-bold"
          onClick={() => setShowAdd(true)}
        >
          + Ajouter un projet
        </button>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form onSubmit={handleAddProject} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[320px]">
              <h2 className="text-xl font-bold mb-2">Nouveau projet</h2>
              <input className="border rounded p-2" placeholder="Nom" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} required />
              <textarea className="border rounded p-2" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Ajouter</button>
                <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => setShowAdd(false)}>Annuler</button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mb-8 flex items-center gap-4">
      <select
        className="border rounded p-2 min-w-[200px]"
        value={selectedProject || ''}
        onChange={e => setSelectedProject(e.target.value)}
      >
        <option value="">Tous les projets</option>
        {projects.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowAdd(true)}
      >
        + Ajouter un projet
      </button>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleAddProject} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-xl font-bold mb-2">Nouveau projet</h2>
            <input className="border rounded p-2" placeholder="Nom" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} required />
            <textarea className="border rounded p-2" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Ajouter</button>
              <button type="button" className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => setShowAdd(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
