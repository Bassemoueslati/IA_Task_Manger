import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const ProjectMembers = ({ project, onClose, onUpdate }) => {
  const { token } = useContext(AuthContext);
  const [members, setMembers] = useState(project.members || []);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${project._id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userEmail: newMemberEmail,
          role: newMemberRole
        })
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setMembers(updatedProject.members);
        setNewMemberEmail('');
        setNewMemberRole('member');
        if (onUpdate) onUpdate(updatedProject);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Erreur lors de l\'ajout du membre');
      }
    } catch (error) {
      setError('Erreur de connexion');
      console.error('Erreur ajout membre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre du projet ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project._id}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setMembers(updatedProject.members);
        if (onUpdate) onUpdate(updatedProject);
      }
    } catch (error) {
      console.error('Erreur suppression membre:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'member': return 'Membre';
      case 'viewer': return 'Observateur';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Membres du projet</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Formulaire d'ajout de membre */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Ajouter un membre</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email de l'utilisateur
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="utilisateur@example.com"
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rôle
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="viewer">Observateur (lecture seule)</option>
                  <option value="member">Membre (peut modifier)</option>
                  <option value="admin">Administrateur (tous droits)</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter le membre'}
              </button>
            </form>
          </div>

          {/* Liste des membres */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Membres actuels ({members.length})
            </h3>
            
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun membre ajouté pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.user?._id || index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.user?.name || 'Utilisateur inconnu'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.user?.email || 'Email non disponible'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Rejoint le {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                      
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.user?._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Retirer du projet"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations sur les rôles */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold mb-2">Rôles et permissions :</h4>
            <div className="text-sm space-y-1">
              <div><strong>Observateur :</strong> Peut voir les tâches et projets</div>
              <div><strong>Membre :</strong> Peut créer et modifier les tâches</div>
              <div><strong>Administrateur :</strong> Peut gérer les membres et supprimer le projet</div>
            </div>
          </div>

          {/* Bouton de fermeture */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembers;