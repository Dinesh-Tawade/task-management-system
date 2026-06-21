import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeamManagement() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeTasks, setEmployeeTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/users?team_only=1');
            setTeam(response.data.data);
        } catch (error) {
            console.error('Error fetching team', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const viewEmployeeWorkload = async (emp) => {
        setSelectedEmployee(emp);
        setTasksLoading(true);
        try {
            const response = await axios.get(`/tasks?assigned_to=${emp.id}`);
            setEmployeeTasks(response.data.data);
        } catch (error) {
            console.error('Error loading employee tasks', error);
        } finally {
            setTasksLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'in-progress': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
            default: return 'bg-slate-800 text-slate-400 border border-slate-700/60';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Team Directory</h2>
                <p className="text-slate-400 text-sm">Review employee tasks completion rates and audit current workloads</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Team Members List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : team.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">No employees linked under your manager account.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-950 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                            <th className="px-6 py-4">Employee ID</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Work Progress</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-sm">
                                        {team.map(emp => {
                                            const total = emp.assigned_tasks_count || 0;
                                            const completed = emp.completed_tasks_count || 0;
                                            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-950/40 transition">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">
                                                        #{String(emp.id).padStart(4, '0')}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-white">
                                                        {emp.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-xs">
                                                        {emp.email}
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 shrink-0">
                                                                <div 
                                                                    className="bg-indigo-500 h-full rounded-full" 
                                                                    style={{ width: `${pct}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-300">{completed}/{total} Done ({pct}%)</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => viewEmployeeWorkload(emp)}
                                                            className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs px-2.5 py-1.5 hover:bg-indigo-500/10 rounded-lg transition border border-transparent hover:border-indigo-500/20 cursor-pointer"
                                                        >
                                                            Monitor Workload
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Employee Task Workload Detail Panel */}
                <div className="space-y-4">
                    {selectedEmployee ? (
                        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xl animate-in fade-in duration-200">
                            <div>
                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 block">Workload Detail</span>
                                <h3 className="font-bold text-white text-md mt-0.5">{selectedEmployee.name}</h3>
                                <p className="text-slate-400 text-xs mt-1">{selectedEmployee.email}</p>
                            </div>

                            <div className="border-t border-slate-850 pt-4 space-y-3.5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Task List</h4>
                                
                                {tasksLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : employeeTasks.length === 0 ? (
                                    <div className="text-slate-500 text-xs italic py-2">No tasks assigned to this employee.</div>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {employeeTasks.map(t => (
                                            <div key={t.id} className="bg-slate-950 border border-slate-850/80 p-3 rounded-xl space-y-2 text-xs">
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="font-bold text-slate-200 line-clamp-1">{t.title}</span>
                                                    <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${getPriorityColor(t.priority)}`}>
                                                        {t.priority}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] text-slate-500">
                                                    <span className="capitalize px-1.5 py-0.2 bg-slate-900 rounded border border-slate-800">{t.status}</span>
                                                    <span>Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No limit'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/20 border border-dashed border-slate-800/80 p-10 rounded-2xl text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[300px]">
                            <svg className="w-8 h-8 text-slate-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Select an employee to monitor their active tasks board.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
