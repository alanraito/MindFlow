/*
  Arquivo: src/App.js
  Descrição: A rota de fallback para usuários autenticados foi alterada de 'dashboard' para 'home', definindo a página de planos como o novo ponto de entrada principal.
*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage'; // Página para usuários logados
import MindmapPage from './pages/MindmapPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import PublicMapView from './pages/PublicMapView';
import StudyPage from './pages/StudyPage';

// Componente para decidir qual página inicial mostrar
const PublicHomePage = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/app/home" replace /> : <LandingPage />;
};

function App() {
    const { theme, fontSize } = useTheme();
    const { isAuthenticated } = useAuth();

    return (
        <div className={`font-size-${fontSize} ${isAuthenticated && theme === 'dark' ? 'dark-mode' : ''}`}>
            <Router>
                <Routes>
                    <Route path="/" element={<PublicHomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/view/:shareId" element={<PublicMapView />} />

                    <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route path="home" element={<HomePage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="mindmap" element={<MindmapPage />} />
                        <Route path="mindmap/:mapId" element={<MindmapPage />} />
                        <Route path="map/:mapId/study" element={<StudyPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
                        {/* Rota de fallback para /app agora aponta para a home */}
                        <Route index element={<Navigate to="home" replace />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;