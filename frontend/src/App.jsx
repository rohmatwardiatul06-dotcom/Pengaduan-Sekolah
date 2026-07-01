import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyComplaints from './pages/MyComplaints';
import AllComplaints from './pages/AllComplaints';
import UserManagement from './pages/UserManagement';
import EditComplaint from './pages/EditComplaint';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Dashboard Layout wraps them) */}
          <Route path="/" element={<DashboardLayout />}>
            {/* Dashboard: accessible by both admin and user */}
            <Route index element={<Dashboard />} />
            
            {/* User-only Routes */}
            <Route path="my-complaints" element={<MyComplaints />} />
            
            {/* Admin-only Routes */}
            <Route path="all-complaints" element={<AllComplaints />} />
            <Route path="users" element={<UserManagement />} />
            
            {/* Shared Edit Route (validation inside component) */}
            <Route path="edit/:id" element={<EditComplaint />} />
          </Route>

          {/* Catch-all, redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
