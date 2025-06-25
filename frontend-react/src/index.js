/*
  Arquivo: src/index.js
  Descrição: Adicionado o novo WordCloudProvider para que toda a aplicação tenha acesso ao seu contexto.
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MapProvider } from './context/MapProvider';
import { FlashcardProvider } from './context/FlashcardProvider';
import { WordCloudProvider } from './context/WordCloudProvider'; // Importa o novo provider

import 'reactflow/dist/style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <MapProvider>
          <FlashcardProvider>
            <WordCloudProvider> {/* Adiciona o provider na árvore de componentes */}
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </WordCloudProvider>
          </FlashcardProvider>
        </MapProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);