import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const ProjectSelector = ({ selectedProject, setSelectedProject, onProjectAdded, onlyButton }) => {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editProject, setEditProject] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });

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

  const handleEditProject = (project) => {
    setEditProject(project);
    setEditData({
      name: project.name,
      description: project.description || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) return;
    const res = await fetch(`/api/projects/${editProject._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editData)
    });
    const updated = await res.json();
    setProjects(projects.map(p => p._id === updated._id ? updated : p));
    setEditProject(null);
    setEditData({ name: '', description: '' });
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cette action est irréversible.`)) {
      await fetch(`/api/projects/${project._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p._id !== project._id));
      if (selectedProject === project._id) {
        setSelectedProject('');
      }
    }
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
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎯 Gestion des Projets
        </h2>
        <button
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <span className="text-lg">+</span>
          Nouveau Projet
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <select
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-lg font-medium shadow-md hover:shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 appearance-none cursor-pointer"
            value={selectedProject || ''}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="" className="font-medium">🌟 Tous les projets</option>
            {projects.map(p => (
              <option key={p._id} value={p._id} className="font-medium">📁 {p.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        {selectedProject && (
          <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full">
            <span className="text-blue-600 dark:text-blue-300 font-medium">✓ Projet actif</span>
          </div>
        )}
      </div>
      
      {/* Liste des projets avec actions */}
      {projects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📁</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Aucun projet pour le moment
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Créez votre premier projet pour commencer à organiser vos tâches
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🚀 Créer mon premier projet
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              📂 Mes Projets ({projects.length})
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {projects.map(p => (
              <div key={p._id} className={`project-card group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                selectedProject === p._id 
                  ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-600 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}>
                {selectedProject === p._id && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-green-500">
                    <span className="absolute -top-6 -right-1 text-white text-xs font-bold">✓</span>
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full ${p.color || 'bg-blue-500'}`}></div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                          {p.name}
                        </h4>
                        {selectedProject === p._id && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            ACTIF
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                          {p.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          📅 {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          👤 {p.members?.length || 0} membre(s)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => setSelectedProject(p._id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                          selectedProject === p._id 
                            ? 'bg-green-500 text-white shadow-lg cursor-default' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                        }`}
                        disabled={selectedProject === p._id}
                      >
                        {selectedProject === p._id ? '✓ Sélectionné' : '🎯 Sélectionner'}
                      </button>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditProject(p)}
                          className="px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          title="Modifier le projet"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p)}
                          className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          title="Supprimer le projet"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[400px] max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🚀</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Créer un Nouveau Projet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Donnez vie à vos idées</p>
            </div>
            
            <form onSubmit={handleAddProject} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📝 Nom du projet *
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300" 
                  placeholder="Ex: Application mobile innovante" 
                  value={newProject.name} 
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📄 Description
                </label>
                <textarea 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 resize-none" 
                  placeholder="Décrivez votre projet en quelques mots..." 
                  rows="3"
                  value={newProject.description} 
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })} 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  ✨ Créer le Projet
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300" 
                  onClick={() => setShowAdd(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[400px] max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">✏️</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Modifier le Projet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Peaufinez votre projet</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📝 Nom du projet *
                </label>
                <input 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-lg bg-white dark:bg-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-300" 
                  placeholder="Nom du projet" 
                  value={editData.name} 
                  onChange={e => setEditData({ ...editData, name: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📄 Description
                </label>
                <textarea 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-lg bg-white dark:bg-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-300 resize-none" 
                  placeholder="Description du projet..." 
                  rows="3"
                  value={editData.description} 
                  onChange={e => setEditData({ ...editData, description: e.target.value })} 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  💾 Enregistrer
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300" 
                  onClick={() => setEditProject(null)}
                >
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

export default ProjectSelector;
