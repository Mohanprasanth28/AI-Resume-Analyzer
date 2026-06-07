import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import { isAuthenticated } from './api/analyzeApi';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public only route wrapper (redirects to / if logged in)
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: 'text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-250 shadow-lg font-sans',
          duration: 4000,
          success: {
            iconTheme: {
              primary: '#14b8a6', // Teal 500
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e', // Rose 500
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Navigation Header */}
      <Navbar />

      {/* Pages Router Viewports */}
      <Routes>
        {/* Protected Pages */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } 
        />

        {/* Public Credentials Pages */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
