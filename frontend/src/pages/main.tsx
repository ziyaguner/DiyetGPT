import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.tsx';
import Register from './Register.tsx';
import Dashboard from './Dashboard.tsx';
import NotFound from './NotFound.tsx';
import '../index.css';
import PhotoAnalysis from "../pages/PhotoAnalysis";
import axios from 'axios';

// Axios global config

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;


// Request interceptor
axios.interceptors.request.use(
  (config) => {
    console.log('API İsteği:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('API Yanıtı:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Hatası:', error.response?.status, error.config?.url);
    
    // Yönlendirme mantığını sadece login ve register dışındaki rotalar için uygula
    if (error.response?.status === 401 && !['/login', '/register'].includes(window.location.pathname)) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/photo-analysis" element={<PhotoAnalysis />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);