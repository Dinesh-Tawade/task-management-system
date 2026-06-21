import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }) {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationsPermission, setNotificationsPermission] = useState(
        'Notification' in window ? Notification.permission : 'default'
    );

    const requestNotificationPermission = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                setNotificationsPermission(permission);
                if (permission === 'granted') {
                    new Notification('Notifications Enabled!', {
                        body: 'You will now receive desktop push alerts for task updates.',
                    });
                }
            });
        }
    };

    const getRoleName = () => {
        if (hasRole('Admin')) return 'Admin';
        if (hasRole('Manager')) return 'Manager';
        return 'Employee';
    };

    const getSidebarLinks = () => {
        if (hasRole('Admin')) {
            return [
                { path: '/admin/dashboard', name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
                { path: '/admin/users', name: 'User Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { path: '/admin/manage-task', name: 'Manage Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { path: '/admin/audit-report', name: 'Audit Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ];
        } else if (hasRole('Manager')) {
            return [
                { path: '/manager/dashboard', name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
                { path: '/manager/team', name: 'My Team', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { path: '/manager/manage-task', name: 'Manage Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { path: '/manager/audit-report', name: 'Team Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ];
        } else {
            return [
                { path: '/employee/dashboard', name: 'My Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
                { path: '/employee/tasks', name: 'My Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
            ];
        }
    };

    // Calculate breadcrumbs from location path
    const getBreadcrumbs = () => {
        const parts = location.pathname.split('/').filter(p => p !== '');
        return parts.map((part, index) => {
            const path = '/' + parts.slice(0, index + 1).join('/');
            const name = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
            return { path, name };
        });
    };

    const handleLogout = () => {
        logout().then(() => navigate('/login'));
    };

    const menuLinks = getSidebarLinks();
    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">

            {/* COLLAPSIBLE SIDEBAR */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-30 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Brand Header */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <span className="text-md font-bold tracking-tight text-white animate-in fade-in duration-300">TMS</span>
                        )}
                    </div>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                    {menuLinks.map(link => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${isActive
                                        ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 font-bold shadow-md shadow-indigo-500/5'
                                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-slate-800'
                                    }`}
                            >
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={link.icon} />
                                </svg>
                                {sidebarOpen && <span className="truncate">{link.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer / Toggle button */}
                <div className="p-4 border-t border-slate-800 flex justify-center">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition shrink-0 cursor-pointer"
                        title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                    >
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTAINER FRAME */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300"
                style={{ paddingLeft: sidebarOpen ? '16rem' : '5rem' }}
            >
                {/* FIXED HEADER */}
                <header className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-850/60 px-6 py-3.5 flex items-center justify-between shrink-0">
                    {/* Left: Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs">
                        <Link to="/" className="text-slate-500 hover:text-slate-300">Home</Link>
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.path}>
                                <span className="text-slate-700">/</span>
                                <Link
                                    to={crumb.path}
                                    className={`hover:text-slate-300 ${idx === breadcrumbs.length - 1 ? 'text-indigo-400 font-semibold' : 'text-slate-500'
                                        }`}
                                >
                                    {crumb.name}
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Right: Actions & User Menu */}
                    <div className="flex items-center gap-4 relative">
                        {/* Desktop Notifications Toggle */}
                        {notificationsPermission !== 'granted' && (
                            <button
                                onClick={requestNotificationPermission}
                                className="text-[10px] bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 shrink-0"
                                title="Enable desktop notifications"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Enable Push
                            </button>
                        )}
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false); }}
                                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
                            </button>

                            {notificationOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-850 p-4 rounded-xl shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-850 mb-2">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                                        <span className="text-[10px] text-indigo-400 font-bold">1 New</span>
                                    </div>
                                    <div className="space-y-3 py-1">
                                        <div className="text-[11px] text-slate-300 leading-normal">
                                            <span className="font-semibold text-white block">Task Assigned</span>
                                            You were assigned 'Design System Database Schema'.
                                            <span className="text-[9px] text-slate-500 block mt-0.5">3 hours ago</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false); }}
                                className="flex items-center gap-2.5 p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl transition cursor-pointer"
                            >
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-md shadow-indigo-500/10">
                                    {user?.name?.slice(0, 2) || 'US'}
                                </div>
                                <span className="text-xs font-semibold text-slate-300 hidden sm:inline">{user?.name || 'User'}</span>
                                <svg className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-850 p-2.5 rounded-xl shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-2.5 py-2 border-b border-slate-850 mb-2">
                                        <span className="text-xs font-bold text-white block leading-none">{user?.name || 'User'}</span>
                                        <span className="text-[10px] text-slate-500 block mt-1">{user?.email || ''}</span>
                                        <span className="inline-block px-2 py-0.5 mt-2 bg-indigo-500/10 border border-indigo-500/20 text-[9px] uppercase font-bold tracking-widest text-indigo-400 rounded">
                                            {getRoleName()}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-2.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-slate-400 hover:text-rose-400 rounded-lg transition text-left cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* SCREEN CONTENT */}
                <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
