import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';

export default function Dashboard() {
    const { user, logout, hasRole } = useAuth();

    const getRoleName = () => {
        if (hasRole('Admin')) return 'Admin';
        if (hasRole('Manager')) return 'Manager';
        if (hasRole('Employee')) return 'Employee';
        return 'User';
    };

    const getRoleColor = () => {
        if (hasRole('Admin')) return 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400';
        if (hasRole('Manager')) return 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400';
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Header/NavBar */}
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-lg font-bold tracking-tight text-white block leading-none">T S M</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Management System</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <span className="text-sm font-semibold text-white block">{user?.name}</span>
                            <span className="text-xs text-slate-400">{user?.email}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border bg-gradient-to-r ${getRoleColor()}`}>
                            {getRoleName()}
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-lg transition cursor-pointer"
                            title="Sign Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
                {hasRole('Admin') && <AdminDashboard />}
                {hasRole('Manager') && <ManagerDashboard />}
                {hasRole('Employee') && <EmployeeDashboard />}
            </main>
        </div>
    );
}
