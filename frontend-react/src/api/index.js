/*
  Arquivo: src/api/index.js
  Descrição: Ajustada a URL base da API para priorizar a variável de ambiente, com fallback para a URL de produção. Isso garante que o código funcione em produção por padrão e seja facilmente configurado para desenvolvimento local via .env.
*/
import { jwtDecode } from 'jwt-decode';

// A URL base aponta para a variável de ambiente ou para a produção.
// Para desenvolvimento local, crie um arquivo .env.local na pasta 'frontend-react'
// e adicione a linha: REACT_APP_API_URL=http://localhost:5000
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mindflowbackend.onrender.com/api';
export const API_URL = `${API_BASE_URL}/api`;

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      console.log('Token expirado, limpando...');
      localStorage.removeItem('token');
      token = null;
      window.location.href = '/login'; 
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['x-auth-token'] = token;
  }

  const newOptions = { ...options, headers };

  return fetch(url, newOptions);
};
