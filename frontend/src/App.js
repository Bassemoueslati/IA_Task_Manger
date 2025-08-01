import React, { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Notifications from './Notifications';
import Chatbot from './Chatbot';
import ThemeSwitcher from './ThemeSwitcher';
import Kanban from './Kanban';
import ProjectSelector from './ProjectSelector';
import './App.css';

function AppContent() {
  const { user, login } = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectAdded, setProjectAdded] = useState(null);

  if (!user) {
    return showRegister ? (
      <>
        <Register onRegister={login} />
        <div className="text-center mt-4">
          <button className="text-blue-600 underline" onClick={() => setShowRegister(false)}>
            Déjà un compte ? Se connecter
          </button>
        </div>
      </>
    ) : (
      <>
        <Login onLogin={login} />
        <div className="text-center mt-4">
          <button className="text-blue-600 underline" onClick={() => setShowRegister(true)}>
            Pas de compte ? S'inscrire
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      <ThemeSwitcher />
      <div className="flex items-center gap-4 mb-8">
        <Kanban
          selectedProject={selectedProject}
          projectAdded={projectAdded}
          renderAddProjectButton={(props) => (
            <ProjectSelector
              {...props}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              onProjectAdded={setProjectAdded}
              onlyButton
            />
          )}
        />
      </div>
      <Notifications />
      <Dashboard selectedProject={selectedProject} projectAdded={projectAdded} />
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
