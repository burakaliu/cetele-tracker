import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { PersonalDashboard } from './pages/PersonalDashboard';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { useAuthStore } from './store/useAuthStore';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState().initialize();
      setIsInitializing(false);
    };
    initAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="text-charcoal font-mono text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PersonalDashboard />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
