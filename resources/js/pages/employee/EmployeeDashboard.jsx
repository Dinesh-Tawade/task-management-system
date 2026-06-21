import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeeDashboard() {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadEmployeeData = async () => {
        setLoading(true);
        try {
            const [taskRes, logRes] = await Promise.all([
                axios.get('/tasks'),
                axios.get('/audit-logs') // audit-logs for Employee returns their personal logs
            ]);
            setTasks(taskRes.data.data);
            
            // Filter audit logs relating to this user
            setLogs(logRes.data.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching employee dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployeeData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const myTasksCount = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => {
        return t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date();
    }).length;

    const completionRate = myTasksCount > 0 ? Math.round((completedTasks / myTasksCount) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Personal Workspace</h2>
                <p className="text-slate-400 text-sm">Summary of your active workload, deadlines, and task updates</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">My Total Tasks</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">{myTasksCount}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pending Tasks</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">{pendingTasks}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Active Tasks</span>
                    <span className="text-3xl font-extrabold text-indigo-400 block mt-2">{inProgressTasks}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Completed Tasks</span>
                    <span className="text-3xl font-extrabold text-emerald-400 block mt-2">{completedTasks}</span>
                </div>
                <div className="bg-slate-900/60 border border-rose-950/40 p-5 rounded-2xl col-span-2 md:col-span-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Overdue Tasks</span>
                    <span className="text-3xl font-extrabold text-rose-400 block mt-2">{overdueTasks}</span>
                </div>
            </div>

            {/* Visual Progress Meter & Recent updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual completion meter */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-center justify-center space-y-5 text-center min-h-[300px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest w-full text-left">Task Completion Rate</h3>
                    
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" stroke-width="3.5" />
                            <circle 
                                cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" stroke-width="3.5" 
                                stroke-dasharray={`${completionRate} ${100 - completionRate}`}
                                stroke-dashoffset="0"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-3xl font-extrabold text-white">{completionRate}%</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">Finished</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">Great job! You have closed {completedTasks} of your {myTasksCount} total tasks.</p>
                </div>

                {/* Personal updates */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl space-y-5">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">My Recent Activity Logs</h3>
                        <p className="text-slate-500 text-[10px] mt-0.5">Summary of updates and logins from your account</p>
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
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 text-xs italic">No activity logged.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
