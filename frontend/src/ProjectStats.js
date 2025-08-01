import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const ProjectStats = ({ projectId, projectName }) => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchStats();
    }
  }, [projectId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📊 Statistiques globales</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Sélectionnez un projet pour voir ses statistiques détaillées.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100) 
    : 0;

  const timeEfficiency = stats.totalEstimatedTime > 0 
    ? Math.round((stats.totalActualTime / stats.totalEstimatedTime) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">📊 Statistiques - {projectName}</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalTasks}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Tâches totales
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.doneTasks}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Terminées
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.inProgressTasks}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            En cours
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.overdueTasks}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            En retard
          </div>
        </div>
      </div>

      {/* Barres de progression */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progression du projet</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {stats.totalEstimatedTime > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Efficacité temporelle</span>
              <span>{timeEfficiency}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  timeEfficiency <= 100 ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(timeEfficiency, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalActualTime}h réelles / {stats.totalEstimatedTime}h estimées
            </div>
          </div>
        )}
      </div>

      {/* Répartition par statut */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Répartition des tâches</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span>À faire: {stats.todoTasks}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <span>En cours: {stats.inProgressTasks}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span>Terminées: {stats.doneTasks}</span>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {stats.highPriorityTasks > 0 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center">
            <span className="text-orange-600 dark:text-orange-400 mr-2">⚠️</span>
            <span className="text-sm text-orange-700 dark:text-orange-300">
              {stats.highPriorityTasks} tâche(s) à priorité élevée nécessitent votre attention
            </span>
          </div>
        </div>
      )}

      {stats.overdueTasks > 0 && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 dark:text-red-400 mr-2">🚨</span>
            <span className="text-sm text-red-700 dark:text-red-300">
              {stats.overdueTasks} tâche(s) en retard
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStats;