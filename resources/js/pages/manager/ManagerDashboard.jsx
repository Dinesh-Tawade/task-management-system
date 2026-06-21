import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManagerDashboard() {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadManagerData = async () => {
        setLoading(true);
        try {
            // Fetch team-only tasks & audit logs
            const [taskRes, logRes] = await Promise.all([
                axios.get('/tasks?team_only=1'),
                axios.get('/audit-logs') // audit-logs already applies team scope for Managers
            ]);
            setTasks(taskRes.data.data);
            setLogs(logRes.data.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching manager data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadManagerData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Calculations
    const teamTasksCount = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => {
        return t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date();
    }).length;

    const completionRate = teamTasksCount > 0 ? Math.round((completedTasks / teamTasksCount) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Team Operations</h2>
                <p className="text-slate-400 text-sm">Monitor team tasks workload, track milestones, and view logs</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Team Tasks Workload</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">{teamTasksCount}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pending Tasks</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">{pendingTasks}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Completed Tasks</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-emerald-400">{completedTasks}</span>
                        <span className="text-[10px] text-slate-500">({completionRate}% Rate)</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 border border-rose-950/40 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Overdue Tasks</span>
                    <span className="text-3xl font-extrabold text-rose-400 block mt-2">{overdueTasks}</span>
                </div>
            </div>

            {/* Weekly progress and Team Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Weekly productivity graph */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Progress Chart</h3>
                    <div className="py-6 flex flex-col justify-between h-48 relative">
                        <svg className="w-full h-32" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" stroke-width="0.2" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" stroke-width="0.2" />
                            <line x1="0" y1="30" x2="100" y2="30" stroke="#1e293b" stroke-width="0.2" />
                            
                            <path d="M 0 30 L 16.6 22 L 33.3 25 L 50 18 L 66.6 10 L 83.3 8 L 100 4 L 100 30 Z" fill="url(#managerGrad)" opacity="0.15" />
                            <path d="M 0 30 Q 16.6 22, 33.3 25 T 66.6 10 T 100 4" fill="none" stroke="#818cf8" stroke-width="1.2" />
                            
                            <defs>
                                <linearGradient id="managerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#818cf8" />
                                    <stop offset="100%" stop-color="#020617" stop-opacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        <div className="flex justify-between text-[8px] uppercase font-bold tracking-wider text-slate-500 mt-2">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </div>

                {/* Team Logs */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-5">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Activities Logs</h3>
                        <p className="text-slate-500 text-[10px] mt-0.5">Timeline of updates made by your team members</p>
                    </div>

                    <div className="relative pl-5 border-l border-slate-800 space-y-4">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <div key={log.id} className="relative text-xs">
                                    <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                                    <div className="text-slate-300">
                                        {log.description}
                                    </div>
                                    <span className="text-[9px] text-slate-500 block mt-0.5">
                                        by {log.user?.name || 'System'} • {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 text-xs italic">No team activities logged.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
