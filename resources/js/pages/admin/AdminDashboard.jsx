import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [taskRes, userRes, logRes] = await Promise.all([
                axios.get('/tasks'),
                axios.get('/users'),
                axios.get('/audit-logs')
            ]);
            setTasks(taskRes.data.data);
            setUsers(userRes.data.data);
            setLogs(logRes.data.data.slice(0, 5)); // show latest 5
        } catch (error) {
            console.error('Error loading dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Calculations
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    const overdueTasks = tasks.filter(t => {
        return t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date();
    }).length;

    const totalEmployees = users.filter(u => u.roles.includes('Employee')).length;
    const totalManagers = users.filter(u => u.roles.includes('Manager')).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Insights
    // Sort employees by completed task counts
    const topEmployees = [...users]
        .filter(u => u.roles.includes('Employee'))
        .sort((a, b) => b.completed_tasks_count - a.completed_tasks_count)
        .slice(0, 3);

    // Overdue summary
    const overdueList = tasks.filter(t => {
        return t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date();
    }).slice(0, 3);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Organization Console</h2>
                <p className="text-slate-400 text-sm">Overall key performance metrics, employee stats, and system updates</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Staff Managers</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">{totalManagers}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Employees</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">{totalEmployees}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Completion Rate</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-emerald-400">{completionRate}%</span>
                        <span className="text-[10px] text-slate-500">({completedTasks}/{totalTasks})</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 border border-rose-950/40 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Overdue Tasks</span>
                    <span className="text-3xl font-extrabold text-rose-400 block mt-2">{overdueTasks}</span>
                    <div className="absolute -right-2 -bottom-2 text-rose-500/5 select-none">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Task KPIs Detail Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Pending Stage</span>
                    <span className="text-xl font-bold text-slate-300 block mt-1">{pendingTasks}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">In Progress Stage</span>
                    <span className="text-xl font-bold text-indigo-400 block mt-1">{inProgressTasks}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Completed Stage</span>
                    <span className="text-xl font-bold text-emerald-400 block mt-1">{completedTasks}</span>
                </div>
            </div>

            {/* Premium Custom SVG Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Task Status Pie/Donut Chart */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Status Distribution</h3>
                    <div className="flex flex-col items-center justify-center py-4">
                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                            {/* Base circle */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" stroke-width="3" />
                            
                            {/* Completed stroke (emerald) */}
                            {completedTasks > 0 && (
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" stroke-width="3.5" 
                                    stroke-dasharray={`${(completedTasks/totalTasks)*100} ${100 - (completedTasks/totalTasks)*100}`}
                                    stroke-dashoffset="0"
                                />
                            )}

                            {/* In Progress stroke (indigo) */}
                            {inProgressTasks > 0 && (
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" stroke-width="3.5" 
                                    stroke-dasharray={`${(inProgressTasks/totalTasks)*100} ${100 - (inProgressTasks/totalTasks)*100}`}
                                    stroke-dashoffset={`${-((completedTasks/totalTasks)*100)}`}
                                />
                            )}

                            {/* Pending stroke (slate) */}
                            {pendingTasks > 0 && (
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" stroke="#64748b" stroke-width="3.5" 
                                    stroke-dasharray={`${(pendingTasks/totalTasks)*100} ${100 - (pendingTasks/totalTasks)*100}`}
                                    stroke-dashoffset={`${-(((completedTasks+inProgressTasks)/totalTasks)*100)}`}
                                />
                            )}
                        </svg>
                        
                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-3 text-[10px] uppercase font-bold tracking-wider mt-6 w-full text-center">
                            <div className="flex flex-col items-center">
                                <span className="w-2.5 h-2.5 rounded bg-emerald-500 mb-1"></span>
                                <span className="text-slate-400">Done ({completedTasks})</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="w-2.5 h-2.5 rounded bg-indigo-500 mb-1"></span>
                                <span className="text-slate-400">Active ({inProgressTasks})</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="w-2.5 h-2.5 rounded bg-slate-500 mb-1"></span>
                                <span className="text-slate-400">Pending ({pendingTasks})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Monthly Task Completion trend (SVG Line Chart simulation) */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Completion Trend</h3>
                    <div className="py-6 flex flex-col justify-between h-48 relative">
                        <svg className="w-full h-32" viewBox="0 0 100 30" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" stroke-width="0.2" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" stroke-width="0.2" />
                            <line x1="0" y1="30" x2="100" y2="30" stroke="#1e293b" stroke-width="0.2" />
                            
                            {/* Glow area */}
                            <path d="M 0 30 L 10 24 L 30 25 L 50 15 L 70 8 L 90 4 L 100 2 L 100 30 Z" fill="url(#grad)" opacity="0.15" />
                            
                            {/* Line path */}
                            <path d="M 0 30 Q 10 24, 30 25 T 50 15 T 70 8 T 90 4 T 100 2" fill="none" stroke="#6366f1" stroke-width="1" />
                            
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#6366f1" />
                                    <stop offset="100%" stop-color="#020617" stop-opacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        {/* Month labels */}
                        <div className="flex justify-between text-[8px] uppercase font-bold tracking-wider text-slate-500 mt-2">
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                        </div>
                    </div>
                </div>

                {/* 3. Employee Performance (SVG Bar Chart) */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Employee Performance</h3>
                    <div className="space-y-3.5 py-2">
                        {topEmployees.map(emp => {
                            const total = emp.assigned_tasks_count || 1;
                            const completed = emp.completed_tasks_count || 0;
                            const pct = Math.round((completed / total) * 100);
                            return (
                                <div key={emp.id} className="space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center text-slate-300">
                                        <span className="font-semibold">{emp.name}</span>
                                        <span className="font-bold text-emerald-400">{completed} / {total} Done ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                        <div 
                                            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.max(5, pct)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer sections: Recent Activity timeline vs Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Section: Recent Activity Timeline */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-5">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent System Activity</h3>
                        <p className="text-slate-500 text-[10px] mt-0.5">Timeline of system-wide audits and log updates</p>
                    </div>

                    <div className="relative pl-5 border-l border-slate-800 space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="relative text-xs">
                                <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                                <div className="text-slate-300">
                                    {log.description}
                                </div>
                                <span className="text-[9px] text-slate-500 block mt-0.5">
                                    by {log.user?.name || 'System'} • {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Performance Insights */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Performance Insights</h3>
                        <p className="text-slate-500 text-[10px] mt-0.5">Flagged alerts and system health updates</p>
                    </div>

                    <div className="space-y-4">
                        {/* Overdue Task Highlight Card */}
                        {overdueList.length > 0 ? (
                            <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl text-xs space-y-2">
                                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Urgent: Overdue Tasks Flagged
                                </div>
                                <ul className="space-y-1.5 text-slate-300">
                                    {overdueList.map(t => (
                                        <li key={t.id} className="flex justify-between items-center">
                                            <span className="truncate pr-4">• {t.title}</span>
                                            <span className="text-rose-400 font-medium font-mono">
                                                {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'Expired'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                All system tasks are progressing on time!
                            </div>
                        )}

                        {/* Top Performer Card */}
                        {topEmployees[0] && (
                            <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl text-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-400 block">Top Performer</span>
                                    <span className="font-bold text-white block text-sm">{topEmployees[0].name}</span>
                                    <span className="text-slate-400 text-[10px] block">Lead developer in task closure rate</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-indigo-400 block">{topEmployees[0].completed_tasks_count}</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Tasks Completed</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
