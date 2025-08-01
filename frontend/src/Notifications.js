import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(await res.json());
      setShow(true); // Affiche le popup à la réception
    };
    fetchNotifications();
  }, [token]);

  if (!show) return null;

  return (
    <div className="fixed top-8 right-8 z-50 max-w-xs w-full bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 border border-yellow-300 dark:border-gray-600 rounded-2xl shadow-2xl animate-fade-in p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 drop-shadow">Notifications</h2>
        <button onClick={() => setShow(false)} className="ml-2 px-2 py-1 rounded bg-yellow-300 dark:bg-gray-600 text-yellow-900 dark:text-gray-100 hover:bg-yellow-400 dark:hover:bg-gray-700 transition">✕</button>
      </div>
      <ul>
        {notifications.length === 0 ? (
          <li className="text-gray-700 dark:text-gray-200">Bienvenue sur la plateforme !</li>
        ) : notifications.map(n => (
          <li key={n._id} className={`mb-1 p-2 rounded ${n.read ? 'bg-gray-200 dark:bg-gray-700' : 'bg-yellow-100 dark:bg-yellow-900'} text-gray-800 dark:text-gray-100`}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
