/*
  Arquivo: src/App.js
  Descrição: O tema escuro agora é aplicado condicionalmente no contêiner principal, somente quando o usuário está autenticado, garantindo que as páginas públicas não sejam afetadas.
*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import MindmapPage from './pages/MindmapPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import PublicMapView from './pages/PublicMapView';
import StudyPage from './pages/StudyPage';

function App() {
  const { theme, fontSize } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className={`font-size-${fontSize} ${isAuthenticated && theme === 'dark' ? 'dark-mode' : ''}`}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/view/:shareId" element={<PublicMapView />} />

          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mindmap" element={<MindmapPage />} />
            <Route path="mindmap/:mapId" element={<MindmapPage />} />
            <Route path="map/:mapId/study" element={<StudyPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;