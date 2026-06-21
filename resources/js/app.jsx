import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Layout from './pages/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AuditReport from './pages/admin/AuditReport';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamManagement from './pages/manager/TeamManagement';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeTasks from './pages/employee/EmployeeTasks';

// Task Management is shared between Admin & Manager
import TaskManagement from './pages/TaskManagement';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const isAuthorized = allowedRoles.some(role => hasRole(role));
        if (!isAuthorized) {
            // Redirect unauthorized users to their correct workspace
            if (hasRole('Admin')) return <Navigate to="/admin/dashboard" replace />;
            if (hasRole('Manager')) return <Navigate to="/manager/dashboard" replace />;
            return <Navigate to="/employee/dashboard" replace />;
        }
    }

    return <Layout>{children}</Layout>;
};

const DashboardRedirect = () => {
    const { hasRole, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    
    if (hasRole('Admin')) return <Navigate to="/admin/dashboard" replace />;
    if (hasRole('Manager')) return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
};

const App = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Login Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Authenticated Dashboard Redirect fallback */}
                        <Route 
                            path="/" 
                            element={
                                <ProtectedRoute>
                                    <DashboardRedirect />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Admin Specific Routes */}
                        <Route 
                            path="/admin/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin/users" 
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <UserManagement />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin/manage-task" 
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <TaskManagement />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin/audit-report" 
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AuditReport />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Manager Specific Routes */}
                        <Route 
                            path="/manager/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['Manager']}>
                                    <ManagerDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/manager/team" 
                            element={
                                <ProtectedRoute allowedRoles={['Manager']}>
                                    <TeamManagement />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/manager/manage-task" 
                            element={
                                <ProtectedRoute allowedRoles={['Manager']}>
                                    <TaskManagement />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/manager/audit-report" 
                            element={
                                <ProtectedRoute allowedRoles={['Manager']}>
                                    <AuditReport />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Employee Specific Routes */}
                        <Route 
                            path="/employee/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <EmployeeDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/employee/tasks" 
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <EmployeeTasks />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Redirect unknown routes back home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    );
};

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
